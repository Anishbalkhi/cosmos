import { ButtonLink } from "@/components/ui/Button";
import { ShaderCanvas } from "@/components/gl/ShaderCanvas";
import { tiltedHoleFrag } from "@/components/gl/sceneShaders";

const POST = { threshold: 0.7, bloom: 0.5, streak: 0.1, aberration: 0.012, exposure: 1.1, grain: 0.035, vignette: 0.3 };

export default function NotFound() {
  return (
    <section className="relative isolate grid min-h-[80vh] place-items-center overflow-hidden py-24 text-center">
      {/* a black hole tilted in the dark: where lost pages go (reference pin 984669906014577592) */}
      <div className="absolute inset-0 -z-20" aria-hidden>
        <ShaderCanvas frag={tiltedHoleFrag} scale={0.6} post={POST} />
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgb(0_0_0/0.55),transparent_80%)]" aria-hidden />
      <div className="px-5">
        <p className="eyebrow">Error 404</p>
        <h1 className="display mt-6 text-6xl sm:text-8xl">Lost in space.</h1>
        <p className="mx-auto mt-6 max-w-md text-star/80">This page drifted past the event horizon. Let&rsquo;s get you back.</p>
        <div className="mt-10 flex justify-center gap-3">
          <ButtonLink href="/" arrow>
            Back home
          </ButtonLink>
          <ButtonLink href="/shop" variant="ghost">
            Shop
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
