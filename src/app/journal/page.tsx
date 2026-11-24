import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import clsx from "clsx";
import { articles } from "@/lib/data";
import { nebulaFlightRestFrag } from "@/components/gl/sectionShaders";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Section";
import { ArticleCard, ArticleCover, formatDate } from "@/components/journal/ArticleCard";

export const metadata: Metadata = { title: "Journal", description: "Ideas for considered living: culture, wellbeing and the science of the plant." };

const TAGS = ["All", "Science", "Wellbeing", "Culture"] as const;

type Tag = (typeof TAGS)[number];

export default function JournalPage(props: PageProps<"/journal">) {
  return (
    <>
      <PageHeader scene={nebulaFlightRestFrag} eyebrow="The field journal · No. 01" title="Ideas for considered living." />
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

function JournalBody({ active }: { active: Tag }) {
  const list = active === "All" ? articles : articles.filter((a) => a.tag === active);
  const [featured, ...rest] = list;
  return (
    <>
      <Container className="py-14 sm:py-20">
        <nav aria-label="Filter by topic" className="flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <Link
              key={t}
              href={t === "All" ? "/journal" : `/journal?tag=${t}`}
              scroll={false}
              className={clsx(
                "rounded-full border px-5 py-2.5 text-sm transition-colors",
                active === t ? "border-flare bg-flare text-space" : "border-line hover:border-star/40",
              )}
            >
              {t}
            </Link>
          ))}
        </nav>

        {featured && (
          <Link href={`/journal/${featured.slug}`} className="group mt-12 grid gap-10 lg:grid-cols-[minmax(0,460px)_1fr] lg:items-center">
            <ArticleCover article={featured} size="lg" className="aspect-[3/4] rounded-[24px] transition-transform duration-700 ease-cosmic group-hover:-translate-y-2" />
            <div>
              <p className="font-mono text-[11px] tracking-[0.14em] text-dust uppercase">
                Featured · {formatDate(featured.date)} · {featured.minutes} min read
              </p>
              <h2 className="display mt-4 text-4xl transition-colors group-hover:text-flare-soft sm:text-5xl">{featured.title}</h2>
              <p className="mt-5 text-lg text-dust">{featured.excerpt}</p>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="mt-20 grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {rest.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
