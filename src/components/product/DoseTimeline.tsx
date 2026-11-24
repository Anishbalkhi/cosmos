import { IconClock, IconDrop } from "@/components/ui/icons";

// minutes along the track (0..150); these follow the shared how-to copy in lib/data.ts
const MARKS = [
  { at: 0, label: "Take one", note: "With or after food" },
  { at: 45, label: "45 min", note: "Effects begin" },
  { at: 90, label: "90 min", note: "Fully felt" },
  { at: 120, label: "2 hours", note: "Earliest second gummy" },
];
const SPAN = 150;

/**
 * "Start low, go slow" as a dose clock: a track from the first gummy to the two-hour mark, the
 * onset window shaded, and a comet travelling it on a loop. The written guidance follows below.
 */
export function DoseTimeline({ color, notes }: { color: string; notes: string[] }) {
  return (
    <div>
      <div className="relative mt-10 h-28" aria-hidden>
        <div className="absolute inset-x-0 top-8 h-px bg-white/15" />
        {/* onset window */}
        <div
          className="absolute top-[1.85rem] h-[6px] rounded-full"
          style={{ left: `${(45 / SPAN) * 100}%`, width: `${(45 / SPAN) * 100}%`, background: `linear-gradient(90deg, transparent, ${color}66, transparent)` }}
        />
        {/* the comet */}
        <div className="absolute top-8 left-0 h-0 w-full">
          <span
            className="absolute -top-[5px] block h-[10px] w-[10px] animate-[dose-comet_7s_cubic-bezier(0.4,0,0.2,1)_infinite] rounded-full bg-star"
            style={{ boxShadow: `0 0 14px 3px ${color}, -26px 0 18px -4px ${color}88` }}
          />
        </div>
        {MARKS.map((m) => (
          // the first mark hangs to the right of its tick so it never clips at the edge
          <div
            key={m.at}
            className={m.at === 0 ? "absolute top-0 -translate-x-[6px] text-left" : "absolute top-0 -translate-x-1/2 text-center"}
            style={{ left: `${(m.at / SPAN) * 100}%` }}
          >
            <span className={`${m.at === 0 ? "ml-[5px]" : "mx-auto"} block h-4 w-px bg-white/25`} />
            <span className={`${m.at === 0 ? "" : "mx-auto"} mt-2 block h-3 w-3 rounded-full border-2 border-space`} style={{ background: m.at === 120 ? color : "var(--color-star)" }} />
            <span className="mt-3 block font-mono text-[11px] tracking-[0.14em] whitespace-nowrap text-star uppercase">{m.label}</span>
            <span className="mt-1 hidden text-xs whitespace-nowrap text-dust sm:block">{m.note}</span>
          </div>
        ))}
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {notes.map((n, i) => {
          const warn = i === notes.length - 1;
          return (
            <li
              key={n}
              className={`flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed ${warn ? "border-[rgb(var(--accent-rgb)/0.35)] bg-[rgb(var(--accent-rgb)/0.06)] text-star/90 sm:col-span-2" : "border-line text-star/80"}`}
            >
              {warn ? <IconDrop className="mt-0.5 h-4 w-4 shrink-0 text-flare" /> : <IconClock className="mt-0.5 h-4 w-4 shrink-0 text-dust" />}
              {n}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
