import { LocaleCode } from '../value-objects/locale-code';
import { SpeechPitch } from '../value-objects/speech-pitch';
import { SpeechRate } from '../value-objects/speech-rate';
import { SpeechVolume } from '../value-objects/speech-volume';

export type SpeechPreferencesSnapshot = {
  readonly locale: LocaleCode;
  readonly voiceId: string | null;
  readonly rate: number;
  readonly pitch: number;
  readonly volume: number;
};

export class SpeechPreferencesEntity {
  private constructor(
    readonly locale: LocaleCode,
    readonly voiceId: string | null,
    readonly rate: SpeechRate,
    readonly pitch: SpeechPitch,
    readonly volume: SpeechVolume,
  ) {}

  static createDefault(locale: LocaleCode): SpeechPreferencesEntity {
    return new SpeechPreferencesEntity(
      locale,
      null,
      SpeechRate.default(),
      SpeechPitch.default(),
      SpeechVolume.default(),
    );
  }

  static fromSnapshot(snapshot: SpeechPreferencesSnapshot): SpeechPreferencesEntity {
    return new SpeechPreferencesEntity(
      snapshot.locale,
      snapshot.voiceId,
      SpeechRate.create(snapshot.rate),
      SpeechPitch.create(snapshot.pitch),
      SpeechVolume.create(snapshot.volume),
    );
  }

  withVoice(voiceId: string | null, locale: LocaleCode): SpeechPreferencesEntity {
    return new SpeechPreferencesEntity(locale, voiceId, this.rate, this.pitch, this.volume);
  }

  withRate(rate: SpeechRate): SpeechPreferencesEntity {
    return new SpeechPreferencesEntity(this.locale, this.voiceId, rate, this.pitch, this.volume);
  }

  withPitch(pitch: SpeechPitch): SpeechPreferencesEntity {
    return new SpeechPreferencesEntity(this.locale, this.voiceId, this.rate, pitch, this.volume);
  }

  withVolume(volume: SpeechVolume): SpeechPreferencesEntity {
    return new SpeechPreferencesEntity(this.locale, this.voiceId, this.rate, this.pitch, volume);
  }

  toSnapshot(): SpeechPreferencesSnapshot {
    return {
      locale: this.locale,
      voiceId: this.voiceId,
      rate: this.rate.value,
      pitch: this.pitch.value,
      volume: this.volume.value,
    };
  }
}
