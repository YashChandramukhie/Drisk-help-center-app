import Link from "next/link";

export function Breadcrumbs({ current, collection }: { current: string; collection?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 text-sm text-N-600">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link href="/" className="text-P-600 hover:underline">Help Centre</Link></li>
        <li aria-hidden="true">/</li>
        {collection && (
          <>
            <li>{collection}</li>
            <li aria-hidden="true">/</li>
          </>
        )}
        <li aria-current="page" className="text-N-800">{current}</li>
      </ol>
    </nav>
  );
}
