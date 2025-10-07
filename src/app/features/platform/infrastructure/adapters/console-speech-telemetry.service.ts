import { Injectable } from '@angular/core';

import { SpeechTelemetryPort } from '../../application/ports/speech-telemetry.port';

@Injectable()
export class ConsoleSpeechTelemetryService implements SpeechTelemetryPort {
  trackEvent(eventName: string, payload?: Record<string, unknown>): void {
    console.info(`[Telemetry] ${eventName}`, payload ?? {});
  }

  logWarning(message: string, context?: Record<string, unknown>): void {
    console.warn(`[Speech][Warning] ${message}`, context ?? {});
  }

  logError(message: string, context?: Record<string, unknown>): void {
    console.error(`[Speech][Error] ${message}`, context ?? {});
  }
}
