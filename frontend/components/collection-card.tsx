import type { HelpCentreCollection } from "../lib/content";
import Link from "next/link";
import type { HelpCentreArticle } from "../lib/content";

export function CollectionCard({ collection, articleCount, articles }: {
  collection: HelpCentreCollection;
  articleCount: number;
  articles?: HelpCentreArticle[];
}) {
  const hasUnpublishedArticles = articles?.some((article) => article.status !== "published") ?? false;

  return (
    <details className="group rounded-xl border border-N-200 bg-white shadow-base">
      <summary className="rounded-xl p-6 transition-colors hover:bg-P-50">
        <h3 className="inline text-lg font-semibold">{collection.title}</h3>
        <p className="mt-3 text-sm leading-6 text-N-600">{collection.description}</p>
      </summary>

      <div className="mx-6 border-t border-N-200 py-5">
        {articleCount > 0 ? (
          <>
            <p className="text-sm leading-6 text-N-600">
              {articleCount} {hasUnpublishedArticles ? "" : "published "}{articleCount === 1 ? "article" : "articles"} available.
            </p>
            {articles && (
              <ul className="mt-4 space-y-3">
                {articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="font-semibold text-P-600 hover:text-P-800 hover:underline"
                    >
                      {article.title}
                    </Link>
                    {article.status !== "published" && (
                      <span className="ml-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                        {article.status[0].toUpperCase() + article.status.slice(1)}
                      </span>
                    )}
                    <p className="mt-1 text-sm leading-6 text-N-600">{article.summary}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`/collections/${collection.id}`}
              className="mt-5 inline-flex text-sm font-semibold text-P-600 hover:text-P-800 hover:underline"
            >
              View all articles
            </Link>
          </>
        ) : (
          <p className="text-sm leading-6 text-N-600">
            No published articles are available in this collection yet.
          </p>
        )}
      </div>
    </details>
  );
}
