import { inject, Injectable } from '@angular/core';

import { SPEECH_ENGINE, SpeechEnginePort } from '../ports/speech-engine.port';

@Injectable({ providedIn: 'root' })
export class CancelSpeechPlaybackUseCase {
  private readonly engine = inject<SpeechEnginePort>(SPEECH_ENGINE);

  execute(): void {
    this.engine.cancelAll();
  }
}
