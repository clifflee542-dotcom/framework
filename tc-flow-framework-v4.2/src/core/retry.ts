export type Backoff = "none" | "linear" | "exponential";
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { maxRetries?: number; delayMs?: number; backoff?: Backoff } = {}
) {
  const max = Math.max(0, opts.maxRetries ?? 0);
  const base = Math.max(0, opts.delayMs ?? 0);
  const backoff = opts.backoff ?? "none";
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= max) throw e;
      attempt++;
      const d =
        backoff === "none"
          ? base
          : backoff === "linear"
          ? base * attempt
          : base * Math.pow(2, attempt - 1);
      if (d > 0) await new Promise((r) => setTimeout(r, d));
    }
  }
}
