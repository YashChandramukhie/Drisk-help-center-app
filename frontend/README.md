# DRisk Help Centre

This is a static, JSON-driven Next.js help centre for the DRisk compliance platform.

## Development and build

Run the development server:

~~~bash
npm run dev
~~~

Open http://localhost:3000 in a browser.

Run the checks and create a production static export:

~~~bash
npm run lint
npm run build
~~~

The build writes the deployable site to out/. To preview that export, use a static file server from the project directory, for example npx serve out. Do not use npm run start for the static export; that command expects a server build.

## Content structure

The catalogue and site settings live in data/help-centre.json. It contains:

- site
- collections
- articleFiles, with paths relative to the data/ directory

The approved collection order and IDs are:

1. Getting Started (`getting-started`)
2. Users and Administration (`users-and-administration`)
3. Frameworks, Scoping and Controls (`frameworks-scoping-and-controls`)
4. Evidence (`evidence`)
5. Audit Management (`audit-management`)
6. Risk Management (`risk-management`)
7. Document and Policy Management (`document-and-policy-management`)
8. Tasks and Workflows (`tasks-and-workflows`)
9. Integrations (`integrations`)
10. Reports and Dashboards (`reports-and-dashboards`)
11. Third-Party Risk Management (`third-party-risk-management`)
12. Troubleshooting and Known Issues (`troubleshooting-and-known-issues`)
13. Trust and Data Protection (`trust-and-data-protection`)

Each article is stored in its own file under data/articles/. For example, edit the terminology article in [data/articles/drisk-platform-terminology.json](./data/articles/drisk-platform-terminology.json).

The loader in lib/content.ts reads the manifest and article files only in the server/build environment. It validates:

- Manifest paths are unique, exist, remain inside data/articles/, and point to JSON files.
- Article IDs and slugs are globally unique.
- Collection IDs and article collection references are valid.
- Related article IDs refer to existing articles.
- Section IDs are unique within each article.
- Article types, statuses, metadata and content blocks use the supported schema.

Invalid content stops the build with an error that identifies the manifest entry or article file.

## Add or edit an article

To edit an article, open its matching file in [data/articles/](./data/articles/). Keep its stable ID and slug unless you intentionally need to migrate links. The article file contains its title, summary, keywords, status, related article IDs, owner, review date and sections.

To add an article:

1. Create a new JSON file in data/articles/ using a unique article ID as the filename.
2. Add its relative path, such as articles/new-article.json, to articleFiles in data/help-centre.json.
3. Use a unique ID and slug, a valid collection ID, and one of the supported types: concept, instructional, or troubleshooting.
4. Use one of the supported statuses: "draft", "review", "published", or "hold". Use "contentOwner": null and "lastReviewedDate": null until the article is reviewed.
5. Use only existing article IDs in relatedArticleIds; those links are shown only when the related article is published.
6. Add approved screenshots under public/ and use supported image blocks with descriptive alt text.

The prototype article `understand-assessments-and-tests.json` is preserved on disk but is temporarily excluded from `articleFiles` pending supervisor classification. It is not deleted or modified.

Changing a status to "published" makes the article eligible for production static routes, collection lists, navigation, related articles, counts and browser search after the next build. During `npm run dev`, the shared visible-content helper includes all four statuses for local review. The site shows a development-preview notice and status labels for unpublished articles. Production builds use published articles only, and unpublished article bodies are filtered before route generation and client props.

The terminology article is available during local development at `/articles/drisk-platform-terminology/`. Draft preview is development-only; do not publish an article solely to preview it.

## Static export and content changes

After content changes:

~~~bash
npm run lint
npm run build
~~~

Check the generated out/ directory and confirm that published collection/article paths and search content are correct. Draft article text must not appear in exported files. Rebuild and redeploy out/ through the eventual hosting process.

## Open decisions

The approved logo, support contact, final deployment address/hosting arrangement, platform integration approach, and the separate Control Activities feature still need product-team confirmation. They are intentionally not invented in the current site.
