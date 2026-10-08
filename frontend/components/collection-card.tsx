import type { HelpCentreCollection } from "../lib/content";

export function CollectionCard({ collection, articleCount }: {
  collection: HelpCentreCollection;
  articleCount: number;
}) {
  return (
    <details className="group rounded-xl border border-N-200 bg-white shadow-base">
      <summary className="rounded-xl p-6 transition-colors hover:bg-P-50">
        <h3 className="inline text-lg font-semibold">{collection.title}</h3>
        <p className="mt-3 text-sm leading-6 text-N-600">{collection.description}</p>
      </summary>

      <div className="mx-6 border-t border-N-200 py-5">
        {articleCount > 0 ? (
          <p className="text-sm leading-6 text-N-600">
            {articleCount} published {articleCount === 1 ? "article" : "articles"} will appear here.
          </p>
        ) : (
          <p className="text-sm leading-6 text-N-600">
            No published articles are available in this collection yet.
          </p>
        )}
      </div>
    </details>
  );
}
