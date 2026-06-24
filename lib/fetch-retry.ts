export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: {
    retries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
  }
): Promise<Response> {
  const retries = options?.retries ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 500;
  const maxDelayMs = options?.maxDelayMs ?? 4000;

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(input, init);

      if (res.status >= 500 || res.status === 429) {
        if (attempt < retries) {
          const delay = Math.min(
            baseDelayMs * Math.pow(2, attempt) +
              Math.random() * baseDelayMs,
            maxDelayMs
          );
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
      }

      return res;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        const delay = Math.min(
          baseDelayMs * Math.pow(2, attempt) + Math.random() * baseDelayMs,
          maxDelayMs
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error("fetchWithRetry: exhausted retries");
}
