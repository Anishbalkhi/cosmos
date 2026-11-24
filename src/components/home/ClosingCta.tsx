"use client";

import { WaitlistForm } from "@/components/layout/WaitlistForm";
import { LeafStar } from "@/components/brand/LeafStar";
import { ShaderCanvas } from "@/components/gl/ShaderCanvas";
import { bipolarNebulaFrag } from "@/components/gl/sectionShaders";

const POST = { threshold: 0.75, bloom: 0.55, streak: 0.12, aberration: 0.012, exposure: 1.05, grain: 0.03, vignette: 0.3 };

export function ClosingCta() {
  return (
    <section id="waitlist" className="relative isolate scroll-mt-24 overflow-hidden bg-black py-32 sm:py-44">
      <div className="absolute inset-0 -z-10">
        {/* a bipolar nebula opening around the headline (reference pin 611574824453228661) */}
        <ShaderCanvas frag={bipolarNebulaFrag} scale={0.6} post={POST} />
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_55%,rgb(0_0_0/0.5),rgb(0_0_0/0.15)_80%)]" />
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <LeafStar className="mx-auto h-12 w-12" />
        <p className="bracket mt-8 text-star/80">[ Your next discovery starts here ]</p>
        <h2 data-split className="display mt-6 text-6xl sm:text-8xl lg:text-9xl">
          Explore with intention.
          <br />
          <em className="text-flare-soft">Find your Cosmos.</em>
        </h2>
        <p className="mx-auto mt-8 max-w-lg text-star/80">Join the waitlist for launch-day access and a first-order welcome gift.</p>
        <WaitlistForm size="lg" className="mx-auto mt-10 max-w-lg" />
      </div>
    </section>
  );
}
