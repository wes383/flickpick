const FINGERPRINT_KEY = "flickpick:fingerprint";

let cachedFingerprint: string | null = null;

export async function getFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint;
  if (typeof window === "undefined") {
    throw new Error("getFingerprint can only be called in the browser");
  }

  try {
    const stored = localStorage.getItem(FINGERPRINT_KEY);
    if (stored) {
      cachedFingerprint = stored;
      return stored;
    }
  } catch {
    // ignore storage errors
  }

  const FingerprintJS = await import("@fingerprintjs/fingerprintjs");
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  const visitorId = result.visitorId;

  cachedFingerprint = visitorId;
  try {
    localStorage.setItem(FINGERPRINT_KEY, visitorId);
  } catch {
    // ignore storage errors
  }

  return visitorId;
}
