import Link from "next/link";
import { articles, type Article } from "@/lib/data";
import { Planet, type PlanetName } from "@/components/space/Planet";

// each cover gets a real planet photograph (NASA, public domain)
export const TAG_PLANET: Record<Article["tag"], { planet: PlanetName; glow: string }> = {
  Science: { planet: "earth", glow: "rgba(120,170,255,0.35)" },
  Wellbeing: { planet: "neptune", glow: "rgba(90,120,255,0.4)" },
  Culture: { planet: "jupiter", glow: "rgba(232,184,109,0.35)" },
};

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function issueOf(article: Article) {
  return String(articles.findIndex((a) => a.slug === article.slug) + 1).padStart(2, "0");
}

/**
 * Magazine-cover art (reference: Cosmos magazine pin): serif masthead,
 * issue line, a half-lit real planet photograph and the cover line.
 */
export function ArticleCover({ article, className = "", size = "md" }: { article: Article; className?: string; size?: "md" | "lg" }) {
  const c = TAG_PLANET[article.tag];
  const month = new Date(article.date + "T00:00:00Z").toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" });
  return (
    <div className={`grain relative overflow-hidden bg-black text-star ${className}`}>
      {/* planet */}
      <Planet
        name={c.planet}
        shade="side"
        glow={c.glow}
        sizes={size === "lg" ? "(max-width: 768px) 90vw, 460px" : "(max-width: 768px) 90vw, 380px"}
        className="absolute top-[28%] left-[6%] w-[100%] transition-transform duration-[1.6s] ease-cosmic group-hover:scale-[1.04] group-hover:rotate-[4deg]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/85" />
      <div className="absolute inset-x-0 top-0 flex flex-col items-center px-[7%] pt-[5%]">
        <div className="flex w-full justify-between font-mono text-[11px] tracking-[0.16em] uppercase opacity-85">
          <span>Issue {issueOf(article)}</span>
          <span className="hidden sm:inline">The science of everyday</span>
          <span>{month}</span>
        </div>
        <p className={`serif-display mt-1 leading-none tracking-[0.02em] ${size === "lg" ? "text-[17vw] sm:text-[9vw] lg:text-[7.5rem]" : "text-[18vw] sm:text-[8vw] md:text-[5.2vw] lg:text-[4.6rem]"}`}>
          COSMOS
        </p>
      </div>
      <p
        className={`serif-display absolute inset-x-[7%] bottom-[7%] text-center leading-[1.05] uppercase ${size === "lg" ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}
      >
        {article.title}
      </p>
    </div>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/journal/${article.slug}`} className="group flex h-full flex-col">
      <ArticleCover article={article} className="aspect-[3/4] rounded-[20px] transition-transform duration-700 ease-cosmic group-hover:-translate-y-2 group-hover:rotate-[-0.6deg]" />
      <p className="bracket mt-5 text-dust">
        [ {article.tag} ] {formatDate(article.date)} · {article.minutes} min
      </p>
      <p className="mt-2 text-sm text-dust">{article.excerpt}</p>
    </Link>
  );
}
