// src/utils/circuit-breaker.ts
export class CircuitBreaker {
  // store timestamps (ms) of recent failures
  private failuresTimestamps: number[] = [];
  private openUntil = 0;

  /**
   * @param failureThreshold number of failures within windowMs to open the circuit
   * @param openMs how long circuit stays open when triggered (ms)
   * @param windowMs sliding window to count failures (ms)
   */
  constructor(
    private readonly failureThreshold = 5,
    private readonly openMs = 30_000,
    private readonly windowMs = 60_000, // count failures within last 60s by default
  ) {}

  isOpen(): boolean {
    return Date.now() < this.openUntil;
  }

  timeUntilResetMs(): number {
    if (!this.isOpen()) return 0;
    return Math.max(0, this.openUntil - Date.now());
  }

  private prune() {
    const cutoff = Date.now() - this.windowMs;
    while (this.failuresTimestamps.length && this.failuresTimestamps[0] < cutoff) {
      this.failuresTimestamps.shift();
    }
  }

  /** record a failed attempt; may open circuit if threshold reached */
  recordFailure(): void {
    this.prune();
    this.failuresTimestamps.push(Date.now());
    if (this.failuresTimestamps.length >= this.failureThreshold) {
      this.openUntil = Date.now() + this.openMs;
      // optionally clear timestamps to avoid repeated openings immediately
      this.failuresTimestamps = [];
    }
  }

  /** record a successful attempt; closes circuit & resets counters */
  recordSuccess(): void {
    this.failuresTimestamps = [];
    this.openUntil = 0;
  }

  /** reset fully (manual) */
  reset(): void {
    this.failuresTimestamps = [];
    this.openUntil = 0;
  }

  getFailureCount(): number {
    this.prune();
    return this.failuresTimestamps.length;
  }

  getLastFailureAt(): number | null {
    return this.failuresTimestamps.length ? this.failuresTimestamps[this.failuresTimestamps.length - 1] : null;
  }
}
