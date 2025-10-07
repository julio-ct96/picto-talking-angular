import { Injectable, inject } from '@angular/core';

import { SpeechEnginePort, SpeechPlaybackResult } from '../../application/ports/speech-engine.port';
import { SPEECH_TELEMETRY_PORT, SpeechTelemetryPort } from '../../application/ports/speech-telemetry.port';
import { SpeechRequestEntity } from '../../domain/entities/speech-request.entity';
import { SpeechVoiceEntity } from '../../domain/entities/speech-voice.entity';
import { ARASAAC_LOCALES, LocaleCode } from '../../domain/value-objects/locale-code';

@Injectable()
export class SpeechSynthesisEngineService implements SpeechEnginePort {
  private readonly telemetry = inject<SpeechTelemetryPort>(SPEECH_TELEMETRY_PORT);

  private readonly supportedLocales = new Set<LocaleCode>(ARASAAC_LOCALES);

  private voiceEntities: readonly SpeechVoiceEntity[] = [];
  private readonly rawVoices = new Map<string, SpeechSynthesisVoice>();
  private voiceLoadPromise: Promise<void> | null = null;

  supportsSpeechSynthesis(): boolean {
    return typeof globalThis !== 'undefined' && 'speechSynthesis' in globalThis;
  }

  async listVoices(locale?: LocaleCode): Promise<readonly SpeechVoiceEntity[]> {
    const synth = this.getSpeechSynthesis();
    if (!synth) {
      return [];
    }

    await this.ensureVoicesLoaded(synth);

    if (!locale) {
      return this.voiceEntities;
    }

    return this.voiceEntities.filter((voice) => voice.locale === locale);
  }

  async speak(request: SpeechRequestEntity): Promise<SpeechPlaybackResult> {
    const synth = this.getSpeechSynthesis();

    if (!synth) {
      this.telemetry.logWarning('speech-synthesis-unavailable', {
        locale: request.locale,
        voiceId: request.voiceId,
      });
      return { success: false, fallbackUsed: true };
    }

    await this.ensureVoicesLoaded(synth);

    return new Promise<SpeechPlaybackResult>((resolve) => {
      try {
        const utterance = new SpeechSynthesisUtterance(request.text);
        utterance.lang = request.locale;
        utterance.rate = request.rate.value;
        utterance.pitch = request.pitch.value;
        utterance.volume = request.volume.value;

        const voice = this.resolveVoice(request.voiceId, request.locale);
        if (voice) {
          utterance.voice = voice;
        }

        utterance.onend = () => resolve({ success: true, fallbackUsed: false });
        utterance.onerror = (event) => {
          this.telemetry.logWarning('speech-synthesis-error', {
            message: event.error ?? 'unknown-error',
            locale: request.locale,
            voiceId: request.voiceId,
          });

          resolve({ success: false, fallbackUsed: true });
        };

        synth.speak(utterance);
      } catch (error) {
        this.telemetry.logWarning('speech-synthesis-exception', {
          reason: this.describeError(error),
          locale: request.locale,
          voiceId: request.voiceId,
        });

        resolve({ success: false, fallbackUsed: true });
      }
    });
  }

  cancelAll(): void {
    const synth = this.getSpeechSynthesis();
    if (!synth) {
      return;
    }

    synth.cancel();
  }

  private getSpeechSynthesis(): SpeechSynthesis | null {
    if (!this.supportsSpeechSynthesis()) {
      return null;
    }

    return globalThis.speechSynthesis;
  }

  private async ensureVoicesLoaded(synth: SpeechSynthesis): Promise<void> {
    if (this.voiceEntities.length > 0) {
      return;
    }

    const availableVoices = synth.getVoices();
    if (availableVoices.length > 0) {
      this.populateVoices(availableVoices);
      return;
    }

    if (!this.voiceLoadPromise) {
      this.voiceLoadPromise = new Promise<void>((resolve) => {
        let resolved = false;
        let listener: (() => void) | null = null;

        const cleanup = () => {
          if (typeof synth.removeEventListener === 'function' && listener) {
            synth.removeEventListener('voiceschanged', listener as EventListener);
          }
          synth.onvoiceschanged = null;
        };

        const finish = () => {
          if (resolved) {
            return;
          }
          resolved = true;
          cleanup();
          resolve();
        };

        listener = () => {
          const loadedVoices = synth.getVoices();
          if (loadedVoices.length > 0) {
            this.populateVoices(loadedVoices);
          }
          finish();
        };

        if (typeof synth.addEventListener === 'function' && listener) {
          synth.addEventListener('voiceschanged', listener as EventListener, { once: true });
        }
        synth.onvoiceschanged = listener as SpeechSynthesis['onvoiceschanged'];

        globalThis.setTimeout(() => {
          listener?.();
        }, 750);
      }).finally(() => {
        this.voiceLoadPromise = null;
      });
    }

    await this.voiceLoadPromise;
  }

  private populateVoices(voices: readonly SpeechSynthesisVoice[]): void {
    const mapped = voices.map((voice) => {
      const id = voice.voiceURI || `${voice.name}-${voice.lang}`;
      this.rawVoices.set(id, voice);
      const locale = this.toLocaleCode(voice.lang);
      return new SpeechVoiceEntity(id, voice.name, locale, voice.default ?? false);
    });

    this.voiceEntities = mapped.sort((a, b) => a.name.localeCompare(b.name));
  }

  private resolveVoice(
    voiceId: string | null,
    locale: LocaleCode,
  ): SpeechSynthesisVoice | undefined {
    if (voiceId) {
      const preferred = this.rawVoices.get(voiceId);
      if (preferred) {
        return preferred;
      }
    }

    for (const voice of this.rawVoices.values()) {
      if (this.toLocaleCode(voice.lang) === locale) {
        return voice;
      }
    }

    for (const voice of this.rawVoices.values()) {
      if (voice.default) {
        return voice;
      }
    }

    return undefined;
  }

  private toLocaleCode(lang: string | null | undefined): LocaleCode {
    if (!lang) {
      return 'en';
    }

    const normalized = lang.split(/[-_]/)[0]?.toLowerCase() ?? 'en';

    if (this.supportedLocales.has(normalized as LocaleCode)) {
      return normalized as LocaleCode;
    }

    return 'en';
  }

  private describeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return typeof error === 'string' ? error : 'unknown-error';
  }
}
