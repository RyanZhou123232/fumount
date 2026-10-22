import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, access} from 'node:fs/promises';

process.env.FUMOUNT_DESIGN_PREVIEW = 'true';
const {default: handler} = await import('../.vercel/output/functions/storefront.func/index.mjs');
const realFetch = globalThis.fetch;
let outboundCalls = 0;
globalThis.fetch = async () => {
  outboundCalls++;
  throw new Error('Preview must not contact Shopify');
};
const server = createServer(handler);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
try {
  for (const path of [
    '/', '/collections/all', '/collections/ritual', '/collections/treasury',
    ...['ritual-ivory', 'ritual-ink', 'treasury-vermilion', 'treasury-imperial-gold', 'treasury-walnut', 'treasury-marble'].map((key) => `/designs/${key}`),
  ]) {
    const response = await realFetch(base + path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /Fúmount|Fumount|F&/i, path);
    assert.match(html, /fumount-design\/images\//, path);
    if (path === '/') {
      assert.match(html, /benefit-meditate-v4/);
      assert.match(html, /Best Sellers/i);
      assert.doesNotMatch(html, /<h2[^>]*>All of Our Products/);
    }
    if (path === '/collections/all') {
      for (const key of ['ritual-ivory', 'ritual-ink', 'treasury-vermilion', 'treasury-imperial-gold', 'treasury-walnut', 'treasury-marble']) {
        assert.ok(html.includes(`/designs/${key}`), key);
      }
    }
  }
  const head = await realFetch(base + '/', {method: 'HEAD'});
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  for (const path of ['/cart', '/account/login', '/search?q=test', '/products/unconfigured']) {
    const response = await realFetch(base + path);
    assert.equal(response.status, 503, path);
  }
  const post = await realFetch(base + '/cart', {method: 'POST', body: 'test'});
  assert.equal(post.status, 503);
  assert.equal(outboundCalls, 0);
  const config = JSON.parse(await readFile('.vercel/output/config.json', 'utf8'));
  assert.equal(config.version, 3);
  assert.equal(config.routes.at(-1).dest, '/storefront');
  await access('.vercel/output/static/fumount-design/images/product-treasury-marble.png');
  process.stdout.write('Passed: Vercel function renders latest homepage, collections and all six designs; HEAD works; commerce is blocked without store calls.\n');
} finally {
  globalThis.fetch = realFetch;
  await new Promise((resolve) => server.close(resolve));
}
