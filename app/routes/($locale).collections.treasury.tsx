import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).collections.treasury';
import {loadDesignCatalogue} from '~/lib/catalogue.server';
import {DesignCollectionPage} from '~/components/DesignCollectionPage';

export const meta: Route.MetaFunction = () => [
  {title: 'Treasury Collection — Fúmount'},
];
export async function loader({context}: Route.LoaderArgs) {
  return {products: await loadDesignCatalogue(context)};
}
export default function TreasuryCollection() {
  const {products} = useLoaderData<typeof loader>();
  return <DesignCollectionPage products={products} collection="treasury" />;
}
