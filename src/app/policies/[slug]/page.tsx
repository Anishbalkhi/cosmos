import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { site } from "@/lib/data";
import { Container } from "@/components/ui/Section";

/** PLACEHOLDER policy text: the client's final wording replaces this (it will live in Payload). */
const POLICIES: Record<string, { title: string; updated: string; sections: { h: string; p: string }[] }> = {
  privacy: {
    title: "Privacy policy",
    updated: "2026-12-01",
    sections: [
      { h: "What we collect", p: "Your name, email, phone and delivery address when you order or join the waitlist, and basic analytics about how the site is used." },
      { h: "How we use it", p: "To deliver your order, send order updates, and, if you agree, occasional emails. We never sell your data." },
      { h: "Payments", p: "Payments are processed by Razorpay. We never see or store your card or UPI details." },
      { h: "Your rights", p: `Write to ${site.email} to see, correct or delete your data.` },
    ],
  },
  terms: {
    title: "Terms of service",
    updated: "2026-12-01",
    sections: [
      { h: "Eligibility", p: "You must be 18 or older to buy or use Cosmos products." },
      { h: "Products", p: "Our products are wellness supplements made from cannabis leaf extract. They are not intended to diagnose, treat, cure or prevent any disease." },
      { h: "Orders", p: "An order is confirmed once payment is received. We may cancel and refund an order if a product is unavailable." },
    ],
  },
  shipping: {
    title: "Shipping policy",
    updated: "2026-12-01",
    sections: [
      { h: "Where we ship", p: "Across India, to PIN codes our courier partners serve." },
      { h: "Timing", p: "Orders are packed within one working day and usually arrive in 3 to 6 working days." },
      { h: "Cost", p: `Free over ₹${site.freeShippingOver}; otherwise ₹${site.shippingFee}.` },
    ],
  },
  refund: {
    title: "Refund policy",
    updated: "2026-12-01",
    sections: [
      { h: "Damaged or wrong items", p: "Email us within 48 hours of delivery with a photo and we’ll replace or refund the item." },
      { h: "Opened packs", p: "For safety reasons, opened packs can’t be returned." },
      { h: "Refund timing", p: "Approved refunds go back to the original payment method within 5 to 7 working days." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  return POLICIES[slug] ? { title: POLICIES[slug].title } : {};
}

export default function PolicyPage(props: PageProps<"/policies/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <PolicyPageContent params={props.params} />
    </Suspense>
  );
}

async function PolicyPageContent({ params }: { params: PageProps<"/policies/[slug]">["params"] }) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();
  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Last updated {policy.updated}</p>
        <h1 className="display mt-5 text-5xl sm:text-6xl">{policy.title}</h1>
        <div className="mt-14 space-y-10">
          {policy.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-xl font-bold">{s.h}</h2>
              <p className="mt-3 leading-relaxed text-dust">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
