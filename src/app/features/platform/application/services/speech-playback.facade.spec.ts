import { TestBed } from '@angular/core/testing';

import { FEATURE_FLAG_PORT, FeatureFlagPort } from '../../application/ports/feature-flag.port';
import { SPEECH_ENGINE, SpeechEnginePort, SpeechPlaybackResult } from '../../application/ports/speech-engine.port';
import { SPEECH_PREFERENCES_PORT, SpeechPreferencesPort } from '../../application/ports/speech-preferences.port';
import { SPEECH_TELEMETRY_PORT, SpeechTelemetryPort } from '../../application/ports/speech-telemetry.port';
import { SpeechPreferencesEntity } from '../../domain/entities/speech-preferences.entity';
import { SpeechRequestEntity } from '../../domain/entities/speech-request.entity';
import { LocaleCode } from '../../domain/value-objects/locale-code';
import { SpeechPlaybackFacade } from './speech-playback.facade';
import { BuildSpeechRequestUseCase } from '../use-cases/build-speech-request.use-case';
import { LoadSpeechPreferencesUseCase } from '../use-cases/load-speech-preferences.use-case';
import { SaveSpeechPreferencesUseCase } from '../use-cases/save-speech-preferences.use-case';
import { ListSpeechVoicesUseCase } from '../use-cases/list-speech-voices.use-case';
import { CancelSpeechPlaybackUseCase } from '../use-cases/cancel-speech-playback.use-case';

async function flushAsync(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

class MockSpeechEngine implements SpeechEnginePort {
  readonly speakRequests: SpeechRequestEntity[] = [];
  private readonly resolvers: Array<(result: SpeechPlaybackResult) => void> = [];
  private fallbackResult: SpeechPlaybackResult | null = null;

  supportsSpeechSynthesis(): boolean {
    return true;
  }

  async listVoices(): Promise<readonly never[]> {
    return [];
  }

  speak(request: SpeechRequestEntity): Promise<SpeechPlaybackResult> {
    this.speakRequests.push(request);

    return new Promise<SpeechPlaybackResult>((resolve) => {
      const result = this.fallbackResult ?? { success: true, fallbackUsed: false };
      this.resolvers.push(resolve.bind(null, result));
    });
  }

  cancelAll(): void {
    this.speakRequests.length = 0;
  }

  resolveNext(result?: SpeechPlaybackResult): void {
    const resolver = this.resolvers.shift();
    if (resolver) {
      resolver(result ?? { success: true, fallbackUsed: false });
    }
  }

  forceFallback(result: SpeechPlaybackResult): void {
    this.fallbackResult = result;
  }
}

class MockFeatureFlagPort implements FeatureFlagPort {
  isEnabled(): boolean {
    return true;
  }
}

class MockSpeechTelemetry implements SpeechTelemetryPort {
  readonly warnings: Array<{ message: string; context?: Record<string, unknown> }> = [];
  readonly events: Array<{ name: string; payload?: Record<string, unknown> }> = [];

  trackEvent(eventName: string, payload?: Record<string, unknown>): void {
    this.events.push({ name: eventName, payload });
  }

  logWarning(message: string, context?: Record<string, unknown>): void {
    this.warnings.push({ message, context });
  }

  logError(): void {
    // noop for tests
  }
}

class MockSpeechPreferencesPort implements SpeechPreferencesPort {
  private stored: SpeechPreferencesEntity | null = SpeechPreferencesEntity.createDefault('en');

  async load(): Promise<SpeechPreferencesEntity | null> {
    return this.stored;
  }

  async save(preferences: SpeechPreferencesEntity): Promise<void> {
    this.stored = preferences;
  }

  snapshot(): SpeechPreferencesEntity | null {
    return this.stored;
  }
}

describe('SpeechPlaybackFacade', () => {
  let engine: MockSpeechEngine;
  let telemetry: MockSpeechTelemetry;
  let preferencesPort: MockSpeechPreferencesPort;
  let facade: SpeechPlaybackFacade;

  beforeEach(() => {
    engine = new MockSpeechEngine();
    telemetry = new MockSpeechTelemetry();
    preferencesPort = new MockSpeechPreferencesPort();

    TestBed.configureTestingModule({
      providers: [
        SpeechPlaybackFacade,
        BuildSpeechRequestUseCase,
        LoadSpeechPreferencesUseCase,
        SaveSpeechPreferencesUseCase,
        ListSpeechVoicesUseCase,
        CancelSpeechPlaybackUseCase,
        { provide: SPEECH_ENGINE, useValue: engine },
        { provide: SPEECH_TELEMETRY_PORT, useValue: telemetry },
        { provide: SPEECH_PREFERENCES_PORT, useValue: preferencesPort },
        { provide: FEATURE_FLAG_PORT, useClass: MockFeatureFlagPort },
      ],
    });

    facade = TestBed.inject(SpeechPlaybackFacade);
  });

  it('plays queued requests sequentially', async () => {
    await facade.requestSpeech({ text: 'Hello', locale: 'en' });
    await flushAsync();
    await facade.requestSpeech({ text: 'World', locale: 'en' });
    await flushAsync();

    expect(engine.speakRequests).toHaveLength(1);
    expect(engine.speakRequests[0].text).toBe('Hello');

    engine.resolveNext();
    await flushAsync();

    expect(engine.speakRequests).toHaveLength(2);
    expect(engine.speakRequests[1].text).toBe('World');
  });

  it('persists voice preference updates', async () => {
    const voiceId = 'en-voice';
    const locale: LocaleCode = 'en';

    await facade.setVoice(voiceId, locale);

    const stored = preferencesPort.snapshot();
    expect(stored?.voiceId).toBe(voiceId);
    expect(stored?.locale).toBe(locale);
  });

  it('logs warning when playback falls back', async () => {
    engine.forceFallback({ success: false, fallbackUsed: true });

    await facade.requestSpeech({ text: 'Test', locale: 'en' });
    await flushAsync();
    engine.resolveNext({ success: false, fallbackUsed: true });
    await flushAsync();

    const warning = telemetry.warnings.find(
      (entry) => entry.message === 'speech-playback-fallback-triggered',
    );
    expect(warning).toBeDefined();
    const failureEvent = telemetry.events.find((entry) => entry.name === 'speech.playback.failed');
    expect(failureEvent).toBeDefined();
  });

  it('publishes issue when speech synthesis is unavailable', async () => {
    spyOn(engine, 'supportsSpeechSynthesis').and.returnValue(false);

    await facade.requestSpeech({ text: 'Test', locale: 'en' });
    await flushAsync();

    const issue = facade.lastIssue();
    expect(issue?.type).toBe('unavailable');
    expect(issue?.reason).toBe('engine-not-supported');
    const event = telemetry.events.find((entry) => entry.name === 'speech.unavailable');
    expect(event?.payload?.reason).toBe('engine-not-supported');
  });

  it('reports playback failure issue when engine errors', async () => {
    await facade.requestSpeech({ text: 'Error', locale: 'en' });
    await flushAsync();

    engine.resolveNext({ success: false, fallbackUsed: true });
    await flushAsync();

    const issue = facade.lastIssue();
    expect(issue?.type).toBe('failed');
    expect(issue?.reason).toBe('playback-error');
  });
  });
});
