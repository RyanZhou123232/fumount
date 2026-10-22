import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).designs.$key';
import {designCollections, designImage, designProducts} from '~/lib/catalogue';
import {useLanguage} from '~/lib/language';

export function loader({params}: Route.LoaderArgs) {
  const product = designProducts.find(({key}) => key === params.key);
  if (!product) throw new Response('Not found', {status: 404});
  return {product};
}

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.product.name.en ?? 'Collection'} — Fúmount`},
];

export default function DesignDetail() {
  const {product} = useLoaderData<typeof loader>();
  const {language} = useLanguage();
  return (
    <section className="design-detail">
      <img
        src={designImage(product.key)}
        alt={product.name[language]}
        width="1254"
        height="1254"
      />
      <div>
        <p className="product-card__line">
          {designCollections[product.collection][language]}
        </p>
        <h1>{product.name[language]}</h1>
        <p>
          {language === 'zh'
            ? '系列预览，敬请期待。'
            : 'A collection preview. More to come.'}
        </p>
        <Link className="view-all" to="/collections/all">
          {language === 'zh' ? '查看全部产品' : 'View all products'}
        </Link>
      </div>
    </section>
  );
}
