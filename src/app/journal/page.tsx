import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import clsx from "clsx";
import { articles } from "@/lib/data";
import { nebulaFlightRestFrag } from "@/components/gl/sectionShaders";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Section";
import { TAG_PLANET, formatDate } from "@/components/journal/ArticleCard";
import { Planet } from "@/components/space/Planet";
import { UniverseStage } from "@/components/journey/UniverseStage";
import { NIGHT_SKY } from "@/lib/journey";

export const metadata: Metadata = { title: "Journal", description: "Notes on the plant, the law and dosing: short, plain reads from Cosmos." };

const TAGS = ["All", "Science", "Wellbeing", "Culture"] as const;

type Tag = (typeof TAGS)[number];

export default function JournalPage(props: PageProps<"/journal">) {
  return (
    <>
      {/* one night sky behind the whole page (as on every other page): the planets float in it, no boxes */}
      <UniverseStage sky={NIGHT_SKY} />
      <PageHeader
        blend
        scene={nebulaFlightRestFrag}
        eyebrow="Journal"
        title="Notes on the plant, the law and dosing."
        intro="Short, plain reads, written to answer the questions people actually ask. No miracle claims."
      />
      <Suspense fallback={<JournalBody active="All" />}>
        <FilteredJournal searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function FilteredJournal({ searchParams }: { searchParams: PageProps<"/journal">["searchParams"] }) {
  const { tag } = (await searchParams) as { tag?: string };
  return <JournalBody active={TAGS.find((t) => t === tag) ?? "All"} />;
}

/**
 * An editorial index instead of mock magazine covers (they repeated a huge "COSMOS" masthead on every card,
 * cropped their planets and hid the titles): one featured story with its planet floating in the sky, then
 * the rest as a plain list, each with its planet small at the side.
 */
function JournalBody({ active }: { active: Tag }) {
  const list = active === "All" ? articles : articles.filter((a) => a.tag === active);
  const [featured, ...rest] = list;
  const count = (t: Tag) => (t === "All" ? articles.length : articles.filter((a) => a.tag === t).length);
  return (
    <Container className="pt-2 pb-24 sm:pb-32">
      {/* topics: outline chips with counts (one row that scrolls sideways on a phone) */}
      <nav aria-label="Filter by topic">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          {TAGS.map((t) => (
            <Link
              key={t}
              href={t === "All" ? "/journal" : `/journal?tag=${t}`}
              scroll={false}
              aria-current={active === t ? "page" : undefined}
              className={clsx(
                "shrink-0 rounded-full border px-5 py-2.5 text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flare",
                active === t ? "border-star/60 bg-white/10 font-semibold text-star" : "border-line text-star/80 hover:border-star/40 hover:text-star",
              )}
            >
              {t === "All" ? "All notes" : t}
              <span className="ml-1.5 text-star/45 tabular-nums">{count(t)}</span>
            </Link>
          ))}
        </div>
      </nav>

      {featured && (
        <Link href={`/journal/${featured.slug}`} className="group mt-14 grid items-center gap-10 sm:mt-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div className="relative mx-auto w-full max-w-[17rem] sm:max-w-[26rem]">
            <Planet
              name={TAG_PLANET[featured.tag].planet}
              shade="side"
              glow={TAG_PLANET[featured.tag].glow}
              sizes="(max-width: 640px) 272px, 416px"
              className="w-full transition-transform duration-[1.6s] ease-cosmic group-hover:scale-[1.03] group-hover:rotate-[3deg]"
            />
          </div>
          <div>
            <p className="font-mono text-xs tracking-[0.14em] text-flare-soft uppercase">
              {active === "All" ? "Latest" : featured.tag} · {formatDate(featured.date)} · {featured.minutes} min read
            </p>
            <h2 className="display mt-4 text-4xl text-balance transition-colors group-hover:text-flare-soft sm:text-5xl lg:text-6xl">{featured.title}</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-star/75">{featured.excerpt}</p>
            <p className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-star">
              Read the note <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </p>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <section className="mt-20 sm:mt-28" aria-labelledby="more-title">
          <h2 id="more-title" className="eyebrow mb-4 text-star/60">
            More notes
          </h2>
          <ul className="border-t border-line">
            {rest.map((a) => (
              <li key={a.slug} className="border-b border-line">
                <Link
                  href={`/journal/${a.slug}`}
                  className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 py-7 sm:grid-cols-[9rem_1fr_6rem] sm:py-9"
                >
                  <p className="col-span-2 text-sm text-dust sm:col-span-1">
                    {a.tag}
                    <span className="block text-xs text-dust/80">
                      {formatDate(a.date)} · {a.minutes} min
                    </span>
                  </p>
                  <div>
                    <h3 className="display text-2xl text-balance transition-colors group-hover:text-flare-soft sm:text-4xl">{a.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-star/70 sm:text-base">{a.excerpt}</p>
                  </div>
                  <Planet
                    name={TAG_PLANET[a.tag].planet}
                    shade="side"
                    sizes="96px"
                    className="w-16 justify-self-end transition-transform duration-700 ease-cosmic group-hover:scale-110 sm:w-24"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {list.length === 1 && (
        <p className="mt-16 text-star/70">
          More {active === "All" ? "" : `${active.toLowerCase()} `}notes are on their way.{" "}
          <Link href="/journal" scroll={false} className="text-star underline decoration-flare underline-offset-4 hover:text-flare-soft">
            See all notes
          </Link>
        </p>
      )}
    </Container>
  );
}
