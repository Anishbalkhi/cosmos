import type { Metadata } from "next";
import { Suspense } from "react";
import { LeafStar } from "@/components/brand/LeafStar";
import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { StatusSteps } from "@/components/order/StatusSteps";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

/** UI phase: shows a sample order. Backend phase: load the order by id + a signed token. */
async function OrderNumber({ params }: { params: PageProps<"/order/[id]">["params"] }) {
  const { id } = await params;
  return <>Order {decodeURIComponent(id)}</>;
}

export default function OrderPage(props: PageProps<"/order/[id]">) {
  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="relative mx-auto grid h-28 w-28 place-items-center">
          <div className="absolute inset-0 rounded-full bg-flare/30 blur-2xl" />
          <LeafStar className="relative h-20 w-20" />
        </div>
        <p className="eyebrow mt-10 text-center">
          <Suspense fallback="Order confirmed">
            <OrderNumber params={props.params} />
          </Suspense>
        </p>
        <h1 className="display mt-4 text-center text-5xl sm:text-7xl">You&rsquo;re in orbit.</h1>
        <p className="mx-auto mt-6 max-w-lg text-center text-dust">
          Thank you. Your payment went through and a confirmation with your GST invoice is on its way to your email.
        </p>

        <div className="mt-14 rounded-[28px] border border-line bg-space-2 p-7 sm:p-10">
          <StatusSteps current={0} notes={{ 0: "Just now", 1: "Within 24 hours", 2: "1–2 days", 3: "3–6 days" }} />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-[28px] border border-line p-7">
            <p className="eyebrow mb-3">What happens next</p>
            <p className="text-sm leading-relaxed text-dust">
              We pack your order within a day and email a tracking link when it ships. It arrives in a plain outer box.
            </p>
          </div>
          <div className="rounded-[28px] border border-line p-7">
            <p className="eyebrow mb-3">Your first gummy</p>
            <p className="text-sm leading-relaxed text-dust">Start with one, ideally after food. Give it a full two hours before deciding on another.</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/track" variant="ghost">
            Track this order
          </ButtonLink>
          <ButtonLink href="/journal/start-low-go-slow" arrow>
            Read: your first gummy
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
