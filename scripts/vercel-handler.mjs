import {randomBytes} from 'node:crypto';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {InMemoryCache} from '@shopify/hydrogen';
import app from '../dist/server/index.js';

// Adapt the existing Oxygen fetch entrypoint, preserving its Shopify context.
const cache = new InMemoryCache();
globalThis.caches = {open: async () => cache};
const previewSecret = randomBytes(32).toString('hex');

export default async function handler(incoming, outgoing) {
  const pending = [];
  try {
    const preview = process.env.FUMOUNT_DESIGN_PREVIEW === 'true';
    const env = {...process.env};
    if (preview) {
      env.SESSION_SECRET ||= previewSecret;
      env.PUBLIC_STORE_DOMAIN ||= 'mock.shop';
      env.PUBLIC_STOREFRONT_ID ||= '0';
    }
    const url = new URL(incoming.url, `https://${incoming.headers.host}`);
    // No customer data or unconfigured shopping requests leave the preview.
    const path = url.pathname.replace(/^\/[a-z]{2}-[a-z]{2}(?=\/|$)/i, '') || '/';
    // The homepage's client navigation endpoint is /_root.data, not /.data.
    const pagePath = path === '/_root.data' ? '/' : path.replace(/\.data$/, '');
    const previewPage = /^(?:\/|\/collections\/(?:all|ritual|treasury)|\/designs\/[a-z-]+|\/pages\/(?:about|contact)|\/blogs(?:\/news)?|\/__manifest)\/?$/.test(pagePath);
    if (preview && (!previewPage || !['GET', 'HEAD'].includes(incoming.method))) {
      outgoing.writeHead(503, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      outgoing.end(incoming.method === 'HEAD' ? undefined : '<title>Fúmount</title><p>Shop features will be available when the store is connected.</p><a href="/">Back to Fúmount</a>');
      return;
    }
    const headers = new Headers();
    for (const [name, value] of Object.entries(incoming.headers)) {
      for (const part of Array.isArray(value) ? value : [value]) {
        if (part !== undefined) headers.append(name, part);
      }
    }
    const init = {method: incoming.method, headers};
    if (!['GET', 'HEAD'].includes(incoming.method)) {
      init.body = Readable.toWeb(incoming);
      init.duplex = 'half';
    }
    const response = await app.fetch(new Request(url, init), env, {
      waitUntil(promise) { pending.push(Promise.resolve(promise)); },
    });
    outgoing.statusCode = response.status;
    for (const [name, value] of response.headers) {
      if (name !== 'set-cookie') outgoing.setHeader(name, value);
    }
    const cookies = response.headers.getSetCookie();
    if (cookies.length) outgoing.setHeader('Set-Cookie', cookies);
    if (incoming.method === 'HEAD' || !response.body) outgoing.end();
    else await pipeline(Readable.fromWeb(response.body), outgoing);
  } catch (error) {
    console.error('Unable to render Fúmount', error);
    if (!outgoing.headersSent) {
      outgoing.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
      outgoing.end('Unable to render Fúmount.');
    } else outgoing.destroy(error);
  } finally {
    await Promise.allSettled(pending);
  }
}
