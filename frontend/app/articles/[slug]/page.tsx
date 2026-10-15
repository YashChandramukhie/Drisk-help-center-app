import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleContent } from "../../../components/article-content";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { DraftPreviewNotice } from "../../../components/draft-preview-notice";
import { SiteFooter } from "../../../components/site-footer";
import { SiteHeader } from "../../../components/site-header";
import {
  getCollection,
  getVisibleArticle,
  helpCentre,
  visibleArticles,
} from "../../../lib/content";
import type { HelpCentreArticle } from "../../../lib/content";

export function generateStaticParams() {
  const visibleParams = visibleArticles.map((article) => ({ slug: article.slug }));

  // Static export requires at least one generated param. This placeholder
  // renders the not-found page and contains no draft article content.
  return visibleParams.length > 0
    ? visibleParams
    : [{ slug: "__no-published-articles__" }];
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getVisibleArticle(slug);
  if (!article) notFound();

  const collection = getCollection(article.collectionId);
  const relatedArticles = article.relatedArticleIds
    .map((relatedId) => helpCentre.articles.find((candidate) => candidate.id === relatedId))
    .filter((relatedArticle): relatedArticle is HelpCentreArticle =>
      visibleArticles.some((visibleArticle) => visibleArticle.id === relatedArticle?.id),
    );

  return (
    <>
      <SiteHeader site={helpCentre.site} articles={visibleArticles} />
      <main id="main-content" className="flex-1">
        <DraftPreviewNotice />
        <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
          <Breadcrumbs current={article.title} collection={collection?.title} />
          <article>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-widest text-P-600">{article.type}</p>
              {article.status === "draft" && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                  Draft preview
                </span>
              )}
            </div>
            <h1 className="mt-3 text-h1-m font-bold md:text-h1">{article.title}</h1>
            <p className="mt-5 text-lg leading-8 text-N-600">{article.summary}</p>
            <ArticleContent sections={article.sections} />
          </article>

          {relatedArticles.length > 0 && (
            <aside aria-labelledby="related-heading" className="mt-14 border-t border-N-200 pt-8">
              <h2 id="related-heading" className="text-h2-m font-semibold md:text-h2">Related articles</h2>
              <ul className="mt-4 space-y-3">
                {relatedArticles.map((relatedArticle) => (
                  <li key={relatedArticle.id}>
                    <Link href={`/articles/${relatedArticle.slug}`} className="font-semibold text-P-600 hover:text-P-800 hover:underline">
                      {relatedArticle.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </main>
      <SiteFooter site={helpCentre.site} />
    </>
  );
}
