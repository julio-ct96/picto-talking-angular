import { Injectable } from '@angular/core';

import { SpeechPreferencesEntity } from '../../domain/entities/speech-preferences.entity';
import { SpeechRequestEntity } from '../../domain/entities/speech-request.entity';
import { LocaleCode } from '../../domain/value-objects/locale-code';
import { SpeechPitch } from '../../domain/value-objects/speech-pitch';
import { SpeechRate } from '../../domain/value-objects/speech-rate';
import { SpeechVolume } from '../../domain/value-objects/speech-volume';

export interface SpeechRequestOverrides {
  readonly voiceId?: string | null;
  readonly rate?: number;
  readonly pitch?: number;
  readonly volume?: number;
}

export interface BuildSpeechRequestInput {
  readonly text: string;
  readonly locale?: LocaleCode;
  readonly preferences: SpeechPreferencesEntity;
  readonly overrides?: SpeechRequestOverrides;
}

@Injectable({ providedIn: 'root' })
export class BuildSpeechRequestUseCase {
  execute(input: BuildSpeechRequestInput): SpeechRequestEntity {
    const { preferences, overrides } = input;
    const locale: LocaleCode = input.locale ?? preferences.locale;

    const voiceId = overrides?.voiceId ?? preferences.voiceId ?? null;
    const rate =
      overrides?.rate !== undefined ? SpeechRate.create(overrides.rate) : preferences.rate;
    const pitch =
      overrides?.pitch !== undefined ? SpeechPitch.create(overrides.pitch) : preferences.pitch;
    const volume =
      overrides?.volume !== undefined ? SpeechVolume.create(overrides.volume) : preferences.volume;

    return SpeechRequestEntity.create({
      text: input.text,
      locale,
      voiceId,
      rate,
      pitch,
      volume,
    });
  }
}
