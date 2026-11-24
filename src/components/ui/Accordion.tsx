/**
 * Native <details> accordion: works without JavaScript, accessible by default.
 * Numbered rows in mono; the open row lights its edge and number in the accent.
 */
export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((it, i) => (
        <details key={it.q} className="group relative py-1">
          <span
            aria-hidden
            className="absolute top-0 bottom-0 -left-px w-px bg-gradient-to-b from-transparent via-flare to-transparent opacity-0 transition-opacity duration-500 group-open:opacity-100"
          />
          <summary className="flex cursor-pointer list-none items-center gap-5 py-6 text-left [&::-webkit-details-marker]:hidden">
            <span className="w-7 shrink-0 font-mono text-xs tracking-[0.16em] text-dust transition-colors group-open:text-flare">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex-1 text-lg font-semibold transition-colors group-hover:text-flare-soft sm:text-xl">{it.q}</span>
            <span
              aria-hidden
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-dust transition-[transform,border-color,color,box-shadow] duration-300 group-open:rotate-45 group-open:border-flare group-open:text-flare group-open:shadow-[0_0_18px_-4px_var(--color-flare)]"
            >
              +
            </span>
          </summary>
          <p className="max-w-3xl pb-7 pl-12 leading-relaxed text-star/75">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
