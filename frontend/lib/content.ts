import rawHelpCentre from "../data/help-centre.json";

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
  contentOwner: string;
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
    throw new Error(`Help Centre content: ${label} must be a non-empty string.`);
  }
  return value;
}

function requireStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Help Centre content: ${label} must be an array of strings.`);
  }
  return value;
}

function validateContentBlock(value: unknown, label: string): ContentBlock {
  if (!isObject(value)) {
    throw new Error(`Help Centre content: ${label} must be an object.`);
  }

  const type = requireString(value.type, `${label}.type`);
  if (type === "paragraph" || type === "heading") {
    const text = requireString(value.text, `${label}.text`);
    if (type === "heading" && value.level !== undefined && value.level !== 2 && value.level !== 3) {
      throw new Error(`Help Centre content: ${label}.level must be 2 or 3.`);
    }
    return type === "heading"
      ? { type, text, level: value.level as 2 | 3 | undefined }
      : { type, text };
  }

  if (type === "ordered-list" || type === "bullet-list") {
    return { type, items: requireStringArray(value.items, `${label}.items`) };
  }

  if (type === "image") {
    const image: ContentBlock = {
      type,
      src: requireString(value.src, `${label}.src`),
      alt: requireString(value.alt, `${label}.alt`),
    };
    if (value.caption !== undefined) {
      image.caption = requireString(value.caption, `${label}.caption`);
    }
    return image;
  }

  throw new Error(`Help Centre content: ${label}.type is not supported.`);
}

function validateData(value: unknown): HelpCentreData {
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
      throw new Error(`Help Centre content: collections[${index}] must be an object.`);
    }
    return {
      id: requireString(item.id, `collections[${index}].id`),
      title: requireString(item.title, `collections[${index}].title`),
      description: requireString(item.description, `collections[${index}].description`),
    };
  });

  const collectionIds = new Set(collections.map((collection) => collection.id));
  if (collectionIds.size !== collections.length) {
    throw new Error("Help Centre content: collection IDs must be unique.");
  }

  const articles = value.articles.map((item, index) => {
    if (!isObject(item)) {
      throw new Error(`Help Centre content: articles[${index}] must be an object.`);
    }
    const type = requireString(item.type, `articles[${index}].type`) as ArticleType;
    const status = requireString(item.status, `articles[${index}].status`) as ArticleStatus;
    if (!articleTypes.includes(type) || !articleStatuses.includes(status)) {
      throw new Error(`Help Centre content: articles[${index}] has an unsupported type or status.`);
    }

    const article: HelpCentreArticle = {
      id: requireString(item.id, `articles[${index}].id`),
      slug: requireString(item.slug, `articles[${index}].slug`),
      collectionId: requireString(item.collectionId, `articles[${index}].collectionId`),
      type,
      title: requireString(item.title, `articles[${index}].title`),
      summary: requireString(item.summary, `articles[${index}].summary`),
      keywords: requireStringArray(item.keywords, `articles[${index}].keywords`),
      status,
      relatedArticleIds: requireStringArray(item.relatedArticleIds, `articles[${index}].relatedArticleIds`),
      contentOwner: requireString(item.contentOwner, `articles[${index}].contentOwner`),
      lastReviewedDate:
        item.lastReviewedDate === null
          ? null
          : requireString(item.lastReviewedDate, `articles[${index}].lastReviewedDate`),
    };

    if (!collectionIds.has(article.collectionId)) {
      throw new Error(`Help Centre content: article ${article.id} refers to an unknown collection.`);
    }

    if (item.sections !== undefined) {
      if (!Array.isArray(item.sections)) {
        throw new Error(`Help Centre content: articles[${index}].sections must be an array.`);
      }
      article.sections = item.sections.map((section, sectionIndex) => {
        if (!isObject(section) || !Array.isArray(section.blocks)) {
          throw new Error(`Help Centre content: articles[${index}].sections[${sectionIndex}] is invalid.`);
        }
        return {
          id: requireString(section.id, `articles[${index}].sections[${sectionIndex}].id`),
          title: requireString(section.title, `articles[${index}].sections[${sectionIndex}].title`),
          blocks: section.blocks.map((block, blockIndex) =>
            validateContentBlock(block, `articles[${index}].sections[${sectionIndex}].blocks[${blockIndex}]`),
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
        throw new Error(`Help Centre content: article ${article.id} refers to an unknown related article.`);
      }
    }
  }

  return { site, collections, articles };
}

export const helpCentre = validateData(rawHelpCentre);

/** Only published articles should be passed to public-facing routes and search. */
export const publishedArticles = helpCentre.articles.filter((article) => article.status === "published");

export function getCollectionArticleCount(collectionId: string): number {
  return publishedArticles.filter((article) => article.collectionId === collectionId).length;
}
