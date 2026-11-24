import type { Metadata } from "next";
import { site } from "@/lib/data";
import { horizonRiseFrag } from "@/components/gl/sceneShaders";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Section";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with the Cosmos team." };

const WAYS = [
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  // number and handle not confirmed by the client yet: shown as text (no dead links) until they are
  { label: "WhatsApp", value: "Coming at launch", href: null },
  { label: "Instagram", value: "@cosmoscannabis", href: null },
  { label: "Hours", value: "Mon–Sat, 10am–6pm IST", href: null },
] satisfies { label: string; value: string; href: string | null }[];

export default function ContactPage() {
  return (
    <>
      <PageHeader scene={horizonRiseFrag} eyebrow="Contact" title="Say hello." intro="Questions about a product, an order, or wholesale? We reply within one working day." />
      <Container className="grid gap-16 py-16 sm:py-24 lg:grid-cols-[1.4fr_1fr]">
        <ContactForm />
        <ul className="space-y-8">
          {WAYS.map((w) => (
            <li key={w.label} className="border-t border-line pt-5">
              <p className="font-mono text-[11px] tracking-[0.14em] text-dust uppercase">{w.label}</p>
              {w.href ? (
                <a href={w.href} className="mt-2 block text-xl font-semibold hover:text-flare-soft">
                  {w.value}
                </a>
              ) : (
                <p className="mt-2 text-xl font-semibold">{w.value}</p>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
