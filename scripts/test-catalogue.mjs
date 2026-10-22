import assert from 'node:assert/strict';
import {build} from 'esbuild';

const {outputFiles} = await build({
  entryPoints: ['app/lib/catalogue-matching.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
});
const {resolveDesignProducts} = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].contents).toString('base64')}`
);
const variant = (id, value = 'Default Title', designKey) => ({
  id,
  availableForSale: true,
  price: {amount: '28.00', currencyCode: 'USD'},
  selectedOptions: [
    {name: value === 'Default Title' ? 'Title' : 'Color', value},
  ],
  designKey: designKey ? {value: designKey} : null,
});
const product = (handle, variants, designKey) => ({
  id: `product-${handle}`,
  title: handle,
  handle,
  variants: {nodes: variants},
  designKey: designKey ? {value: designKey} : null,
});
const empty = resolveDesignProducts([]);
assert.equal(empty.length, 6);
assert.ok(empty.every(({shopify}) => shopify === null));
const exact = resolveDesignProducts([
  product('ritual-ivory', [variant('white')]),
]);
assert.equal(exact[0].shopify.variantId, 'white');
assert.equal(exact.filter(({shopify}) => shopify).length, 1);
const colours = resolveDesignProducts([
  product('ritual', [variant('white', 'Ivory'), variant('black', 'Black')]),
]);
assert.equal(colours[0].shopify.variantId, 'white');
assert.equal(colours[1].shopify.variantId, 'black');
assert.match(colours[1].shopify.href, /Color=Black/);
assert.ok(
  resolveDesignProducts([
    product('unrelated-shirt', [variant('shirt', 'Ivory')]),
  ]).every(({shopify}) => shopify === null),
);
const explicit = resolveDesignProducts([
  product('merchant-existing-handle', [variant('wood')], 'treasury-walnut'),
]);
assert.equal(explicit[4].shopify.productId, 'product-merchant-existing-handle');
assert.ok(
  resolveDesignProducts([
    product('one', [variant('a')], 'ritual-ink'),
    product('two', [variant('b')], 'ritual-ink'),
  ])[1].shopify === null,
);
assert.equal(
  resolveDesignProducts([
    product('set', [variant('grey', 'Grey', 'treasury-marble')]),
  ])[5].shopify.variantId,
  'grey',
);
process.stdout.write(
  'Passed: six previews; exact product, colour and explicit mappings; unrelated and ambiguous products stay unlinked.\n',
);
