import {
  designCollections,
  designProducts,
  type DesignProduct,
} from './catalogue';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';

type Money = {amount: string; currencyCode: CurrencyCode};
type StoreVariant = {
  id: string;
  availableForSale: boolean;
  price: Money;
  selectedOptions: Array<{name: string; value: string}>;
  designKey?: {value: string} | null;
};
export type StoreProduct = {
  id: string;
  handle: string;
  title: string;
  designKey?: {value: string} | null;
  variants: {nodes: StoreVariant[]};
};
export type ResolvedDesign = DesignProduct & {
  shopify: null | {
    productId: string;
    variantId: string;
    href: string;
    price: Money;
    availableForSale: boolean;
  };
};

const normalize = (value: string) =>
  value
    .toLocaleLowerCase()
    .replace(/[\s_–—-]+/g, ' ')
    .trim();

/** Never map by display order, price, or an unrelated product's colour alone. */
export function resolveDesignProducts(
  products: StoreProduct[],
): ResolvedDesign[] {
  return designProducts.map((design) => {
    const collection = designCollections[design.collection];
    const productNames = [
      design.key,
      `${collection.en} ${design.name.en}`,
      `${collection.zh}${design.name.zh}`,
    ].map(normalize);
    const lineNames = [
      design.collection,
      `${design.collection}-collection`,
      collection.en,
      collection.zh,
    ].map(normalize);
    const candidates: Array<{product: StoreProduct; variant: StoreVariant}> =
      [];

    for (const product of products) {
      const explicitProduct = product.designKey?.value
        ? product.designKey.value === design.key
        : productNames.includes(normalize(product.handle)) ||
          productNames.includes(normalize(product.title));
      const sameLine =
        lineNames.includes(normalize(product.handle)) ||
        lineNames.includes(normalize(product.title));
      for (const variant of product.variants.nodes) {
        if (variant.designKey?.value && variant.designKey.value !== design.key)
          continue;
        const explicitVariant = variant.designKey?.value === design.key;
        const colourMatches = variant.selectedOptions.some(
          ({name, value}) =>
            /^(colou?r|颜色|顏色|色)$/i.test(name) &&
            design.aliases.some(
              (alias) => normalize(alias) === normalize(value),
            ),
        );
        if (
          explicitVariant ||
          (explicitProduct &&
            (product.variants.nodes.length === 1 || colourMatches)) ||
          (sameLine && colourMatches)
        ) {
          candidates.push({product, variant});
        }
      }
    }
    // An ambiguous match remains display-only until its exact mapping is supplied.
    if (candidates.length !== 1) return {...design, shopify: null};
    const {product, variant} = candidates[0];
    const query = new URLSearchParams(
      variant.selectedOptions.map(({name, value}) => [name, value]),
    );
    return {
      ...design,
      shopify: {
        productId: product.id,
        variantId: variant.id,
        href: `/products/${encodeURIComponent(product.handle)}${query.size ? `?${query}` : ''}`,
        price: variant.price,
        availableForSale: variant.availableForSale,
      },
    };
  });
}
