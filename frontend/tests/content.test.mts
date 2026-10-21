import assert from "node:assert/strict";
import test from "node:test";
import {
  filterVisibleArticles,
  getCollectionArticleCount,
  getVisibleArticle,
  getVisibleArticlesForCollection,
  validateData,
} from "../lib/content.ts";
import type { HelpCentreArticle } from "../lib/content.ts";

const baseArticle = {
  id: "article",
  slug: "article",
  collectionId: "collection",
  type: "concept" as const,
  title: "Article",
  summary: "Summary",
  keywords: ["article"],
  relatedArticleIds: [],
  contentOwner: null,
  lastReviewedDate: null,
};

function article(status: HelpCentreArticle["status"], id = status): HelpCentreArticle {
  return { ...baseArticle, id, slug: id, status };
}

function dataWithStatus(status: string) {
  return {
    site: { name: "DRisk", title: "Help Centre", heading: "Help", description: "Description" },
    collections: [{ id: "collection", title: "Collection", description: "Description" }],
    articles: [{ ...baseArticle, status }],
  };
}

test("accepts exactly all four article statuses", () => {
  for (const status of ["draft", "review", "published", "hold"] as const) {
    const result = validateData(dataWithStatus(status));
    assert.equal(result.articles[0].status, status);
  }
});

test("rejects unsupported or differently-cased statuses", () => {
  for (const status of ["Draft", "PUBLISHED", "archived", ""] as const) {
    assert.throws(() => validateData(dataWithStatus(status)), /articles\[0\](?:\.status| has)/);
  }
});

test("production visibility includes only published articles", () => {
  const articles = [article("draft"), article("review"), article("published"), article("hold")];

  assert.deepEqual(
    filterVisibleArticles(articles, false).map((visibleArticle) => visibleArticle.status),
    ["published"],
  );
  assert.deepEqual(
    filterVisibleArticles(articles, true).map((visibleArticle) => visibleArticle.status),
    ["draft", "review", "published", "hold"],
  );
});

test("production filtering applies to pages, navigation, search inputs, related articles and counts", () => {
  const articles = [
    article("draft"),
    article("review"),
    article("published"),
    article("hold"),
  ];
  const productionArticles = filterVisibleArticles(articles, false);

  assert.equal(getVisibleArticle("draft", productionArticles), undefined);
  assert.equal(getVisibleArticle("review", productionArticles), undefined);
  assert.equal(getVisibleArticle("hold", productionArticles), undefined);
  assert.equal(getVisibleArticle("published", productionArticles)?.status, "published");
  assert.deepEqual(getVisibleArticlesForCollection("collection", productionArticles), [articles[2]]);
  assert.equal(getCollectionArticleCount("collection", productionArticles), 1);
});
