import { InjectionToken } from '@angular/core';

import { SpeechPreferencesEntity } from '../../domain/entities/speech-preferences.entity';

export interface SpeechPreferencesPort {
  load(): Promise<SpeechPreferencesEntity | null>;
  save(preferences: SpeechPreferencesEntity): Promise<void>;
}

export const SPEECH_PREFERENCES_PORT = new InjectionToken<SpeechPreferencesPort>(
  'SPEECH_PREFERENCES_PORT',
);
