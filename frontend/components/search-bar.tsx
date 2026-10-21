"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HelpCentreArticle } from "../lib/content";

function articleText(article: HelpCentreArticle): string {
  return (article.sections ?? [])
    .flatMap((section) => section.blocks)
    .map((block) => {
      if (block.type === "ordered-list" || block.type === "bullet-list") {
        return block.items.join(" ");
      }
      return block.type === "image" ? `${block.alt} ${block.caption ?? ""}` : block.text;
    })
    .join(" ");
}

export function SearchBar({ articles, showDrafts }: { articles: HelpCentreArticle[]; showDrafts: boolean }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) return [];

    return articles.filter((article) =>
      [article.title, article.summary, article.keywords.join(" "), articleText(article)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [articles, normalizedQuery]);

  return (
    <div className="relative w-full md:w-80 lg:w-96">
      <label htmlFor="article-search" className="sr-only">Search Help Centre</label>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-N-500">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
        </span>
        <input
          id="article-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles"
          autoComplete="off"
          className="min-h-11 w-full rounded-lg border border-N-300 bg-N-50 py-2 pl-10 pr-4 text-sm text-N-900 placeholder:text-N-500 focus:border-P-600 focus:bg-white focus:outline-none"
        />
      </div>

      {normalizedQuery && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-N-200 bg-white p-2 shadow-md">
          {results.length > 0 ? (
            <ul aria-label="Search results" className="max-h-80 overflow-y-auto">
              {results.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/articles/${article.slug}`}
                    onClick={() => setQuery("")}
                    className="block rounded-lg p-3 hover:bg-P-50"
                  >
                    <span className="block font-semibold text-N-900">{article.title}</span>
                    {showDrafts && article.status !== "published" && (
                      <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                        {article.status[0].toUpperCase() + article.status.slice(1)}
                      </span>
                    )}
                    <span className="mt-1 block text-sm leading-5 text-N-600">{article.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p role="status" className="p-3 text-sm text-N-600">
              No published articles match “{query}”.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
