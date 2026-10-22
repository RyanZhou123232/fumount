import {Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {useLanguage} from '~/lib/language';
import {designCollections, designImage} from '~/lib/catalogue';
import type {ResolvedDesign} from '~/lib/catalogue-matching';

export function DesignProductCard({product}: {product: ResolvedDesign}) {
  const {language} = useLanguage();
  const href = product.shopify?.href ?? `/designs/${product.key}`;
  return (
    <article className="product-card" data-product={product.key}>
      <Link className="product-card__visual" to={href} prefetch="intent">
        <img
          src={designImage(product.key)}
          alt={`Fúmount ${designCollections[product.collection][language]} — ${product.name[language]}`}
          width="1254"
          height="1254"
          loading="lazy"
          decoding="async"
        />
      </Link>
      <p className="product-card__line">
        {designCollections[product.collection][language]}
      </p>
      <h3>
        <Link to={href}>{product.name[language]}</Link>
      </h3>
      <p className="product-card__detail">
        {product.collection === 'ritual'
          ? language === 'zh'
            ? '压纹线香套装'
            : 'Embossed incense set'
          : language === 'zh'
            ? '线香礼盒套装'
            : 'Incense gift set'}
      </p>
      {product.shopify ? (
        <div className="rb-price">
          <Money data={product.shopify.price} />
        </div>
      ) : null}
    </article>
  );
}
