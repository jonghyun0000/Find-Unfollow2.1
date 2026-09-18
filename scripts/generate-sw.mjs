import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const entries = await readdir('.next/static', { recursive: true, withFileTypes: true });
const assets = entries
  .filter((entry) => entry.isFile() && !entry.name.endsWith('.map'))
  .map((entry) => `${entry.parentPath}/${entry.name}`.replace(/^\.next/, '/_next'))
  .sort();
const pages = [
  '/',
  '/upload',
  '/dashboard',
  '/unfollowers',
  '/mutual',
  '/changes',
  '/stats',
  '/history',
  '/settings',
  '/guide',
  '/privacy',
];
const version = createHash('sha256')
  .update(await readFile('.next/BUILD_ID', 'utf8'))
  .digest('hex')
  .slice(0, 16);
const template = await readFile('scripts/service-worker.js', 'utf8');
await writeFile(
  'public/sw.js',
  template
    .replace('__VERSION__', version)
    .replace(
      '__ASSETS__',
      JSON.stringify([
        ...pages,
        ...assets,
        '/manifest.webmanifest',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/icons/apple-touch-icon.png',
      ]),
    ),
);
console.log(`Offline cache generated: ${assets.length} assets, ${pages.length} pages`);
