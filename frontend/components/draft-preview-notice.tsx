export function DraftPreviewNotice() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <aside
      aria-label="Development draft preview"
      className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-center text-sm text-amber-950"
    >
      Development preview: draft articles are visible locally for review. They are excluded from production builds.
    </aside>
  );
}
