const { existsSync, readFileSync } = require('node:fs');

function normalizeBaseUrl(input: string): string {
  return input.endsWith('/') ? input.slice(0, -1) : input;
}

function toBaseUrlFromHost(host: string): string {
  return host.startsWith('http://') || host.startsWith('https://')
    ? normalizeBaseUrl(host)
    : `https://${host}`;
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function extractUrlsFromSitemapXml(xml: string): string[] {
  const matches = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g));
  return matches
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value));
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  const defaultHost = 'time-card-calculator.work';
  const envBase = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const baseUrl = normalizeBaseUrl(
    envBase && envBase.length > 0 ? toBaseUrlFromHost(envBase) : `https://${defaultHost}`,
  );
  const host = process.env.INDEXNOW_HOST?.trim() || new URL(baseUrl).host;
  const key = process.env.INDEXNOW_KEY?.trim() || 'eed8ebf030b9436e8d81189e65d49e37';
  const keyLocation = process.env.INDEXNOW_KEY_LOCATION?.trim() || `${baseUrl}/${key}.txt`;

  const keyFilePath = `public/${key}.txt`;
  if (!existsSync(keyFilePath)) {
    throw new Error(`Missing key file: ${keyFilePath}`);
  }

  const keyFileContent = readFileSync(keyFilePath, 'utf8').trim();
  if (keyFileContent !== key) {
    throw new Error(`Key file content mismatch in ${keyFilePath}`);
  }

  let urlList: any = [];
  try {
    const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
    if (sitemapResponse.ok) {
      const sitemapXml = await sitemapResponse.text();
      const allSitemapUrls = extractUrlsFromSitemapXml(sitemapXml).map(normalizeUrl);
      const basePattern = new RegExp(`^${escapeRegExp(baseUrl)}(?:/|$)`);
      const filtered = allSitemapUrls.filter((url) => basePattern.test(url));
      if (filtered.length > 0) {
        urlList = Array.from(new Set(filtered)).sort();
      }
    }
  } catch {
    // Fall back to static route list when sitemap is unreachable.
  }

  const payload = {
    host,
    key,
    keyLocation,
    urlList,
  };

  if (dryRun) {
    console.log('[IndexNow] dry-run enabled, request not sent.');
    console.log(`[IndexNow] host=${payload.host}`);
    console.log(`[IndexNow] keyLocation=${payload.keyLocation}`);
    console.log(`[IndexNow] urls=${payload.urlList.length}`);
    console.log(`[IndexNow] sample=${payload.urlList.slice(0, 5).join(', ')}`);
    return;
  }

  const response = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `IndexNow request failed: status=${response.status} ${response.statusText} body=${body || '<empty>'}`,
    );
  }

  console.log(`[IndexNow] submitted ${payload.urlList.length} URLs.`);
  console.log(`[IndexNow] status=${response.status}`);
}

main().catch((error) => {
  console.error('[IndexNow] submit failed.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
