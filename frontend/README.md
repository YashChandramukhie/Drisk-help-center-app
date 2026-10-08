# DRisk Help Centre

This is a static, JSON-driven Next.js help centre for the DRisk compliance platform.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

Run the checks and create a production static export:

```bash
npm run lint
npm run build
```

The build writes the deployable site to `out/`. To preview that export, use a static file server from the project directory, for example `npx serve out`. Do not use `npm run start` for the static export; that command expects a server build.

## Content and screenshots

The source content lives in `data/help-centre.json`, outside `public/`. `lib/content.ts` validates the structure during the build and exposes only articles whose `status` is `published` to public-facing features. Draft content can therefore be kept for review without appearing in the site.

Each article has a stable `id`, unique `slug`, `collectionId`, `type`, title, summary, keywords, `draft` or `published` status, related article IDs, content owner, review date, and optional sections. Sections contain paragraph, heading, ordered-list, bullet-list, or image blocks. Images require descriptive alt text and can include a caption.

To add an article, add its metadata and reviewed content to `data/help-centre.json`; put approved screenshots in `public/` and reference their paths in an image block. Keep new articles as `draft` until the product/content owner has reviewed the wording and screenshots. Change the status to `published` only after that review, then run lint and build again.

Content changes are static-site changes: rebuild the project, check the generated `out/` directory, and redeploy that directory through the eventual hosting process.

## Open decisions

The approved logo, support contact, final deployment address/hosting arrangement, platform integration approach, and the separate Control Activities feature still need product-team confirmation. They are intentionally not invented in the current site.

The homepage is implemented in `app/page.tsx` and reads its content from `data/help-centre.json`.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
