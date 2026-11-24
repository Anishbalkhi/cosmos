import { LeafStar } from "./LeafStar";

/** "C✳SMOS" — the leaf-star replaces the first O, as in the client's logo. */
export function Wordmark({ className = "", tone = "light" }: { className?: string; tone?: "light" | "green" }) {
  const text = tone === "green" ? "text-leaf" : "text-star";
  return (
    <span
      className={`inline-flex items-center font-sans font-normal tracking-[0.06em] leading-none ${text} ${className}`}
      aria-label="Cosmos"
      role="img"
      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
    >
      <span aria-hidden>C</span>
      <LeafStar className="mx-[0.04em] h-[1.05em] w-[1.1em] translate-y-[0.06em]" />
      <span aria-hidden>SMOS</span>
    </span>
  );
}
