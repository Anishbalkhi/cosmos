/** Native <details> accordion: works without JavaScript, accessible by default. */
export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((it) => (
        <details key={it.q} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg font-semibold [&::-webkit-details-marker]:hidden">
            {it.q}
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-dust transition-transform duration-300 group-open:rotate-45 group-open:border-flare group-open:text-flare"
            >
              +
            </span>
          </summary>
          <p className="max-w-3xl pb-6 leading-relaxed text-dust">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
