// src/utils/semaphore.ts
export class Semaphore {
  private tasks: Array<() => void> = [];
  private current = 0;
  private readonly maxQueue: number;

  constructor(private readonly maxConcurrent: number, maxQueue = 1000) {
    if (maxConcurrent <= 0) throw new Error('maxConcurrent must be > 0');
    this.maxQueue = maxQueue;
  }

  async acquire(): Promise<void> {
    // fast path
    if (this.current < this.maxConcurrent) {
      this.current++;
      return;
    }

    // queue path with queue-size guard
    if (this.tasks.length >= this.maxQueue) {
      throw new Error('Semaphore queue full');
    }

    await new Promise<void>((resolve) => {
      // push a function that will be called by release() when slot available.
      this.tasks.push(() => {
        // increment happens when the waiting task actually acquires the slot
        this.current++;
        resolve();
      });
    });
  }

  release(): void {
    // guard to keep current non-negative
    this.current = Math.max(0, this.current - 1);

    // wake next waiter if any
    if (this.tasks.length > 0) {
      const next = this.tasks.shift();
      next?.();
    }
  }

  async use<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      try {
        this.release();
      } catch {
        // swallow to avoid bubbling in finally (but log if you want)
      }
    }
  }

  getCurrent(): number {
    return this.current;
  }

  getQueueLength(): number {
    return this.tasks.length;
  }
}
