import { LocaleCode } from '../value-objects/locale-code';

export class SpeechVoiceEntity {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly locale: LocaleCode,
    readonly isDefault: boolean,
  ) {
    if (!id || id.trim().length === 0) {
      throw new Error('SpeechVoiceEntity requires a defined id');
    }

    if (!name || name.trim().length === 0) {
      throw new Error('SpeechVoiceEntity requires a readable name');
    }
  }

  matchesLocale(locale: LocaleCode): boolean {
    return this.locale === locale;
  }
}
