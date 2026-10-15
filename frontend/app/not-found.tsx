import Link from "next/link";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { helpCentre, visibleArticles } from "../lib/content";

export default function NotFound() {
  return (
    <>
      <SiteHeader site={helpCentre.site} articles={visibleArticles} />
      <main id="main-content" className="flex flex-1 items-center">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center md:px-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-P-600">404</p>
          <h1 className="mt-3 text-h1-m font-bold md:text-h1">Page not found</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-N-600">
            The article or collection you requested is not available.
          </p>
          <Link href="/" className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-P-600 px-6 py-3 font-semibold text-white hover:bg-P-700">
            Return to Help Centre
          </Link>
        </div>
      </main>
      <SiteFooter site={helpCentre.site} />
    </>
  );
}
