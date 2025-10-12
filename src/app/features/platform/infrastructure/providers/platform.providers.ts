import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { FEATURE_FLAG_PORT } from '../../application/ports/feature-flag.port';
import { SPEECH_ENGINE } from '../../application/ports/speech-engine.port';
import { SPEECH_PREFERENCES_PORT } from '../../application/ports/speech-preferences.port';
import { SPEECH_TELEMETRY_PORT } from '../../application/ports/speech-telemetry.port';
import { SpeechSynthesisEngineService } from '../adapters/speech-synthesis-engine.service';
import { SpeechPreferencesStorageService } from '../adapters/speech-preferences-storage.service';
import { ConsoleSpeechTelemetryService } from '../adapters/console-speech-telemetry.service';
import { FeatureFlagService } from '../adapters/feature-flag.service';

export function providePlatformData(): EnvironmentProviders {
  return makeEnvironmentProviders([
    SpeechSynthesisEngineService,
    SpeechPreferencesStorageService,
    ConsoleSpeechTelemetryService,
    FeatureFlagService,
    {
      provide: SPEECH_ENGINE,
      useExisting: SpeechSynthesisEngineService,
    },
    {
      provide: SPEECH_PREFERENCES_PORT,
      useExisting: SpeechPreferencesStorageService,
    },
    {
      provide: SPEECH_TELEMETRY_PORT,
      useExisting: ConsoleSpeechTelemetryService,
    },
    {
      provide: FEATURE_FLAG_PORT,
      useExisting: FeatureFlagService,
    },
  ]);
}
