import Link from "next/link";
import type { HelpCentreData } from "../lib/content";

export function SiteHeader({ site }: { site: HelpCentreData["site"] }) {
  return (
    <header className="border-b border-N-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5 md:px-10">
        <Link href="/" aria-label="DRisk Help Centre home" className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tight text-P-800">{site.name}</span>
          <span aria-hidden="true" className="h-6 w-px bg-N-200" />
          <span className="text-sm font-medium text-N-600">{site.title}</span>
        </Link>

        <nav aria-label="Main navigation">
          <Link href="#collections" className="text-sm font-semibold text-P-600 hover:underline">
            Browse collections
          </Link>
        </nav>
      </div>
    </header>
  );
}
