import type { ReactNode } from "react";

/**
 * Preview builds (development, or NEXT_PUBLIC_PREVIEW_NOTES=1) show the client's review notes, the
 * colour switch and the placeholder markers below. A launch build shows none of them.
 */
export const PREVIEW = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_PREVIEW_NOTES === "1";

/**
 * A value the client hasn't confirmed yet (batch codes, lab accreditation, licence number…).
 * Preview builds show it with a dashed underline and a "to confirm" tooltip, so it's never mistaken
 * for a fact; a launch build shows `fallback` instead (nothing, when no fallback is given).
 */
export function Placeholder({ children, fallback = null, note }: { children: ReactNode; fallback?: ReactNode; note?: string }) {
  if (!PREVIEW) return <>{fallback}</>;
  return (
    <span className="underline decoration-dashed decoration-[rgb(var(--accent-rgb)/0.7)] underline-offset-4" title={`Placeholder: ${note ?? "to confirm with the client"}`}>
      {children}
    </span>
  );
}
