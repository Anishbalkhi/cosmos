import { BlackHoleHero } from "@/components/home/BlackHoleHero";
import { Manifesto } from "@/components/home/Manifesto";
import { NeedsWheel } from "@/components/home/NeedsWheel";
import { TheRange } from "@/components/home/TheRange";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ProofMarquee } from "@/components/home/ProofMarquee";
import { ThePlant } from "@/components/home/ThePlant";
import { JournalTeaser } from "@/components/home/JournalTeaser";
import { ClosingCta } from "@/components/home/ClosingCta";

export default function Home() {
  return (
    <>
      {/* pulled up under the announcement bar and the transparent header, so the hero is exactly one screen tall */}
      <div className="-mt-[calc(4rem+var(--ann))] sm:-mt-[calc(5rem+var(--ann))]">
        <BlackHoleHero />
      </div>
      <Manifesto />
      <NeedsWheel />
      <TheRange />
      <HowItWorks />
      <ProofMarquee />
      <ThePlant />
      <JournalTeaser />
      <ClosingCta />
    </>
  );
}
