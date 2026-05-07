import { getActiveProxies, markProxyFailed, type ProxyInfo } from "./proxy-pool";

type RotationStrategy = "sequential" | "random" | "by-country";

let sequentialIndex = 0;

export async function getProxy(
  strategy: RotationStrategy = "random",
  country?: string
): Promise<ProxyInfo | null> {
  const proxies = await getActiveProxies();
  if (proxies.length === 0) return null;

  switch (strategy) {
    case "sequential":
      return getSequential(proxies);
    case "random":
      return getRandom(proxies);
    case "by-country":
      return getByCountry(proxies, country);
    default:
      return getRandom(proxies);
  }
}

function getSequential(proxies: ProxyInfo[]): ProxyInfo {
  const proxy = proxies[sequentialIndex % proxies.length];
  sequentialIndex = (sequentialIndex + 1) % proxies.length;
  return proxy;
}

function getRandom(proxies: ProxyInfo[]): ProxyInfo {
  return proxies[Math.floor(Math.random() * proxies.length)];
}

function getByCountry(proxies: ProxyInfo[], country?: string): ProxyInfo | null {
  if (!country) return getRandom(proxies);
  const filtered = proxies.filter(
    (p) => p.country?.toLowerCase() === country.toLowerCase()
  );
  if (filtered.length === 0) return getRandom(proxies);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function buildProxyUrl(proxy: ProxyInfo): string {
  const auth =
    proxy.username && proxy.password
      ? `${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@`
      : "";
  return `${proxy.protocol}://${auth}${proxy.host}:${proxy.port}`;
}

export async function executeWithRetry<T>(
  fn: (proxy?: string) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  const baseDelay = 1000;

  // Fetch the proxy pool once, then rotate within it across retries
  const proxies = await getActiveProxies();
  let proxyIndex = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const proxy = proxies.length > 0
      ? proxies[proxyIndex++ % proxies.length]
      : null;
    const proxyUrl = proxy ? buildProxyUrl(proxy) : undefined;

    try {
      return await fn(proxyUrl);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(
        `Retry attempt ${attempt + 1}/${maxRetries} failed:`,
        lastError.message
      );

      // Mark the failed proxy so it gets deactivated after repeated failures
      if (proxy) {
        markProxyFailed(proxy.host, proxy.port).catch(() => {});
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("All retry attempts failed");
}
