import assert from "node:assert/strict";
import test from "node:test";
import {
  filterVisibleArticles,
  getCollectionArticleCount,
  getVisibleArticle,
  getVisibleArticlesForCollection,
  helpCentre,
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

test("uses the approved collection order and canonical IDs", () => {
  assert.deepEqual(
    helpCentre.collections.map((collection) => collection.id),
    [
      "getting-started",
      "users-and-administration",
      "frameworks-scoping-and-controls",
      "evidence",
      "audit-management",
      "risk-management",
      "document-and-policy-management",
      "tasks-and-workflows",
      "integrations",
      "reports-and-dashboards",
      "third-party-risk-management",
      "troubleshooting-and-known-issues",
      "trust-and-data-protection",
    ],
  );
});

test("uses confirmed active article mappings and excludes assessments from the manifest", () => {
  const collectionByArticleId = new Map(helpCentre.articles.map((article) => [article.id, article.collectionId]));

  assert.deepEqual(Object.fromEntries(collectionByArticleId), {
    "welcome-to-drisk": "getting-started",
    "drisk-platform-terminology": "getting-started",
    "navigate-drisk-dashboard": "getting-started",
    "understand-users-roles-permissions": "users-and-administration",
    "view-and-select-compliance-framework": "frameworks-scoping-and-controls",
    "understand-framework-requirements": "frameworks-scoping-and-controls",
    "create-customer-defined-control": "frameworks-scoping-and-controls",
    "map-controls-to-requirements": "frameworks-scoping-and-controls",
    "upload-and-link-evidence": "evidence",
    "review-compliance-readiness": "audit-management",
    "manage-organisation-settings": "users-and-administration",
    "report-an-issue": "troubleshooting-and-known-issues",
  });
  assert.equal(collectionByArticleId.has("understand-assessments-and-tests"), false);
});

test("preserves IDs, slugs and draft statuses for active prototype articles", () => {
  const expected = new Map([
    ["manage-organisation-settings", "manage-organisation-settings"],
    ["report-an-issue", "report-an-issue"],
  ]);

  for (const [id, slug] of expected) {
    const article = helpCentre.articles.find((candidate) => candidate.id === id);
    assert.equal(article?.slug, slug);
    assert.equal(article?.status, "draft");
  }
});
