import { SpeechRequestEntity } from './speech-request.entity';

export class SpeechQueueEntity {
  private constructor(private readonly requests: readonly SpeechRequestEntity[]) {}

  static empty(): SpeechQueueEntity {
    return new SpeechQueueEntity([]);
  }

  enqueue(request: SpeechRequestEntity): SpeechQueueEntity {
    return new SpeechQueueEntity([...this.requests, request]);
  }

  shift(): {
    readonly next: SpeechRequestEntity | null;
    readonly queue: SpeechQueueEntity;
  } {
    if (this.requests.length === 0) {
      return { next: null, queue: this };
    }

    const [head, ...tail] = this.requests;
    return {
      next: head,
      queue: new SpeechQueueEntity(tail),
    };
  }

  clear(): SpeechQueueEntity {
    if (this.requests.length === 0) {
      return this;
    }

    return SpeechQueueEntity.empty();
  }

  peek(): SpeechRequestEntity | null {
    return this.requests.length > 0 ? this.requests[0] : null;
  }

  isEmpty(): boolean {
    return this.requests.length === 0;
  }

  size(): number {
    return this.requests.length;
  }

  toArray(): readonly SpeechRequestEntity[] {
    return [...this.requests];
  }
}
