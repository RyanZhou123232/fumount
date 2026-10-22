import {randomBytes} from 'node:crypto';
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {Readable} from 'node:stream';
import {resolve, sep, extname} from 'node:path';
import {InMemoryCache} from '@shopify/hydrogen';

// Render the built Hydrogen app in Node for visual work on Windows, without
// requiring Workerd, merchant credentials, or changing the real .env file.
const cache = new InMemoryCache();
globalThis.caches = {open: async () => cache};
const {default: app} = await import('../dist/server/index.js');
const port = Number(process.env.PORT || 3000);
const env = {
  FUMOUNT_DESIGN_PREVIEW: 'true',
  PUBLIC_STORE_DOMAIN: 'mock.shop',
  PUBLIC_STOREFRONT_ID: '0',
  SESSION_SECRET: randomBytes(32).toString('hex'),
};
const types = {
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};
const roots = [resolve('dist/client'), resolve('public')];

createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url, `http://localhost:${port}`);
    if (incoming.method === 'GET' || incoming.method === 'HEAD') {
      for (const root of roots) {
        const filename = resolve(root, `.${decodeURIComponent(url.pathname)}`);
        if (!filename.startsWith(root + sep)) continue;
        const file = await stat(filename).catch(() => null);
        if (!file?.isFile()) continue;
        outgoing.writeHead(200, {
          'Content-Type':
            types[extname(filename)] || 'application/octet-stream',
        });
        outgoing.end(
          incoming.method === 'HEAD' ? undefined : await readFile(filename),
        );
        return;
      }
    }
    // Preview never sends customer data or shopping actions to the mock store.
    if (
      /^\/(?:[a-z]{2}-[a-z]{2}\/)?(?:account|search|cart)(?:[/.]|$)/i.test(
        url.pathname,
      )
    ) {
      outgoing.writeHead(503, {'Content-Type': 'text/html; charset=utf-8'});
      outgoing.end(
        '<title>Fúmount preview</title><p>Shop features will be available when the store is connected.</p><a href="/">Back to Fúmount</a>',
      );
      return;
    }
    const response = await app.fetch(
      new Request(url, {method: incoming.method, headers: incoming.headers}),
      env,
      {waitUntil: (promise) => promise.catch(console.error)},
    );
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (incoming.method === 'HEAD' || !response.body) outgoing.end();
    else Readable.fromWeb(response.body).pipe(outgoing);
  } catch (error) {
    console.error(error);
    outgoing.writeHead(500, {'Content-Type': 'text/plain'});
    outgoing.end('Unable to render the local design preview.');
  }
}).listen(port, '127.0.0.1', () =>
  process.stdout.write(`Fúmount design preview: http://localhost:${port}\n`),
);
