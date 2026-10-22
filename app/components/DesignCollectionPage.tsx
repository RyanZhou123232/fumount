import {Link} from 'react-router';
import {useLanguage} from '~/lib/language';
import {designCollections, type DesignCollection} from '~/lib/catalogue';
import type {ResolvedDesign} from '~/lib/catalogue-matching';
import {DesignProductCard} from './DesignProductCard';

export function DesignCollectionPage({
  products,
  collection,
}: {
  products: ResolvedDesign[];
  collection?: DesignCollection;
}) {
  const {language} = useLanguage();
  const shown = collection
    ? products.filter((product) => product.collection === collection)
    : products;
  return (
    <div className="catalogue-page">
      <section
        className="rb-section-products rb-section-products--all"
        aria-labelledby="catalogue-heading"
      >
        <div className="rb-section-products__inner">
          <h1 className="catalogue-heading" id="catalogue-heading">
            {collection
              ? designCollections[collection][language]
              : language === 'zh'
                ? '全部产品'
                : 'All of Our Products'}
          </h1>
          <p className="sub">
            {collection
              ? collection === 'ritual'
                ? language === 'zh'
                  ? '日常用香，素白与墨黑。'
                  : 'Everyday incense, in ivory and ink.'
                : language === 'zh'
                  ? '四种表达，一份心意。'
                  : 'Four finishes. One thoughtful gesture.'
              : language === 'zh'
                ? '两大系列，六种福山表达。'
                : 'Two collections. Six expressions of Fúmount.'}
          </p>
          <Link className="catalogue-back" to="/">
            {language === 'zh' ? '← 返回首页' : '← Back to home'}
          </Link>
          <div className="product-grid product-grid--all">
            {shown.map((product) => (
              <DesignProductCard product={product} key={product.key} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
