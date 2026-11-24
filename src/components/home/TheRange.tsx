import { products } from "@/lib/data";
import { Container, SectionHeading } from "@/components/ui/Section";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export function TheRange() {
  return (
    <section className="pt-24 pb-12 sm:pt-32 sm:pb-16">
      <Container>
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="The range" title="Three formulas. One belief." intro="The right dose at the right moment is a quiet kind of medicine." />
          <ButtonLink href="/shop" variant="ghost" arrow className="shrink-0">
            Shop all
          </ButtonLink>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={i * 120}>
              <ProductCard product={p} index={i} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
