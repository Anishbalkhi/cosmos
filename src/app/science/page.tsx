import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Section";
import { LeafLegend, LeafScene } from "@/components/science/LeafScene";
import { LeafToGummy } from "@/components/science/LeafToGummy";
import { CosmosToCell } from "@/components/science/CosmosToCell";
import { Reveal } from "@/components/ui/Reveal";
import { DoseClock } from "@/components/ui/DoseClock";
import { LabReports } from "@/components/science/LabReports";
import { Placeholder } from "@/components/ui/Placeholder";
import { UniverseStage } from "@/components/journey/UniverseStage";
import { SCIENCE_SKY } from "@/lib/journey";

export const metadata: Metadata = {
  title: "The Science",
  description: "How Cosmos is legal in India, how we make every gummy, a dosing guide, and lab reports for every batch.",
};

const PROCESS = [
  { n: "01", title: "Source", body: "Fan and sugar leaves from licensed growers, harvested before the plant flowers." },
  { n: "02", title: "Extract", body: "A clean extraction concentrates the leaf’s compounds; no flower or resin ever enters the line." },
  { n: "03", title: "Dose", body: "The extract is blended with Ayurvedic botanicals and set into gummies, 5 mg in each piece." },
  { n: "04", title: "Test", body: "Every batch goes to an independent lab before it’s released. The certificate is published here." },
];

const DOSING = [
  { need: "Rest", first: "1 gummy, 60–90 min before bed", regular: "1–2 gummies", note: "Take after dinner, not on an empty stomach." },
  { need: "Balance", first: "1 gummy, on a calm day", regular: "1 gummy, up to twice a day", note: "Space doses at least 6 hours apart." },
  { need: "Focus", first: "1 gummy, an hour before work", regular: "1 gummy", note: "Avoid combining with caffeine at first." },
];

export default function SciencePage() {
  return (
    <>
      {/* one night sky behind the whole page (as on the home page): every section floats in it, no hard edges */}
      <UniverseStage sky={SCIENCE_SKY} />
      <PageHeader
        blend
        visual="moon"
        eyebrow="The Science"
        title={
          <>
            Leaf, not flower.
            <br />
            <span className="text-star/55">Tested, not trusted.</span>
          </>
        }
        intro="Everything you should know before you take your first gummy: why it’s legal, how it’s made, how to dose, and the lab report for every batch."
      />

      {/* legal */}
      <section className="pt-20 pb-8 sm:pt-28 sm:pb-10">
        <Container className="grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-5">Why it&rsquo;s legal</p>
            <h2 className="display text-4xl sm:text-5xl">The law draws a line through the plant.</h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-star/85">
              <p>
                India&rsquo;s NDPS Act prohibits <em>ganja</em>, the flowering or fruiting tops, and <em>charas</em>, the resin. Cannabis leaves and seeds, without those
                tops, fall outside that definition.
              </p>
              <p>
                Ayurveda has used the leaf, <em>vijaya</em>, for centuries. Cosmos is made from leaf extract only, under licence
                <Placeholder note="licence number">
                  {" "}
                  no. [to be added]
                </Placeholder>
                .
              </p>
            </div>
            <LeafLegend className="mt-8" />
          </Reveal>
          <LeafScene className="mx-auto aspect-square w-full max-w-[640px]" />
        </Container>
      </section>

      {/* how it meets the body: a Powers of Ten zoom into a neuron */}
      <CosmosToCell />

      {/* process: the leaf becomes a drop of extract, then a gummy, then goes through the lab */}
      <LeafToGummy steps={PROCESS} />

      {/* dosing */}
      <section id="dosing" className="scroll-mt-24 py-24 sm:py-32">
        <Container>
          <p className="eyebrow mb-5">Dosing guide</p>
          <h2 className="display max-w-3xl text-4xl sm:text-5xl">Start low. Go slow.</h2>
          <p className="mt-6 max-w-2xl text-dust">Effects build over 45 to 90 minutes. Wait at least two hours before taking more. Never drive after use.</p>
          {/* the same two-hour clock as the home page (it was a video that repeated the heading twice) */}
          <DoseClock className="mt-14 sm:mt-16" />

          {/* phones: one block per need, so nothing is cut off at the right */}
          <dl className="mt-14 grid gap-4 md:hidden">
            {DOSING.map((d) => (
              <div key={d.need} className="rounded-2xl border border-line bg-space/40 p-5 backdrop-blur-sm">
                <dt className="text-lg font-semibold">{d.need}</dt>
                <dd className="mt-3 grid gap-2 text-sm">
                  <p>
                    <span className="text-dust">First time: </span>
                    {d.first}
                  </p>
                  <p>
                    <span className="text-dust">Regular use: </span>
                    {d.regular}
                  </p>
                  <p className="text-dust">{d.note}</p>
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-14 hidden overflow-hidden rounded-[24px] border border-line bg-space/40 backdrop-blur-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line font-mono text-xs tracking-[0.12em] text-star/70 uppercase">
                <tr>
                  <th className="px-6 py-4 font-normal">Need</th>
                  <th className="px-6 py-4 font-normal">First time</th>
                  <th className="px-6 py-4 font-normal">Regular use</th>
                  <th className="px-6 py-4 font-normal">Good to know</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {DOSING.map((d) => (
                  <tr key={d.need}>
                    <th scope="row" className="px-6 py-5 text-base font-bold">
                      {d.need}
                    </th>
                    <td className="px-6 py-5">{d.first}</td>
                    <td className="px-6 py-5">{d.regular}</td>
                    <td className="px-6 py-5 text-dust">{d.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* lab reports */}
      <section id="lab-reports" className="scroll-mt-24 pt-8 pb-24 sm:pt-12 sm:pb-32">
        <Container>
          <p className="eyebrow mb-5">Lab reports</p>
          <h2 className="display max-w-3xl text-4xl sm:text-5xl">Every batch, published.</h2>
          <LabReports />
        </Container>
      </section>
    </>
  );
}
