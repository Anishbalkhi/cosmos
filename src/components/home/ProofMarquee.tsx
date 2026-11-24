import type { ComponentType, SVGProps } from "react";
import { DrawOn } from "@/components/ui/DrawOn";
import { IconBox, IconDrop, IconFlask, IconLeaf, IconNoFlower, IconPin, IconSeal, IconSprout, IconTag } from "@/components/ui/icons";

type Badge = { icon: ComponentType<SVGProps<SVGSVGElement>>; label: string; note: string };

const BADGES: Badge[] = [
  { icon: IconFlask, label: "Lab-tested", note: "Every batch, independent lab" },
  { icon: IconLeaf, label: "Sativa leaf only", note: "Harvested before flowering" },
  { icon: IconSeal, label: "Made under licence", note: "Licence no. published at launch" },
  { icon: IconDrop, label: "Precisely dosed", note: "5 mg in every gummy" },
  { icon: IconSprout, label: "Vegan", note: "Fruit pectin, no gelatin" },
  { icon: IconNoFlower, label: "No flower, no resin", note: "Ever, in any batch" },
  { icon: IconTag, label: "Clearly labelled", note: "What, how much, and why" },
  { icon: IconBox, label: "Discreet delivery", note: "Plain outer box" },
  { icon: IconPin, label: "Made in India", note: "Bangalore" },
];

/**
 * Our standards as an instrument panel (Noomo's bracketed mono labels, the orbit pins): line-icon
 * badges ride a slow ticker along a faint orbit line, with a point of light travelling along it.
 * The edges fade out; hovering pauses it so a badge can be read.
 */
export function ProofMarquee() {
  const row = [...BADGES, ...BADGES];
  return (
    <section aria-label="Our standards" className="group/strip relative overflow-hidden py-9 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
      {/* the orbit line and its travelling light */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute top-1/2 left-0 h-[3px] w-40 -translate-y-1/2 animate-[orbit-light_9s_linear_infinite] rounded-full bg-gradient-to-r from-transparent via-[rgb(var(--accent-rgb)/0.9)] to-transparent blur-[1px]" />

      <DrawOn>
        <ul className="relative flex w-max animate-marquee items-center gap-4 group-hover/strip:[animation-play-state:paused] sm:gap-5">
          {row.map(({ icon: Icon, label, note }, i) => (
            <li
              key={i}
              aria-hidden={i >= BADGES.length}
              style={{ "--i": i % BADGES.length } as React.CSSProperties}
              className="flex items-center gap-4 rounded-full border border-line bg-space-2/90 py-2.5 pr-6 pl-2.5 backdrop-blur transition-colors duration-500 hover:border-[rgb(var(--accent-rgb)/0.6)]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-black text-flare-soft shadow-[0_0_24px_-6px_rgb(var(--accent-rgb)/0.6)]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="whitespace-nowrap">
                <span className="block font-mono text-[11px] font-medium tracking-[0.16em] text-star uppercase">{label}</span>
                <span className="mt-0.5 block text-xs text-dust">{note}</span>
              </span>
            </li>
          ))}
        </ul>
      </DrawOn>
    </section>
  );
}
