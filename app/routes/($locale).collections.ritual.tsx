import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).collections.ritual';
import {loadDesignCatalogue} from '~/lib/catalogue.server';
import {DesignCollectionPage} from '~/components/DesignCollectionPage';

export const meta: Route.MetaFunction = () => [
  {title: 'Ritual Collection — Fúmount'},
];
export async function loader({context}: Route.LoaderArgs) {
  return {products: await loadDesignCatalogue(context)};
}
export default function RitualCollection() {
  const {products} = useLoaderData<typeof loader>();
  return <DesignCollectionPage products={products} collection="ritual" />;
}
