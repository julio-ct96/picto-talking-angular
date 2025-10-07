export class SpeechDomainError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'SpeechDomainError';
  }
}

export class SpeechSynthesisUnavailableError extends SpeechDomainError {
  constructor() {
    super('Speech synthesis is not available in this environment');
    this.name = 'SpeechSynthesisUnavailableError';
  }
}

export class SpeechPlaybackError extends SpeechDomainError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'SpeechPlaybackError';
  }
}

export class SpeechPreferencesPersistenceError extends SpeechDomainError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'SpeechPreferencesPersistenceError';
  }
}
