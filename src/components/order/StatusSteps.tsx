import clsx from "clsx";

export const ORDER_STEPS = ["Paid", "Packed", "Shipped", "Delivered"] as const;

/** Horizontal order progress: paid → packed → shipped → delivered. */
export function StatusSteps({ current, notes }: { current: number; notes?: Partial<Record<number, string>> }) {
  return (
    <ol className="grid grid-cols-4 gap-2">
      {ORDER_STEPS.map((s, i) => {
        const done = i <= current;
        return (
          <li key={s}>
            <div className={clsx("h-1 rounded-full", done ? "bg-flare" : "bg-white/10")} />
            <p className={clsx("mt-3 text-sm font-semibold", done ? "text-star" : "text-dust")}>{s}</p>
            {notes?.[i] && <p className="mt-1 text-xs text-dust">{notes[i]}</p>}
          </li>
        );
      })}
    </ol>
  );
}
