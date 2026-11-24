import type { Metadata } from "next";
import Link from "next/link";
import { faqs, site } from "@/lib/data";
import { sunDriftFrag } from "@/components/gl/sceneShaders";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";

export const metadata: Metadata = { title: "FAQ", description: "Answers on legality, effects, dosing, shipping and returns." };

export default function FaqPage() {
  return (
    <>
      <PageHeader scene={sunDriftFrag} eyebrow="FAQ" title="Questions, answered." intro="Legality, effects, orders and returns. If yours isn’t here, ask us." />
      <Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[220px_1fr]">
        <nav aria-label="FAQ sections" className="hidden lg:block">
          <ul className="sticky top-28 space-y-3 text-sm">
            {faqs.map((g) => (
              <li key={g.group}>
                <a href={`#${g.group.toLowerCase().replace(/\s+/g, "-")}`} className="text-dust hover:text-star">
                  {g.group}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-16">
          {faqs.map((g) => (
            <section key={g.group} id={g.group.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-28">
              <h2 className="eyebrow mb-4">{g.group}</h2>
              <Accordion items={g.items} />
            </section>
          ))}
          <div className="rounded-[28px] border border-line bg-space-2 p-8 sm:p-10">
            <p className="text-2xl font-bold">Still have a question?</p>
            <p className="mt-2 text-dust">
              Write to{" "}
              <a href={`mailto:${site.email}`} className="text-star underline decoration-flare underline-offset-4">
                {site.email}
              </a>{" "}
              or use the{" "}
              <Link href="/contact" className="text-star underline decoration-flare underline-offset-4">
                contact form
              </Link>
              . We reply within one working day.
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}
