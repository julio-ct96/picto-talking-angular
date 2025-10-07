import { inject, Injectable } from '@angular/core';

import { SpeechPreferencesEntity } from '../../domain/entities/speech-preferences.entity';
import { SpeechPreferencesPersistenceError } from '../../domain/errors/speech.errors';
import { SPEECH_PREFERENCES_PORT, SpeechPreferencesPort } from '../ports/speech-preferences.port';

@Injectable({ providedIn: 'root' })
export class SaveSpeechPreferencesUseCase {
  private readonly preferencesPort = inject<SpeechPreferencesPort>(SPEECH_PREFERENCES_PORT);

  async execute(preferences: SpeechPreferencesEntity): Promise<void> {
    try {
      await this.preferencesPort.save(preferences);
    } catch (error) {
      throw new SpeechPreferencesPersistenceError('Failed to persist speech preferences', error);
    }
  }
}
