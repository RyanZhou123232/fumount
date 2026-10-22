import {Link} from 'react-router';
import {useLanguage} from '~/lib/language';

/** A local empty state until the store's published articles are connected. */
export function PreviewJournal() {
  const {language} = useLanguage();
  const zh = language === 'zh';
  return (
    <main className="journal-preview">
      <div className="journal-preview__image">
        <img src="/fumount-design/images/benefit-focus-v4.png" alt="" width="1254" height="1254" />
      </div>
      <section className="journal-preview__copy" aria-labelledby="journal-heading">
        <p className="journal-preview__eyebrow">Fúmount Journal</p>
        <h1 id="journal-heading">{zh ? '香与日常' : 'Notes on a quieter day'}</h1>
        <p>{zh ? '关于香、仪式与日常生活的片刻。' : 'Reflections on incense, ritual and everyday living.'}</p>
        <p>{zh ? '文章即将呈现。' : 'Our stories are coming soon.'}</p>
        <Link to="/collections/all" className="view-all">{zh ? '探索我们的系列' : 'Explore the collections'}</Link>
      </section>
    </main>
  );
}
