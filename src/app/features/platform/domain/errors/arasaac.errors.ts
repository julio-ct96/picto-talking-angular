export class ArasaacServiceError extends Error {
  override readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ArasaacServiceError';
    this.cause = cause;
  }
}

export class RateLimitExceededError extends ArasaacServiceError {
  readonly retryAfterSeconds: number | null;
  constructor(
    message = 'ARASAAC rate limit exceeded.',
    options?: { retryAfterSeconds?: number | null; cause?: unknown },
  ) {
    super(message, options?.cause);
    this.name = 'RateLimitExceededError';
    this.retryAfterSeconds = options?.retryAfterSeconds ?? null;
  }
}

export class ServiceUnavailableError extends ArasaacServiceError {
  constructor(message = 'ARASAAC service is currently unavailable.', cause?: unknown) {
    super(message, cause);
    this.name = 'ServiceUnavailableError';
  }
}

export class CircuitBreakerOpenError extends ArasaacServiceError {
  readonly retryAt: Date;
  constructor(retryAt: Date) {
    super('ARASAAC service requests are temporarily blocked by the circuit breaker.');
    this.name = 'CircuitBreakerOpenError';
    this.retryAt = retryAt;
  }
}

export class UnknownArasaacError extends ArasaacServiceError {
  constructor(message = 'Unexpected ARASAAC service error.', cause?: unknown) {
    super(message, cause);
    this.name = 'UnknownArasaacError';
  }
}
