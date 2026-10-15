import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { DraftPreviewNotice } from "../../../components/draft-preview-notice";
import { SiteFooter } from "../../../components/site-footer";
import { SiteHeader } from "../../../components/site-header";
import {
  getCollection,
  getVisibleArticlesForCollection,
  helpCentre,
  visibleArticles,
} from "../../../lib/content";

export function generateStaticParams() {
  return helpCentre.collections.map((collection) => ({ collectionId: collection.id }));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  const collection = getCollection(collectionId);
  if (!collection) notFound();

  const articles = getVisibleArticlesForCollection(collection.id);

  return (
    <>
      <SiteHeader site={helpCentre.site} articles={visibleArticles} />
      <main id="main-content" className="flex-1">
        <DraftPreviewNotice />
        <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
          <Breadcrumbs current={collection.title} />
          <p className="text-sm font-semibold uppercase tracking-widest text-P-600">Collection</p>
          <h1 className="mt-3 text-h1-m font-bold md:text-h1">{collection.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-N-600">{collection.description}</p>

          <section aria-labelledby="article-list-heading" className="mt-12">
            <h2 id="article-list-heading" className="text-h2-m font-semibold md:text-h2">
              Articles
            </h2>
            {articles.length > 0 ? (
              <ul className="mt-6 divide-y divide-N-200 rounded-xl border border-N-200 bg-white shadow-base">
                {articles.map((article) => (
                  <li key={article.id} className="p-6">
                    <Link href={`/articles/${article.slug}`} className="text-xl font-semibold text-P-600 hover:text-P-800 hover:underline">
                      {article.title}
                    </Link>
                    <p className="mt-2 leading-7 text-N-600">{article.summary}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 rounded-xl border border-N-200 bg-white p-6 text-N-600 shadow-base">
                No published articles are available in this collection yet.
              </p>
            )}
          </section>
        </div>
      </main>
      <SiteFooter site={helpCentre.site} />
    </>
  );
}
