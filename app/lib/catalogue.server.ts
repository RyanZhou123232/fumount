import type {HydrogenRouterContextProvider} from '@shopify/hydrogen';
import type {DesignCatalogueQuery} from 'storefrontapi.generated';
import {isDesignPreview} from './design-preview';
import {resolveDesignProducts, type StoreProduct} from './catalogue-matching';

export async function loadDesignCatalogue(
  context: Pick<HydrogenRouterContextProvider, 'env' | 'storefront'>,
) {
  if (isDesignPreview(context.env)) return resolveDesignProducts([]);
  try {
    const products: StoreProduct[] = [];
    let after: string | null = null;
    let hasNextPage = true;
    while (hasNextPage) {
      const result: DesignCatalogueQuery = await context.storefront.query(
        DESIGN_CATALOGUE_QUERY,
        {variables: {after}},
      );
      products.push(...result.products.nodes);
      hasNextPage = result.products.pageInfo.hasNextPage;
      after = result.products.pageInfo.endCursor ?? null;
      if (hasNextPage && !after)
        throw new Error('Store catalogue returned no pagination cursor');
    }
    return resolveDesignProducts(products);
  } catch (error) {
    console.error(
      'Unable to resolve Fúmount design products from Shopify',
      error,
    );
    return resolveDesignProducts([]);
  }
}

const DESIGN_CATALOGUE_QUERY = `#graphql
  query DesignCatalogue($after: String, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 100, after: $after) {
      nodes {
        id handle title
        designKey: metafield(namespace: "custom", key: "fumount_design_key") { value }
        variants(first: 100) {
          nodes {
            id availableForSale
            price { amount currencyCode }
            selectedOptions { name value }
            designKey: metafield(namespace: "custom", key: "fumount_design_key") { value }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
` as const;
