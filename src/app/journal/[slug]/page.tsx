import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle, getProduct } from "@/lib/data";
import { Container } from "@/components/ui/Section";
import { ArticleCard, ArticleCover, formatDate } from "@/components/journal/ArticleCard";
import { ProductCard } from "@/components/product/ProductCard";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(props: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const a = getArticle(slug);
  return a ? { title: a.title, description: a.excerpt } : {};
}

export default function ArticlePage(props: PageProps<"/journal/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ArticlePageContent params={props.params} />
    </Suspense>
  );
}

async function ArticlePageContent({ params }: { params: PageProps<"/journal/[slug]">["params"] }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const related = a.related.map(getProduct).filter((p) => !!p);
  const idx = articles.findIndex((x) => x.slug === a.slug);
  const next = articles[(idx + 1) % articles.length];

  return (
    <article>
      <Container className="pt-14 sm:pt-20">
        <div className="mx-auto max-w-3xl">
          <Link href="/journal" className="font-mono text-[11px] tracking-[0.14em] text-dust uppercase hover:text-star">
            ← Journal
          </Link>
          <p className="eyebrow mt-10">
            {a.tag} · {formatDate(a.date)} · {a.minutes} min read
          </p>
          <h1 className="display mt-5 text-4xl sm:text-6xl">{a.title}</h1>
          <p className="mt-6 text-xl text-dust">{a.excerpt}</p>
        </div>
        <ArticleCover article={a} size="lg" className="mx-auto mt-14 aspect-[3/4] max-w-md rounded-[24px]" />
        <div className="mx-auto mt-14 max-w-2xl space-y-6 text-lg leading-[1.8] text-star/90">
          {a.body.map((para, i) => (
            <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:font-extrabold first-letter:text-flare" : ""}>
              {para}
            </p>
          ))}
        </div>
      </Container>

      {related.length > 0 && (
        <section className="mt-24 border-t border-line py-20">
          <Container>
            <p className="eyebrow mb-5">Products in this story</p>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {next && next.slug !== a.slug && (
        <section className="border-t border-line py-20">
          <Container className="max-w-md">
            <p className="eyebrow mb-5">Read next</p>
            <ArticleCard article={next} />
          </Container>
        </section>
      )}
    </article>
  );
}
