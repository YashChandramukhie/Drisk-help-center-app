import type { HelpCentreData } from "../lib/content";

export function SiteFooter({ site }: { site: HelpCentreData["site"] }) {
  return (
    <footer className="border-t border-N-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-6 md:px-10">
        <p className="text-sm text-N-600">{site.name} {site.title}</p>
      </div>
    </footer>
  );
}
