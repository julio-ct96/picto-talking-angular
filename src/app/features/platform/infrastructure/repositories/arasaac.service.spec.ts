import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { ArasaacService } from './arasaac.service';
import { providePlatformData } from '../providers/platform.providers';
import { ARASAAC_API_BASE_URL } from '../providers/arasaac.tokens';
import { RateLimitExceededError, CircuitBreakerOpenError, UnknownArasaacError } from '../../domain/errors/arasaac.errors';

describe('ArasaacService', () => {
  let service: ArasaacService;
  let httpMock: HttpTestingController;
  let dateNowSpy: jest.SpyInstance<number, []>;
  let delaySpy: jest.SpyInstance<Promise<void>, [number]>;
  let mockNow = 1_000;

  const advanceTime = (ms: number): void => {
    mockNow += ms;
  };

  beforeEach(() => {
    mockNow = 1_000;
    dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => mockNow);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        providePlatformData(),
        {
          provide: ARASAAC_API_BASE_URL,
          useValue: 'https://api.arasaac.org/v1'
        }
      ]
    });

    service = TestBed.inject(ArasaacService);
    httpMock = TestBed.inject(HttpTestingController);
    delaySpy = jest.spyOn(service as unknown as { delay(ms: number): Promise<void> }, 'delay').mockImplementation(() =>
      Promise.resolve()
    );
  });

  afterEach(() => {
    httpMock.verify();
    dateNowSpy.mockRestore();
    delaySpy.mockRestore();
  });

  it('caches keyword responses within the TTL window', async () => {
    const first = service.fetchKeywords('en');
    const firstRequest = httpMock.expectOne('https://api.arasaac.org/v1/keywords/en');
    firstRequest.flush({ locale: 'en', words: ['apple', 'banana'] });

    const firstResult = await first;
    expect(firstResult).toHaveLength(2);
    expect(firstResult[0].label).toBe('apple');

    const second = service.fetchKeywords('en');

    const secondResult = await second;
    expect(secondResult).toBe(firstResult);
    httpMock.expectNone('https://api.arasaac.org/v1/keywords/en');
  });

  it('falls back to stale cache when the upstream request fails after TTL expiry', async () => {
    const initial = service.searchMaterials({ language: 'en', term: 'food' });
    const firstRequest = httpMock.expectOne('https://api.arasaac.org/v1/materials/en/food');
    firstRequest.flush([
      {
        id: 1,
        title: 'Breakfast',
        desc: 'Morning materials'
      }
    ]);

    const initialResult = await initial;
    expect(initialResult).toHaveLength(1);
    expect(initialResult[0].title).toBe('Breakfast');

    advanceTime(15 * 60 * 1000 + 1);

    const secondPromise = service.searchMaterials({ language: 'en', term: 'food' });
    const secondRequest = httpMock.expectOne('https://api.arasaac.org/v1/materials/en/food');
    secondRequest.flush('error', {
      status: 400,
      statusText: 'Bad Request'
    });

    await expect(secondPromise).resolves.toStrictEqual(initialResult);
  });

  it('opens the circuit breaker after three consecutive failures', async () => {
    const attempt = async () => {
      const promise = service.fetchKeywords('fr').catch((error) => {
        throw error;
      });
      const req = httpMock.expectOne('https://api.arasaac.org/v1/keywords/fr');
      req.flush('error', { status: 400, statusText: 'Bad Request' });
      return promise;
    };

    await expect(attempt()).rejects.toBeInstanceOf(UnknownArasaacError);
    await expect(attempt()).rejects.toBeInstanceOf(UnknownArasaacError);
    await expect(attempt()).rejects.toBeInstanceOf(UnknownArasaacError);

    await expect(service.fetchKeywords('fr')).rejects.toBeInstanceOf(CircuitBreakerOpenError);
    httpMock.expectNone('https://api.arasaac.org/v1/keywords/fr');
  });

  it('maps 429 responses to RateLimitExceededError', async () => {
    const httpGetSpy = jest
      .spyOn(service as unknown as { httpGet<T>(url: string): Promise<T> }, 'httpGet')
      .mockRejectedValue(
        new HttpErrorResponse({
          status: 429,
          statusText: 'Too Many Requests',
          headers: new HttpHeaders({
            'Retry-After': '10'
          }),
          url: 'https://api.arasaac.org/v1/keywords/es'
        })
      );

    await expect(service.fetchKeywords('es')).rejects.toBeInstanceOf(RateLimitExceededError);
    expect(httpGetSpy).toHaveBeenCalled();
    httpGetSpy.mockRestore();
  });
});
