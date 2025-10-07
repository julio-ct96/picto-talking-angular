import { inject, Injectable } from '@angular/core';

import { SpeechVoiceEntity } from '../../domain/entities/speech-voice.entity';
import { LocaleCode } from '../../domain/value-objects/locale-code';
import { SPEECH_ENGINE, SpeechEnginePort } from '../ports/speech-engine.port';

@Injectable({ providedIn: 'root' })
export class ListSpeechVoicesUseCase {
  private readonly engine = inject<SpeechEnginePort>(SPEECH_ENGINE);

  execute(locale?: LocaleCode): Promise<readonly SpeechVoiceEntity[]> {
    return this.engine.listVoices(locale);
  }
}
