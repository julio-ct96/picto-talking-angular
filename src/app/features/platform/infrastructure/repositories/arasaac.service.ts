import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { MaterialEntity } from '../../domain/entities/material.entity';
import { KeywordEntity } from '../../domain/entities/keyword.entity';
import { PictogramEntity } from '../../domain/entities/pictogram.entity';
import {
  ArasaacRepository,
  GetNewItemsParams,
  GetPictogramDetailsParams,
  NewItemsResult,
  PictogramOptions,
  SearchMaterialsParams,
  SearchPictogramsParams,
} from '../../application/ports/arasaac.repository';
import { LocaleCode } from '../../domain/value-objects/locale-code';
import { MaterialDto } from '../dto/material.dto';
import { PictogramDto } from '../dto/pictogram.dto';
import { KeywordsResponseDto } from '../dto/keywords-response.dto';
import { GetMaterialResponseDto } from '../dto/get-material-response.dto';
import { mapKeywordStringToEntity } from '../mappers/keyword.mapper';
import { mapPictogramDtoToEntity } from '../mappers/pictogram.mapper';
import { mapMaterialDtoToEntity } from '../mappers/material.mapper';
import {
  ArasaacServiceError,
  CircuitBreakerOpenError,
  RateLimitExceededError,
  ServiceUnavailableError,
  UnknownArasaacError,
} from '../../domain/errors/arasaac.errors';
import { ARASAAC_API_BASE_URL } from '../providers/arasaac.tokens';

type CacheValue<T> = {
  readonly value: T;
  readonly expiresAt: number;
};

enum CircuitState {
  CLOSED = 'CLOSED',
  HALF_OPEN = 'HALF_OPEN',
  OPEN = 'OPEN',
}

interface RequestConfig<T> {
  readonly cacheKey: string;
  readonly ttlMs?: number;
  readonly call: () => Promise<T>;
  readonly fallbackToStale?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ArasaacService implements ArasaacRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(ARASAAC_API_BASE_URL);

  private readonly cache = new Map<string, CacheValue<unknown>>();
  private readonly staleCache = new Map<string, unknown>();
  private readonly inFlight = new Map<string, Promise<unknown>>();

  private readonly defaultTtlMs = 15 * 60 * 1000;
  private readonly maxRetries = 2;
  private readonly retryBackoffMs = 500;
  private readonly circuitBreakerThreshold = 3;
  private readonly circuitBreakerCooldownMs = 30_000;

  private circuitState: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private nextAttemptAt = 0;

  fetchKeywords(language: LocaleCode): Promise<readonly KeywordEntity[]> {
    const cacheKey = this.buildCacheKey('keywords', { language });
    return this.runWithResilience({
      cacheKey,
      call: async () => {
        const url = this.buildUrl(`/keywords/${language}`);
        const response = await this.httpGet<KeywordsResponseDto>(url);
        const words = response?.words ?? [];
        return words.map(mapKeywordStringToEntity);
      },
    });
  }

  searchPictograms(params: SearchPictogramsParams): Promise<readonly PictogramEntity[]> {
    const cacheKey = this.buildCacheKey('pictograms-search', params);
    return this.runWithResilience({
      cacheKey,
      call: async () => {
        const url = this.buildUrl(
          params.strategy === 'best'
            ? `/pictograms/${params.language}/bestsearch/${encodeURIComponent(params.term)}`
            : `/pictograms/${params.language}/search/${encodeURIComponent(params.term)}`,
        );
        const httpParams = this.buildPictogramOptions(params.options);
        const response = await this.httpGet<readonly PictogramDto[]>(url, httpParams);
        return (response ?? []).map(mapPictogramDtoToEntity);
      },
    });
  }

  async getPictogramDetails(
    params: GetPictogramDetailsParams,
  ): Promise<PictogramEntity | readonly PictogramEntity[]> {
    const cacheKey = this.buildCacheKey('pictogram-details', params);
    return this.runWithResilience({
      cacheKey,
      call: async () => {
        if (params.locales && params.locales.length > 0) {
          const url = this.buildUrl(
            `/pictograms/${params.id}/languages/${params.locales.join(',')}`,
          );
          const httpParams = this.buildPictogramOptions(params.options);
          const response = await this.httpGet<readonly PictogramDto[]>(url, httpParams);
          return (response ?? []).map(mapPictogramDtoToEntity);
        }

        const url = this.buildUrl(`/pictograms/${params.language}/${params.id}`);
        const httpParams = this.buildPictogramOptions(params.options);
        const response = await this.httpGet<PictogramDto>(url, httpParams);
        return mapPictogramDtoToEntity(response ?? {});
      },
    });
  }

  searchMaterials(params: SearchMaterialsParams): Promise<readonly MaterialEntity[]> {
    const cacheKey = this.buildCacheKey('materials-search', params);
    return this.runWithResilience({
      cacheKey,
      call: async () => {
        const url = this.buildUrl(
          `/materials/${params.language}/${encodeURIComponent(params.term)}`,
        );
        const response = await this.httpGet<readonly MaterialDto[]>(url);
        const materials = (response ?? []).map(mapMaterialDtoToEntity);

        const filtered = params.days
          ? this.filterMaterialsByDays(materials, params.days)
          : materials;

        if (params.limit && params.limit > 0) {
          return filtered.slice(0, params.limit);
        }

        return filtered;
      },
    });
  }

  getMaterialById(id: number): Promise<MaterialEntity> {
    const cacheKey = this.buildCacheKey('material-detail', { id });
    return this.runWithResilience({
      cacheKey,
      call: async () => {
        const url = this.buildUrl(`/materials/${id}`);
        const response = await this.httpGet<GetMaterialResponseDto>(url);
        return mapMaterialDtoToEntity(response?.material ?? {});
      },
    });
  }

  getNewItems<TType extends GetNewItemsParams['type']>(
    params: GetNewItemsParams<TType>,
  ): Promise<NewItemsResult<TType>> {
    const cacheKey = this.buildCacheKey('new-items', params);
    return this.runWithResilience({
      cacheKey,
      call: async () => {
        if (this.isMaterialsParams(params)) {
          const data = await this.getNewMaterials(params);
          return data as NewItemsResult<TType>;
        }

        if (this.isPictogramsParams(params)) {
          const data = await this.getNewPictograms(params);
          return data as NewItemsResult<TType>;
        }

        throw new Error('Unsupported new items type');
      },
    });
  }

  private async getNewMaterials(
    params: GetNewItemsParams<'materials'>,
  ): Promise<readonly MaterialEntity[]> {
    if (params.window && params.window > 0) {
      const url = this.buildUrl(`/materials/days/${params.window}`);
      const response = await this.httpGet<readonly MaterialDto[]>(url);
      const materials = (response ?? []).map(mapMaterialDtoToEntity);
      if (params.limit && params.limit > 0) {
        return materials.slice(0, params.limit);
      }
      return materials;
    }

    const limit = params.limit && params.limit > 0 ? params.limit : 30;
    const url = this.buildUrl(`/materials/new/${limit}`);
    const response = await this.httpGet<readonly MaterialDto[]>(url);
    return (response ?? []).map(mapMaterialDtoToEntity);
  }

  private async getNewPictograms(
    params: GetNewItemsParams<'pictograms'>,
  ): Promise<readonly PictogramEntity[]> {
    if (params.window && params.window > 0) {
      const url = this.buildUrl(`/pictograms/${params.language}/days/${params.window}`);
      const response = await this.httpGet<readonly PictogramDto[]>(url);
      const pictograms = (response ?? []).map(mapPictogramDtoToEntity);
      if (params.limit && params.limit > 0) {
        return pictograms.slice(0, params.limit);
      }
      return pictograms;
    }

    const limit = params.limit && params.limit > 0 ? params.limit : 30;
    const url = this.buildUrl(`/pictograms/${params.language}/new/${limit}`);
    const response = await this.httpGet<readonly PictogramDto[]>(url);
    return (response ?? []).map(mapPictogramDtoToEntity);
  }

  private isMaterialsParams(
    params: GetNewItemsParams<GetNewItemsParams['type']>,
  ): params is GetNewItemsParams<'materials'> {
    return params.type === 'materials';
  }

  private isPictogramsParams(
    params: GetNewItemsParams<GetNewItemsParams['type']>,
  ): params is GetNewItemsParams<'pictograms'> {
    return params.type === 'pictograms';
  }

  private async runWithResilience<T>(config: RequestConfig<T>): Promise<T> {
    if (this.isCircuitOpen()) {
      const stale = this.getStaleValue<T>(config.cacheKey);
      if (stale !== null) {
        return stale;
      }
      throw new CircuitBreakerOpenError(new Date(this.nextAttemptAt));
    }

    const cached = this.getCachedValue<T>(config.cacheKey);
    if (cached !== null) {
      return cached;
    }

    const existing = this.inFlight.get(config.cacheKey) as Promise<T> | undefined;
    if (existing) {
      return existing;
    }

    const request = this.executeWithRetry(config.call)
      .then((value) => {
        this.onSuccess();
        this.storeInCache(config.cacheKey, value, config.ttlMs ?? this.defaultTtlMs);
        return value;
      })
      .catch((error: unknown) => {
        const mappedError = this.toArasaacError(error);
        this.onFailure(mappedError);
        const stale = this.getStaleValue<T>(config.cacheKey);
        if (stale !== null) {
          return stale;
        }
        throw mappedError;
      })
      .finally(() => {
        this.inFlight.delete(config.cacheKey);
      });

    this.inFlight.set(config.cacheKey, request as Promise<unknown>);
    return request;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.circuitState = CircuitState.CLOSED;
  }

  private onFailure(error: ArasaacServiceError): void {
    if (error instanceof RateLimitExceededError) {
      this.openCircuit();
      return;
    }

    this.failureCount += 1;
    if (this.failureCount >= this.circuitBreakerThreshold) {
      this.openCircuit();
    }
  }

  private openCircuit(): void {
    this.circuitState = CircuitState.OPEN;
    this.nextAttemptAt = Date.now() + this.circuitBreakerCooldownMs;
  }

  private isCircuitOpen(): boolean {
    if (this.circuitState === CircuitState.OPEN && Date.now() >= this.nextAttemptAt) {
      this.circuitState = CircuitState.HALF_OPEN;
      return false;
    }

    return this.circuitState === CircuitState.OPEN;
  }

  private async executeWithRetry<T>(factory: () => Promise<T>): Promise<T> {
    let attempt = 0;
    let lastError: unknown = null;
    const totalAttempts = this.maxRetries + 1;

    while (attempt < totalAttempts) {
      try {
        return await factory();
      } catch (error) {
        lastError = error;
        attempt += 1;

        if (!this.shouldRetry(error, attempt < totalAttempts)) {
          break;
        }

        const backoff = this.retryBackoffMs * Math.pow(2, attempt - 1);
        await this.delay(backoff);
      }
    }

    throw lastError;
  }

  private shouldRetry(error: unknown, hasRemainingAttempts: boolean): boolean {
    if (!hasRemainingAttempts) {
      return false;
    }

    if (error instanceof RateLimitExceededError) {
      return true;
    }

    if (error instanceof ServiceUnavailableError) {
      return true;
    }

    if (error instanceof ArasaacServiceError) {
      return false;
    }

    if (error instanceof HttpErrorResponse) {
      const retryableStatuses = new Set([429, 500, 502, 503, 504, 0]);
      return retryableStatuses.has(error.status);
    }

    return false;
  }

  private toArasaacError(error: unknown): ArasaacServiceError {
    if (error instanceof ArasaacServiceError) {
      return error;
    }

    if (error instanceof HttpErrorResponse) {
      if (error.status === 429) {
        const retryAfterHeader = error.headers.get('Retry-After');
        const retryAfterSeconds =
          retryAfterHeader !== null
            ? Number.parseInt(retryAfterHeader, 10) || null
            : null;
        return new RateLimitExceededError(undefined, {
          retryAfterSeconds,
          cause: error,
        });
      }

      if (error.status === 503) {
        return new ServiceUnavailableError(undefined, error);
      }

      return new UnknownArasaacError(this.buildHttpErrorMessage(error), error);
    }

    return new UnknownArasaacError('Unhandled ARASAAC error.', error);
  }

  private buildHttpErrorMessage(error: HttpErrorResponse): string {
    const status = error.status !== undefined ? String(error.status) : '0';
    const statusText = error.statusText || 'Unknown error';
    return `ARASAAC HTTP error ${status}: ${statusText}`;
  }

  private getCachedValue<T>(cacheKey: string): T | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) {
      return null;
    }

    if (cached.expiresAt < Date.now()) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.value as T;
  }

  private getStaleValue<T>(cacheKey: string): T | null {
    if (!this.staleCache.has(cacheKey)) {
      return null;
    }

    return this.staleCache.get(cacheKey) as T;
  }

  private storeInCache<T>(cacheKey: string, value: T, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(cacheKey, { value, expiresAt });
    this.staleCache.set(cacheKey, value);
  }

  private buildCacheKey(operation: string, payload: unknown): string {
    return `${operation}::${this.stableStringify(payload)}`;
  }

  private stableStringify(value: unknown): string {
    if (value === null || typeof value !== 'object') {
      return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableStringify(item)).join(',')}]`;
    }

    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return `{${entries
      .map(([key, val]) => `${JSON.stringify(key)}:${this.stableStringify(val)}`)
      .join(',')}}`;
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private buildPictogramOptions(options?: PictogramOptions): HttpParams | undefined {
    if (!options) {
      return undefined;
    }

    let params = new HttpParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      params = params.set(key, String(value));
    });

    return params;
  }

  private filterMaterialsByDays(
    materials: readonly MaterialEntity[],
    days: number,
  ): readonly MaterialEntity[] {
    const windowMs = days * 24 * 60 * 60 * 1000;
    const now = Date.now();

    return materials.filter((material) => {
      const lastUpdated = material.lastUpdatedAt ?? material.createdAt;
      if (!lastUpdated) {
        return false;
      }

      return now - lastUpdated.getTime() <= windowMs;
    });
  }

  private async httpGet<T>(url: string, params?: HttpParams): Promise<T> {
    const request$ = this.http.get<T>(url, {
      params,
      withCredentials: false,
    });
    return firstValueFrom(request$);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
