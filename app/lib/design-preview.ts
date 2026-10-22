import type {HeaderQuery} from 'storefrontapi.generated';

/** Explicit local-only visual preview; real Shopify configuration remains untouched. */
export function isDesignPreview(env: {FUMOUNT_DESIGN_PREVIEW?: string}) {
  return env.FUMOUNT_DESIGN_PREVIEW === 'true';
}

export const previewHeader: HeaderQuery = {
  shop: {
    id: 'gid://shopify/Shop/0',
    name: 'Fúmount',
    description: 'Fúmount incense',
    primaryDomain: {url: 'http://localhost:3000'},
    brand: null,
  },
  menu: null,
  collections: {nodes: []},
};
