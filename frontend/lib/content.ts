import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type ArticleStatus = "draft" | "published";
export type ArticleType = "instructional" | "concept" | "troubleshooting";

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; level?: 2 | 3 }
  | { type: "ordered-list"; items: string[] }
  | { type: "bullet-list"; items: string[] }
  | { type: "image"; src: string; alt: string; caption?: string };

export interface ArticleSection {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

export interface HelpCentreArticle {
  id: string;
  slug: string;
  collectionId: string;
  type: ArticleType;
  title: string;
  summary: string;
  keywords: string[];
  status: ArticleStatus;
  relatedArticleIds: string[];
  contentOwner: string | null;
  lastReviewedDate: string | null;
  sections?: ArticleSection[];
}

export interface HelpCentreCollection {
  id: string;
  title: string;
  description: string;
}

export interface HelpCentreData {
  site: {
    name: string;
    title: string;
    heading: string;
    description: string;
  };
  collections: HelpCentreCollection[];
  articles: HelpCentreArticle[];
}

const articleTypes: ArticleType[] = ["instructional", "concept", "troubleshooting"];
const articleStatuses: ArticleStatus[] = ["draft", "published"];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("Help Centre content: " + label + " must be a non-empty string.");
  }
  return value;
}

function requireStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error("Help Centre content: " + label + " must be an array of strings.");
  }
  return value;
}

function readJsonFile(filePath: string, label: string): unknown {
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown JSON read error";
    throw new Error("Help Centre content: could not read " + label + ": " + detail);
  }
}

function validateContentBlock(value: unknown, label: string): ContentBlock {
  if (!isObject(value)) {
    throw new Error("Help Centre content: " + label + " must be an object.");
  }

  const type = requireString(value.type, label + ".type");
  if (type === "paragraph" || type === "heading") {
    const text = requireString(value.text, label + ".text");
    if (type === "heading" && value.level !== undefined && value.level !== 2 && value.level !== 3) {
      throw new Error("Help Centre content: " + label + ".level must be 2 or 3.");
    }
    return type === "heading"
      ? { type, text, level: value.level as 2 | 3 | undefined }
      : { type, text };
  }

  if (type === "ordered-list" || type === "bullet-list") {
    return { type, items: requireStringArray(value.items, label + ".items") };
  }

  if (type === "image") {
    const image: ContentBlock = {
      type,
      src: requireString(value.src, label + ".src"),
      alt: requireString(value.alt, label + ".alt"),
    };
    if (value.caption !== undefined) {
      image.caption = requireString(value.caption, label + ".caption");
    }
    return image;
  }

  throw new Error("Help Centre content: " + label + ".type is not supported.");
}

function validateData(value: unknown, articleLabels: string[] = []): HelpCentreData {
  if (!isObject(value) || !isObject(value.site) || !Array.isArray(value.collections) || !Array.isArray(value.articles)) {
    throw new Error("Help Centre content must contain site, collections and articles.");
  }

  const site = {
    name: requireString(value.site.name, "site.name"),
    title: requireString(value.site.title, "site.title"),
    heading: requireString(value.site.heading, "site.heading"),
    description: requireString(value.site.description, "site.description"),
  };

  const collections = value.collections.map((item, index) => {
    if (!isObject(item)) {
      throw new Error("Help Centre content: collections[" + index + "] must be an object.");
    }
    return {
      id: requireString(item.id, "collections[" + index + "].id"),
      title: requireString(item.title, "collections[" + index + "].title"),
      description: requireString(item.description, "collections[" + index + "].description"),
    };
  });

  const collectionIds = new Set(collections.map((collection) => collection.id));
  if (collectionIds.size !== collections.length) {
    throw new Error("Help Centre content: collection IDs must be unique.");
  }

  const articles = value.articles.map((item, index) => {
    const label = articleLabels[index] ?? "articles[" + index + "]";
    if (!isObject(item)) {
      throw new Error("Help Centre content: " + label + " must be an object.");
    }

    const type = requireString(item.type, label + ".type") as ArticleType;
    const status = requireString(item.status, label + ".status") as ArticleStatus;
    if (!articleTypes.includes(type) || !articleStatuses.includes(status)) {
      throw new Error("Help Centre content: " + label + " has an unsupported type or status.");
    }

    const article: HelpCentreArticle = {
      id: requireString(item.id, label + ".id"),
      slug: requireString(item.slug, label + ".slug"),
      collectionId: requireString(item.collectionId, label + ".collectionId"),
      type,
      title: requireString(item.title, label + ".title"),
      summary: requireString(item.summary, label + ".summary"),
      keywords: requireStringArray(item.keywords, label + ".keywords"),
      status,
      relatedArticleIds: requireStringArray(item.relatedArticleIds, label + ".relatedArticleIds"),
      contentOwner:
        item.contentOwner === null
          ? null
          : requireString(item.contentOwner, label + ".contentOwner"),
      lastReviewedDate:
        item.lastReviewedDate === null
          ? null
          : requireString(item.lastReviewedDate, label + ".lastReviewedDate"),
    };

    if (!collectionIds.has(article.collectionId)) {
      throw new Error("Help Centre content: " + label + " refers to an unknown collection.");
    }

    if (item.sections !== undefined) {
      if (!Array.isArray(item.sections)) {
        throw new Error("Help Centre content: " + label + ".sections must be an array.");
      }

      const sectionIds = new Set<string>();
      article.sections = item.sections.map((section, sectionIndex) => {
        const sectionLabel = label + ".sections[" + sectionIndex + "]";
        if (!isObject(section) || !Array.isArray(section.blocks)) {
          throw new Error("Help Centre content: " + sectionLabel + " is invalid.");
        }

        const sectionId = requireString(section.id, sectionLabel + ".id");
        if (sectionIds.has(sectionId)) {
          throw new Error("Help Centre content: " + label + " has duplicate section ID " + sectionId + ".");
        }
        sectionIds.add(sectionId);

        return {
          id: sectionId,
          title: requireString(section.title, sectionLabel + ".title"),
          blocks: section.blocks.map((block, blockIndex) =>
            validateContentBlock(block, sectionLabel + ".blocks[" + blockIndex + "]"),
          ),
        };
      });
    }

    return article;
  });

  const articleIds = new Set(articles.map((article) => article.id));
  const articleSlugs = new Set(articles.map((article) => article.slug));
  if (articleIds.size !== articles.length || articleSlugs.size !== articles.length) {
    throw new Error("Help Centre content: article IDs and slugs must be unique.");
  }

  for (const article of articles) {
    for (const relatedId of article.relatedArticleIds) {
      if (!articleIds.has(relatedId)) {
        throw new Error("Help Centre content: article " + article.id + " refers to an unknown related article.");
      }
    }
  }

  return { site, collections, articles };
}

function readManifest(): HelpCentreData {
  const dataRoot = path.resolve(process.cwd(), "data");
  const manifestValue = readJsonFile(path.join(dataRoot, "help-centre.json"), "data/help-centre.json");

  if (
    !isObject(manifestValue) ||
    !isObject(manifestValue.site) ||
    !Array.isArray(manifestValue.collections) ||
    !Array.isArray(manifestValue.articleFiles)
  ) {
    throw new Error("Help Centre content: data/help-centre.json must contain site, collections and articleFiles.");
  }

  const articleFiles = manifestValue.articleFiles.map((file, index) => {
    const label = "data/help-centre.json articleFiles[" + index + "]";
    if (typeof file !== "string" || file.trim() === "") {
      throw new Error("Help Centre content: " + label + " must be a non-empty path.");
    }

    const normalized = file.replace(/\\/g, "/");
    const absolutePath = path.resolve(dataRoot, normalized);
    const articlesRoot = path.resolve(dataRoot, "articles");
    const relativeToArticles = path.relative(articlesRoot, absolutePath);

    if (
      !normalized.startsWith("articles/") ||
      !normalized.endsWith(".json") ||
      path.isAbsolute(relativeToArticles) ||
      relativeToArticles === ".." ||
      relativeToArticles.startsWith(".." + path.sep)
    ) {
      throw new Error("Help Centre content: " + label + " must point inside data/articles/*.json.");
    }

    return { manifestPath: normalized, absolutePath };
  });

  const manifestPaths = new Set(articleFiles.map((file) => file.manifestPath));
  if (manifestPaths.size !== articleFiles.length) {
    throw new Error("Help Centre content: articleFiles paths must be unique.");
  }

  const articleValues = articleFiles.map((file) => {
    if (!existsSync(file.absolutePath)) {
      throw new Error("Help Centre content: article file does not exist: " + file.manifestPath);
    }
    return readJsonFile(file.absolutePath, file.manifestPath);
  });

  return validateData(
    {
      site: manifestValue.site,
      collections: manifestValue.collections,
      articles: articleValues,
    },
    articleFiles.map((file) => file.manifestPath),
  );
}

export const helpCentre = readManifest();

/** Only published articles should be passed to public-facing routes and search. */
export const publishedArticles = helpCentre.articles.filter((article) => article.status === "published");

export const isDevelopmentPreview = process.env.NODE_ENV === "development";
export const visibleArticles = isDevelopmentPreview ? helpCentre.articles : publishedArticles;

export function getCollectionArticleCount(collectionId: string): number {
  return visibleArticles.filter((article) => article.collectionId === collectionId).length;
}

export function getVisibleArticlesForCollection(collectionId: string): HelpCentreArticle[] {
  return visibleArticles.filter((article) => article.collectionId === collectionId);
}

export function getCollection(collectionId: string): HelpCentreCollection | undefined {
  return helpCentre.collections.find((collection) => collection.id === collectionId);
}

export function getVisibleArticle(slug: string): HelpCentreArticle | undefined {
  return visibleArticles.find((article) => article.slug === slug);
}
