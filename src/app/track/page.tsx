import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Section";
import { TrackForm } from "./TrackForm";

export const metadata: Metadata = { title: "Track your order" };

export default function TrackPage() {
  return (
    <>
      <PageHeader eyebrow="Track order" title="Where’s my Cosmos?" intro="Enter your order number and the email or phone you used at checkout." />
      <Container className="py-16 sm:py-20">
        <TrackForm />
      </Container>
    </>
  );
}
