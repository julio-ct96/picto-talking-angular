import { inject, Injectable } from '@angular/core';

import { SpeechPreferencesEntity } from '../../domain/entities/speech-preferences.entity';
import { LocaleCode } from '../../domain/value-objects/locale-code';
import { SpeechPreferencesPersistenceError } from '../../domain/errors/speech.errors';
import { SPEECH_PREFERENCES_PORT, SpeechPreferencesPort } from '../ports/speech-preferences.port';

@Injectable({ providedIn: 'root' })
export class LoadSpeechPreferencesUseCase {
  private readonly preferencesPort = inject<SpeechPreferencesPort>(SPEECH_PREFERENCES_PORT);

  async execute(fallbackLocale: LocaleCode): Promise<SpeechPreferencesEntity> {
    try {
      const stored = await this.preferencesPort.load();
      if (!stored) {
        return SpeechPreferencesEntity.createDefault(fallbackLocale);
      }

      return stored;
    } catch (error) {
      throw new SpeechPreferencesPersistenceError('Failed to load speech preferences', error);
    }
  }
}
