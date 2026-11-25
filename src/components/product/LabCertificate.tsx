import { tone } from "@/lib/data";
import clsx from "clsx";
import { LeafStar } from "@/components/brand/LeafStar";
import { CoaLink } from "./CoaLink";

const TESTS = [
  { name: "Potency", note: "Leaf-extract content per gummy" },
  { name: "Heavy metals", note: "Screened against safety limits" },
  { name: "Microbial", note: "Yeast, mould and bacteria" },
];

/** A seal that turns slowly: "lab tested · every batch" round the Cosmos mark. */
export function LabSeal({ id = "seal", className, color = "var(--color-flare)" }: { id?: string; className?: string; color?: string }) {
  const ring = `${id}-ring`;
  return (
    <div className={clsx("relative aspect-square", className)} aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-[spin_40s_linear_infinite]">
        <defs>
          <path id={ring} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="0.6" />
        <circle cx="50" cy="50" r="30" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="0.4" strokeDasharray="1 2" />
        <text fontSize="6.4" letterSpacing="2.6" fill="var(--color-star)" fontFamily="var(--font-geist-mono)">
          <textPath href={`#${ring}`}>LAB TESTED · EVERY BATCH · INDEPENDENT LAB ·</textPath>
        </text>
      </svg>
      <LeafStar className="absolute inset-[34%]" color={color} />
    </div>
  );
}

/**
 * The batch's lab report as a certificate card. It lists what is tested and links the PDF; until
 * the first batch is tested it says so plainly (no results are shown before they exist).
 */
export function LabCertificate({ batch, coaUrl, color, compact = false }: { batch: string; coaUrl: string; color: string; compact?: boolean }) {
  const published = !!coaUrl && coaUrl !== "#";
  return (
    <div
      className={clsx(
        "grain relative overflow-hidden rounded-[28px] border border-line bg-space-2",
        compact ? "p-6" : "grid items-center gap-8 p-8 sm:p-10 md:grid-cols-[auto_1fr]",
      )}
    >
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl" style={{ background: `${color}22` }} />
      <LabSeal id={`seal-${batch}`} className={compact ? "mb-5 w-20" : "mx-auto w-36 sm:w-44"} color={color} />
      <div className="relative">
        <p className="font-mono text-[11px] tracking-[0.18em] text-dust uppercase">{compact ? "Certificate of analysis" : "Certificate of analysis · NABL-accredited lab"}</p>
        <p className={clsx("mt-3 font-mono tracking-[0.04em] whitespace-nowrap text-star", compact ? "text-xl" : "text-3xl sm:text-4xl")}>Batch {batch}</p>
        <ul className={clsx("mt-6 grid gap-3", !compact && "lg:grid-cols-3")}>
          {TESTS.map((t) => (
            <li key={t.name} className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-black/30 px-4 py-3 lg:flex-col">
              <span>
                <span className="block text-sm font-semibold whitespace-nowrap">{t.name}</span>
                {!compact && <span className="mt-1 block text-xs text-dust">{t.note}</span>}
              </span>
              <span className="shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] whitespace-nowrap uppercase" style={{ borderColor: `${tone(color)}66`, color: tone(color) }}>
                {published ? "Passed" : "At launch"}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <CoaLink url={coaUrl} label="Download certificate (PDF)" className="h-11 px-5" />
          {!published && <p className="text-xs text-dust">Results are published here with the first batch.</p>}
        </div>
      </div>
    </div>
  );
}
