import {useEffect, useState, type CSSProperties} from 'react';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale)._index';
import {DesignProductCard} from '~/components/DesignProductCard';
import {bestSellerKeys} from '~/lib/catalogue';
import {loadDesignCatalogue} from '~/lib/catalogue.server';
import {useLanguage} from '~/lib/language';

const ASSET_BASE = '/fumount-design/images/';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Fúmount | Home incense'},
    {
      name: 'description',
      content:
        'Luxury incense rituals rooted in Eastern wisdom and shaped for modern living.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  return {products: await loadDesignCatalogue(context)};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const {language, t} = useLanguage();
  const homepageProducts = bestSellerKeys.map(
    (key) => data.products.find((product) => product.key === key)!,
  );

  return (
    <>
      <main id="collections">
        <section className="hero-slide" aria-label={t.heroAria}>
          <div className="hero-slide__media">
            <img
              src={`${ASSET_BASE}rue-home-1.png`}
              alt=""
              width="1280"
              height="1600"
              decoding="async"
            />
          </div>
          <div className="hero-slide__content">
            <p className="hero-slide__kicker">{t.heroKicker}</p>
            <h1 className="hero-slide__title">{t.heroTitle}</h1>
            <Link className="btn-shop" to="/collections/all">
              {t.heroCta}
            </Link>
          </div>
        </section>

        <section
          className="split-flip-section"
          id="atmosphere"
          lang={language === 'zh' ? 'zh-CN' : 'en'}
          aria-labelledby="split-flip-heading"
        >
          <header className="split-flip-intro">
            <div className="split-flip-intro__hero" aria-hidden="true">
              <img
                src={`${ASSET_BASE}Shoin-Room-Shoji.png`}
                alt=""
                width="1600"
                height="900"
                decoding="async"
              />
            </div>
            <h2 id="split-flip-heading" className="split-flip-intro__title">
              {t.splitTitle}
            </h2>
            {t.splitLines.map((line) => (
              <p className="split-flip-intro__line" key={line}>
                {line}
              </p>
            ))}
          </header>

          <div className="split-flip-section__grid">
            <FlipModule
              ariaLabel={t.leftGalleryAria}
              dotLabels={t.dotLabels}
              images={[
                `${ASSET_BASE}atmosphere-1.png`,
                `${ASSET_BASE}atmosphere-2.png`,
              ]}
            />
            <FlipModule
              ariaLabel={t.rightGalleryAria}
              dotLabels={t.dotLabels}
              images={[
                `${ASSET_BASE}atmosphere-3.png`,
                `${ASSET_BASE}atmosphere-4.png`,
              ]}
            />
          </div>
        </section>

        <ImmersiveScroll />

        <section
          className="rb-section-products rb-section-products--bestsellers"
          id="best-sellers"
        >
          <div className="rb-section-products__inner">
            <h2>{t.productsTitle}</h2>
            <p className="sub">{t.productsSub}</p>

            <div className="product-grid">
              {homepageProducts.map((product) => (
                <DesignProductCard product={product} key={product.key} />
              ))}
            </div>

            <div className="view-all-wrap">
              <Link className="view-all" to="/collections/all">
                {t.viewAll}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function FlipModule({
  images,
  ariaLabel,
  dotLabels,
}: {
  images: string[];
  ariaLabel: string;
  dotLabels: readonly string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % images.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <div className="flip-module" data-flip-module>
      <div className="flip-module__viewport">
        {images.map((image, index) => (
          <div
            className={`flip-module__slide${index === activeIndex ? ' is-active' : ''}`}
            key={image}
          >
            <img
              src={image}
              alt=""
              width="1200"
              height="1200"
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
        ))}
        <div
          className="flip-module__dots"
          role="tablist"
          aria-label={ariaLabel}
        >
          {images.map((image, index) => (
            <button
              type="button"
              className={`flip-module__dot${index === activeIndex ? ' is-active' : ''}`}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={
                dotLabels[index] ?? `Image ${index + 1} of ${images.length}`
              }
              key={`${image}-dot`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ImmersiveScroll() {
  const {language, t} = useLanguage();
  const steps = [
    ['benefit-refresh-v4.png', 'Freshen Your Space', '清新空间'],
    ['benefit-connect-v4.png', 'Social Connection', '社交相聚'],
    ['benefit-meditate-v4.png', 'Meditation & Yoga', '冥想瑜伽'],
    ['benefit-focus-v4.png', 'Focus & Clarity', '凝神专注'],
    ['benefit-relax-v4.png', 'Relax & Unwind', '舒缓放松'],
  ];
  const [scrollProgress, setScrollProgress] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-immersive-scroll]');
    if (!root) return;
    const immersiveRoot = root;

    function update() {
      const rect = immersiveRoot.getBoundingClientRect();
      const vh = window.innerHeight;
      const range = rect.height + vh;
      const passed = vh - rect.top;
      setScrollProgress(Math.min(Math.max(passed / range, 0), 1));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setInView(entry.isIntersecting));
      },
      {threshold: 0.16, rootMargin: '0px 0px -6% 0px'},
    );
    observer.observe(immersiveRoot);
    update();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <section
      className={`immersive-scroll${inView ? ' is-in-view' : ''}`}
      id="immersive-story"
      lang={language === 'zh' ? 'zh-CN' : 'en'}
      aria-labelledby="immersive-scroll-heading"
      data-immersive-scroll
      style={{'--iz-scroll': scrollProgress} as CSSProperties}
    >
      <div className="immersive-scroll__field" aria-hidden="true">
        <div className="immersive-scroll__paper" />
        <div className="immersive-scroll__frost" />
        <div className="immersive-scroll__grain" />
      </div>
      <div className="immersive-scroll__inner">
        <h2 id="immersive-scroll-heading" className="visually-hidden">
          {t.immersiveHeading}
        </h2>
        <div className="immersive-scroll__preface">
          <p className="immersive-scroll__preface-line immersive-scroll__preface-line--lead">
            {t.immersivePreface3}
          </p>
        </div>
        <div className="immersive-scroll__row">
          {steps.map(([image, en, zh], index) => (
            <article
              className="immersive-step"
              data-immersive-step
              data-step={index + 1}
              key={image}
            >
              <div className="immersive-step__bundle">
                <figure className="immersive-step__panel">
                  <img
                    src={`${ASSET_BASE}${image}`}
                    alt={t.immersiveSteps[index]?.[0] ?? en}
                    width="1254"
                    height="1254"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <div className="immersive-step__text">
                  <p className="immersive-step__en">
                    {t.immersiveSteps[index]?.[0] ?? en}
                  </p>
                  <p className="immersive-step__zh">
                    {t.immersiveSteps[index]?.[1] ?? zh}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
