import { LocaleCode } from '../value-objects/locale-code';
import { SpeechPitch } from '../value-objects/speech-pitch';
import { SpeechRate } from '../value-objects/speech-rate';
import { SpeechVolume } from '../value-objects/speech-volume';

export type SpeechRequestSnapshot = {
  readonly text: string;
  readonly locale: LocaleCode;
  readonly voiceId: string | null;
  readonly rate: number;
  readonly pitch: number;
  readonly volume: number;
};

export interface SpeechRequestProps {
  readonly text: string;
  readonly locale: LocaleCode;
  readonly voiceId: string | null;
  readonly rate: SpeechRate;
  readonly pitch: SpeechPitch;
  readonly volume: SpeechVolume;
}

export class SpeechRequestEntity {
  private constructor(
    readonly text: string,
    readonly locale: LocaleCode,
    readonly voiceId: string | null,
    readonly rate: SpeechRate,
    readonly pitch: SpeechPitch,
    readonly volume: SpeechVolume,
  ) {}

  static create(props: SpeechRequestProps): SpeechRequestEntity {
    const trimmed = props.text.trim();
    if (!trimmed) {
      throw new Error('SpeechRequestEntity requires non empty text');
    }

    return new SpeechRequestEntity(
      trimmed,
      props.locale,
      props.voiceId,
      props.rate,
      props.pitch,
      props.volume,
    );
  }

  withVoice(voiceId: string | null): SpeechRequestEntity {
    return new SpeechRequestEntity(this.text, this.locale, voiceId, this.rate, this.pitch, this.volume);
  }

  toSnapshot(): SpeechRequestSnapshot {
    return {
      text: this.text,
      locale: this.locale,
      voiceId: this.voiceId,
      rate: this.rate.value,
      pitch: this.pitch.value,
      volume: this.volume.value,
    };
  }
}
