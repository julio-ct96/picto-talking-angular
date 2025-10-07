export class SpeechRate {
  private static readonly MIN_VALUE = 0.5;
  private static readonly MAX_VALUE = 2.5;
  private static readonly DEFAULT_VALUE = 1;

  private constructor(private readonly _value: number) {}

  static create(value: number): SpeechRate {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      throw new Error('SpeechRate must be a finite number');
    }

    const clamped = Math.min(Math.max(value, this.MIN_VALUE), this.MAX_VALUE);
    return new SpeechRate(clamped);
  }

  static default(): SpeechRate {
    return new SpeechRate(this.DEFAULT_VALUE);
  }

  get value(): number {
    return this._value;
  }
}
