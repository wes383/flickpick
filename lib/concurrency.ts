export async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const launchNext = async (): Promise<void> => {
    const index = cursor++;
    if (index >= items.length) return;
    results[index] = await worker(items[index]);
    await launchNext();
  };
  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    () => launchNext()
  );
  await Promise.all(runners);
  return results;
}
