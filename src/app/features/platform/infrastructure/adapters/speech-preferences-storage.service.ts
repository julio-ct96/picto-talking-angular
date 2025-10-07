import { Injectable } from '@angular/core';

import { SpeechPreferencesEntity } from '../../domain/entities/speech-preferences.entity';
import { ARASAAC_LOCALES, LocaleCode } from '../../domain/value-objects/locale-code';
import { SpeechPreferencesPort } from '../../application/ports/speech-preferences.port';

type StoredSpeechPreferences = {
  readonly locale: string;
  readonly voiceId: string | null;
  readonly rate: number;
  readonly pitch: number;
  readonly volume: number;
};

@Injectable()
export class SpeechPreferencesStorageService implements SpeechPreferencesPort {
  private static readonly STORAGE_KEY = 'platform.speech.preferences';

  private readonly supportedLocales = new Set<LocaleCode>(ARASAAC_LOCALES);

  async load(): Promise<SpeechPreferencesEntity | null> {
    const storage = this.getStorage();
    if (!storage) {
      return null;
    }

    const raw = storage.getItem(SpeechPreferencesStorageService.STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as StoredSpeechPreferences;
      const locale = this.toLocaleCode(parsed.locale);

      return SpeechPreferencesEntity.fromSnapshot({
        locale,
        voiceId: parsed.voiceId,
        rate: parsed.rate,
        pitch: parsed.pitch,
        volume: parsed.volume,
      });
    } catch (error) {
      throw new Error(
        `Unable to parse stored speech preferences: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );
    }
  }

  async save(preferences: SpeechPreferencesEntity): Promise<void> {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    const snapshot = preferences.toSnapshot();
    const payload: StoredSpeechPreferences = {
      locale: snapshot.locale,
      voiceId: snapshot.voiceId,
      rate: snapshot.rate,
      pitch: snapshot.pitch,
      volume: snapshot.volume,
    };

    try {
      storage.setItem(SpeechPreferencesStorageService.STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      throw new Error(
        `Unable to persist speech preferences: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }

  private getStorage(): Storage | null {
    if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
      return null;
    }

    try {
      return globalThis.localStorage;
    } catch {
      return null;
    }
  }

  private toLocaleCode(locale: string | null | undefined): LocaleCode {
    if (!locale) {
      return 'en';
    }

    const normalized = locale.split(/[-_]/)[0]?.toLowerCase() ?? 'en';

    if (this.supportedLocales.has(normalized as LocaleCode)) {
      return normalized as LocaleCode;
    }

    return 'en';
  }
}
