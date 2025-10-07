import { InjectionToken } from '@angular/core';

import { SpeechRequestEntity } from '../../domain/entities/speech-request.entity';
import { SpeechVoiceEntity } from '../../domain/entities/speech-voice.entity';
import { LocaleCode } from '../../domain/value-objects/locale-code';

export interface SpeechPlaybackResult {
  readonly success: boolean;
  readonly fallbackUsed: boolean;
}

export interface SpeechEnginePort {
  supportsSpeechSynthesis(): boolean;
  listVoices(locale?: LocaleCode): Promise<readonly SpeechVoiceEntity[]>;
  speak(request: SpeechRequestEntity): Promise<SpeechPlaybackResult>;
  cancelAll(): void;
}

export const SPEECH_ENGINE = new InjectionToken<SpeechEnginePort>('SPEECH_ENGINE');
