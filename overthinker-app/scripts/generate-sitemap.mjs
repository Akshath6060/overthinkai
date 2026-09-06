import { writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';

const fileEnv = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');
const siteUrl = (process.env.VITE_APP_URL || fileEnv.VITE_APP_URL || '').replace(/\/+$/, '');
const output = resolve('public/sitemap.xml');

if (!siteUrl) {
  await unlink(output).catch(() => {});
  process.stdout.write('Skipping sitemap: set VITE_APP_URL to a production HTTPS origin.\n');
  process.exit(0);
}

if (!/^https:\/\/[^/]+$/.test(siteUrl)) {
  throw new Error('VITE_APP_URL must be a production HTTPS origin, for example https://overthinker.example.com');
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc></url>
</urlset>
`;
await writeFile(output, xml, 'utf8');
process.stdout.write(`Generated ${output}\n`);
