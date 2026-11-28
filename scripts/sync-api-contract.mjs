import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'docs', 'api', 'openapi');
const contractPath = path.join(root, 'docs', 'api', 'CONTRACT.md');

async function loadEnv() {
  const values = {};

  try {
    const contents = await readFile(path.join(root, '.env'), 'utf8');

    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);

      if (!match || match[2].startsWith('#')) {
        continue;
      }

      values[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    throw new Error('No .env found. Copy .env.example to .env and set the OPENAPI_* URLs.');
  }

  return values;
}

async function fetchSpec(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  const json = await response.json();

  if (!json.openapi || !json.paths) {
    throw new Error(`${url} does not look like an OpenAPI document.`);
  }

  return json;
}

const env = await loadEnv();
const sources = [
  ['staff.json', env.OPENAPI_STAFF_URL],
  ['renter.json', env.OPENAPI_RENTER_URL],
  ['platform.json', env.OPENAPI_PLATFORM_URL],
  ['webhooks.json', env.OPENAPI_WEBHOOKS_URL],
].filter(([, url]) => Boolean(url));

if (sources.length < 3) {
  throw new Error('Set OPENAPI_STAFF_URL, OPENAPI_RENTER_URL and OPENAPI_PLATFORM_URL in .env.');
}

await mkdir(outDir, { recursive: true });

const rows = [];

for (const [file, url] of sources) {
  const json = await fetchSpec(url);
  const contents = `${JSON.stringify(json, null, 2)}\n`;
  await writeFile(path.join(outDir, file), contents, 'utf8');

  const hash = createHash('sha256').update(contents).digest('hex').slice(0, 16);
  rows.push(`| ${file} | ${Object.keys(json.paths).length} | \`${hash}\` | ${url} |`);
}

const report = `# Frontend API contract

Synced from the live backend by \`npm run api:sync\`. AI assistants should read
these local files plus \`docs/api/_conventions.md\`, not a network URL.

- Backend commit: \`${env.BACKEND_COMMIT || 'unknown'}\`
- Synced at: ${new Date().toISOString()}

| File | Paths | SHA-256 (first 16) | Source |
|------|-------|--------------------|--------|
${rows.join('\n')}

Re-run \`npm run api:sync\` after a backend contract release, then commit the
updated files.
`;

await writeFile(contractPath, report, 'utf8');
console.log(`Synced ${sources.length} OpenAPI documents into docs/api/openapi/.`);
