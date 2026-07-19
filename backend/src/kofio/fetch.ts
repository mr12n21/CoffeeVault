import dns from "node:dns/promises";
import net from "node:net";

const MAX_BYTES = 3_000_000;
const FETCH_TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 5;

export class KofioFetchError extends Error {}

// We don't restrict which domain the URL is on — a link shared from a phone often goes
// through a redirector (Google, a social app, an AMP cache, a URL shortener...) before it
// reaches the real page, and none of those hosts are "kofio.cz" even though the content is.
// Instead we block SSRF by resolving every hop's hostname and refusing to connect to
// anything that isn't a public address. The parser itself is the second line of defense:
// it only accepts pages shaped like a Kofio product page (see kofio/parser.ts), so even a
// successful fetch of an unrelated public page just fails to parse rather than leaking data.
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata 169.254.169.254
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a >= 224) return true; // multicast / reserved
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (/^fe[89ab][0-9a-f]:/.test(lower)) return true; // link-local fe80::/10
  if (/^f[cd][0-9a-f]{2}:/.test(lower)) return true; // unique local fc00::/7
  if (lower.startsWith("::ffff:")) return isPrivateIPv4(lower.slice("::ffff:".length));
  return false;
}

async function assertPublicHost(hostname: string): Promise<void> {
  let addresses: string[];
  try {
    addresses = (await dns.lookup(hostname, { all: true })).map((a) => a.address);
  } catch {
    throw new KofioFetchError("Could not resolve host");
  }

  const unsafe = addresses.some((ip) => (net.isIP(ip) === 4 ? isPrivateIPv4(ip) : isPrivateIPv6(ip)));
  if (addresses.length === 0 || unsafe) {
    throw new KofioFetchError("This host resolves to a private address and can't be fetched");
  }
}

export async function fetchKofioHtml(rawUrl: string): Promise<string> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new KofioFetchError("Invalid URL");
  }

  for (let redirects = 0; redirects < MAX_REDIRECTS; redirects++) {
    if (url.protocol !== "https:") throw new KofioFetchError("Only https:// URLs are allowed");
    await assertPublicHost(url.hostname);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, {
        signal: controller.signal,
        redirect: "manual",
        headers: { "User-Agent": "CoffeeVaultBot/1.0" },
      });
    } catch {
      throw new KofioFetchError("Failed to reach that page");
    } finally {
      clearTimeout(timeout);
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new KofioFetchError("Redirect without a location header");
      url = new URL(location, url);
      continue;
    }

    if (!res.ok) throw new KofioFetchError(`Page responded with status ${res.status}`);

    const reader = res.body?.getReader();
    if (!reader) throw new KofioFetchError("Empty response body");

    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        throw new KofioFetchError("Response too large");
      }
      chunks.push(value);
    }

    return Buffer.concat(chunks).toString("utf-8");
  }

  throw new KofioFetchError("Too many redirects");
}
