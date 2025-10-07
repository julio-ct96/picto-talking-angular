import { InjectionToken } from '@angular/core';

export interface SpeechTelemetryPort {
  trackEvent(eventName: string, payload?: Record<string, unknown>): void;
  logWarning(message: string, context?: Record<string, unknown>): void;
  logError(message: string, context?: Record<string, unknown>): void;
}

export const SPEECH_TELEMETRY_PORT = new InjectionToken<SpeechTelemetryPort>(
  'SPEECH_TELEMETRY_PORT',
);
