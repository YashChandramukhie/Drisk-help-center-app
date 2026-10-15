import { CollectionCard } from "../components/collection-card";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { DraftPreviewNotice } from "../components/draft-preview-notice";
import {
  getCollectionArticleCount,
  getVisibleArticlesForCollection,
  helpCentre,
  visibleArticles,
} from "../lib/content";

export default function Home() {
  const { site, collections } = helpCentre;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-white p-4 text-P-700 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <SiteHeader site={site} articles={visibleArticles} />

      <main id="main-content" className="flex-1">
        <DraftPreviewNotice />
        <section
          aria-labelledby="welcome-heading"
          className="border-b border-P-100 bg-P-50"
        >
          <div className="mx-auto max-w-6xl px-6 py-16 text-center md:px-10 md:py-20">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-P-600">
              DRisk Help Centre
            </p>

            <h1
              id="welcome-heading"
              className="text-h1-m font-bold md:text-h1"
            >
              {site.heading}
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-N-600">
              {site.description}
            </p>

            <a
              href="#collections"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-P-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-P-700"
            >
              Explore collections
            </a>
          </div>
        </section>

        <section
          id="collections"
          aria-labelledby="collections-heading"
          className="scroll-mt-6"
        >
          <div className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
            <h2
              id="collections-heading"
              className="text-h2-m font-semibold md:text-h2"
            >
              Browse by topic
            </h2>

            <p className="mt-2 text-N-600">
              Find guidance for each stage of your compliance journey.
            </p>

            <div className="mt-8 grid grid-cols-1 items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  articleCount={getCollectionArticleCount(collection.id)}
                  articles={getVisibleArticlesForCollection(collection.id)}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter site={site} />
    </>
  );
}
