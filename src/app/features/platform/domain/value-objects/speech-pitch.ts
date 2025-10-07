export class SpeechPitch {
  private static readonly MIN_VALUE = 0;
  private static readonly MAX_VALUE = 2;
  private static readonly DEFAULT_VALUE = 1;

  private constructor(private readonly _value: number) {}

  static create(value: number): SpeechPitch {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      throw new Error('SpeechPitch must be a finite number');
    }

    const clamped = Math.min(Math.max(value, this.MIN_VALUE), this.MAX_VALUE);
    return new SpeechPitch(clamped);
  }

  static default(): SpeechPitch {
    return new SpeechPitch(this.DEFAULT_VALUE);
  }

  get value(): number {
    return this._value;
  }
}
