import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).collections.all';
import {loadDesignCatalogue} from '~/lib/catalogue.server';
import {DesignCollectionPage} from '~/components/DesignCollectionPage';

export const meta: Route.MetaFunction = () => [
  {title: 'All Products — Fúmount'},
];
export async function loader({context}: Route.LoaderArgs) {
  return {products: await loadDesignCatalogue(context)};
}
export default function AllProducts() {
  const {products} = useLoaderData<typeof loader>();
  return <DesignCollectionPage products={products} />;
}
