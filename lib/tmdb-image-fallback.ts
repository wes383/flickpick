let shouldUseProxy = false;
let failureCount = 0;
const FAILURE_THRESHOLD = 2;

const listeners = new Set<() => void>();

export function subscribeToProxyStatus(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners() {
  listeners.forEach(callback => callback());
}

export function reportImageFailure() {
  if (shouldUseProxy) return;
  
  failureCount++;
  
  if (failureCount >= FAILURE_THRESHOLD) {
    shouldUseProxy = true;
    console.warn(`[TMDB Image] ${failureCount} failures detected, switching to proxy for all images`);
    notifyListeners();
  }
}

export function reportImageSuccess() {
  if (!shouldUseProxy && failureCount > 0) {
    failureCount = 0;
  }
}

export function shouldUseTmdbProxy(): boolean {
  return shouldUseProxy;
}

export function setProxyStatus(enabled: boolean) {
  if (shouldUseProxy !== enabled) {
    shouldUseProxy = enabled;
    failureCount = enabled ? FAILURE_THRESHOLD : 0;
    notifyListeners();
    console.log(`[TMDB Image] Proxy manually ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export function resetProxyStatus() {
  shouldUseProxy = false;
  failureCount = 0;
  notifyListeners();
}

export function buildTmdbImageUrl(
  path: string,
  size: string = "w500",
  forceProxy?: boolean
): string {
  const useProxy = forceProxy ?? shouldUseProxy;
  const directUrl = `https://image.tmdb.org/t/p/${size}${path}`;
  
  if (useProxy) {
    return `https://wsrv.nl/?url=${encodeURIComponent(directUrl)}`;
  }
  
  return directUrl;
}
