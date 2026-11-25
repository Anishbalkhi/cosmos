import { BlackHoleHero } from "@/components/home/BlackHoleHero";
import { Manifesto } from "@/components/home/Manifesto";
import { NeedsWheel } from "@/components/home/NeedsWheel";
import { TheRange } from "@/components/home/TheRange";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TheStandards } from "@/components/home/TheStandards";
import { JournalTeaser } from "@/components/home/JournalTeaser";
import { ClosingCta } from "@/components/home/ClosingCta";
import { UniverseStage } from "@/components/journey/UniverseStage";
import { StarDust } from "@/components/journey/StarDust";
import { FlyBys } from "@/components/journey/FlyBys";

// One voyage, following the light: every section is a stop (data-stop) on a single journey
// (lib/journey.ts). One sky sits behind them all and one layer of star dust in front; the sections
// are transparent or feathered, so the sky is what shows at every seam. The footer is stop 9.
export default function Home() {
  return (
    <>
      <UniverseStage />
      {/* pulled up under the announcement bar and the transparent header, so the hero is exactly one screen tall */}
      <div data-stop="0" className="-mt-[calc(4rem+var(--ann))] sm:-mt-[calc(5rem+var(--ann))]">
        <BlackHoleHero />
      </div>
      <div data-stop="1">
        <Manifesto />
      </div>
      <div data-stop="2">
        <NeedsWheel />
      </div>
      <div data-stop="3">
        <TheRange />
      </div>
      <div data-stop="4">
        <HowItWorks />
      </div>
      {/* stops 5 and 6 share one seam: the old proof strip and plant are one section now */}
      <div data-stop="5" aria-hidden />
      <div data-stop="6">
        <TheStandards />
      </div>
      <div data-stop="7">
        <JournalTeaser />
      </div>
      <div data-stop="8">
        <ClosingCta />
      </div>
      <FlyBys />
      <StarDust />
    </>
  );
}
