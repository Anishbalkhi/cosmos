/**
 * Mock content for the UI build.
 * Everything here moves into Payload CMS later; the shapes match the
 * planned collections (Products, Needs, Articles, FAQs) so the pages
 * only swap their data source.
 *
 * PLACEHOLDER values (prices, mg, counts, ingredients, copy) must be
 * confirmed by the client before launch.
 */

export type NeedId = "rest" | "balance" | "focus" | "ease";

export type Need = {
  id: NeedId;
  name: string;
  line: string;
  /** product slug, or null while no product exists for this need */
  product: string | null;
};

export type Glyph = "blackhole" | "elevator" | "moon" | "asteroids";

export type Product = {
  slug: string;
  name: string;
  short: string; // short name for tight spaces
  need: NeedId;
  tagline: string;
  price: number; // INR
  mgPerGummy: number;
  count: number;
  color: string; // accent colour for cards + product page
  glyph: Glyph;
  story: string;
  ingredients: { name: string; amount: string }[];
  howTo: string[];
  batch: string;
  coaUrl: string;
  faqs: { q: string; a: string }[];
};

export const needs: Need[] = [
  { id: "rest", name: "Rest", line: "Wind down and stay asleep.", product: "event-horizon" },
  { id: "balance", name: "Balance", line: "Steady the mood, soften the noise.", product: "nirvana" },
  { id: "focus", name: "Focus", line: "Clear, calm attention for long days.", product: "moonwalk-bytes" },
  { id: "ease", name: "Ease", line: "Relief for a body that’s been working hard.", product: null },
];

const commonHowTo = [
  "Start with one gummy. Wait at least two hours before taking another.",
  "Effects usually begin within 45 to 90 minutes.",
  "Take it with or after food for a gentler, steadier onset.",
  "Not for use during pregnancy, while breastfeeding, or under 18. Do not drive after use.",
];

// PLACEHOLDERS until the client confirms them (see CLIENT-CHECKLIST.md in the project root):
// price, mgPerGummy, count, ingredients and amounts, batch codes, coaUrl, taglines and stories.
// The names are the client's own shortlist (WhatsApp, 21 Nov 2026).
export const products: Product[] = [
  {
    slug: "event-horizon",
    name: "Event Horizon",
    short: "Event Horizon",
    need: "rest",
    tagline: "The point past which the day can’t follow you.",
    price: 1499,
    mgPerGummy: 5,
    count: 30,
    color: "#5b4bff",
    glyph: "blackhole",
    story:
      "An event horizon is the edge of a black hole: the line beyond which nothing comes back. We named our night formula after it because that is what good sleep feels like. The emails, the noise, the loop of tomorrow’s list all stay on the other side.",
    ingredients: [
      { name: "Cannabis sativa leaf extract", amount: "5 mg" },
      { name: "Ashwagandha root extract", amount: "50 mg" },
      { name: "Chamomile flower extract", amount: "25 mg" },
      { name: "Fruit pectin, cane sugar, natural blackcurrant", amount: "—" },
    ],
    howTo: commonHowTo,
    batch: "CC-EH-001",
    coaUrl: "#",
    faqs: [
      { q: "Will I feel groggy in the morning?", a: "Most people don’t at one gummy. If you do, take it earlier in the evening or try half." },
      { q: "Can I take it every night?", a: "Many people do. Talk to your doctor if you take other sleep or anxiety medication." },
    ],
  },
  {
    slug: "nirvana",
    name: "Space Elevator – Nirvana",
    short: "Nirvana",
    need: "balance",
    tagline: "A slow ride up, away from the noise.",
    price: 1399,
    mgPerGummy: 5,
    count: 30,
    color: "#12b5a5",
    glyph: "elevator",
    story:
      "A space elevator is the dream of rising out of the atmosphere without a rocket: no blast, just a steady climb. Nirvana is built for that kind of lift. Not a high, a quieter vantage point on a loud day.",
    ingredients: [
      { name: "Cannabis sativa leaf extract", amount: "5 mg" },
      { name: "L-theanine", amount: "100 mg" },
      { name: "Brahmi leaf extract", amount: "50 mg" },
      { name: "Fruit pectin, cane sugar, natural mango", amount: "—" },
    ],
    howTo: commonHowTo,
    batch: "CC-NV-001",
    coaUrl: "#",
    faqs: [
      { q: "Can I take it during the day?", a: "Yes. Start with one on a day off to learn how it feels for you." },
      { q: "Is it habit-forming?", a: "The leaf extract contains no psychoactive flower or resin. Still, use it as a tool, not a crutch." },
    ],
  },
  {
    slug: "moonwalk-bytes",
    name: "Goldilocks’ Moonwalk Bytes",
    short: "Moonwalk Bytes",
    need: "focus",
    tagline: "Not too wired, not too slow. Just right.",
    price: 1399,
    mgPerGummy: 5,
    count: 30,
    color: "#f2a516",
    glyph: "moon",
    story:
      "The Goldilocks zone is the narrow band around a star where a planet is neither too hot nor too cold for life. Moonwalk Bytes aims for the same middle: calm enough to stop the scatter, awake enough to get the work done.",
    ingredients: [
      { name: "Cannabis sativa leaf extract", amount: "5 mg" },
      { name: "Lion’s mane mushroom extract", amount: "100 mg" },
      { name: "Shankhpushpi extract", amount: "50 mg" },
      { name: "Fruit pectin, cane sugar, natural orange", amount: "—" },
    ],
    howTo: commonHowTo,
    batch: "CC-MB-001",
    coaUrl: "#",
    faqs: [
      { q: "Does it have caffeine?", a: "No. It’s designed to work without stimulants." },
      { q: "When should I take it?", a: "About an hour before the work that needs your attention." },
    ],
  },
];

// "Asteroid Belt" is on the client's shortlist; pairing it with the fourth need, Ease (from the
// previous site's "rest, balance, focus and ease"), is our assumption until they confirm.
export const comingSoon = {
  name: "Asteroid Belt",
  need: "ease" as NeedId,
  color: "#e0567a",
  glyph: "asteroids" as Glyph,
};

/**
 * Shortlisted names not yet used on the site. The brief caps the launch at 3 products, so
 * Singularity is held back for a future formula rather than announced.
 */
export const reservedNames = ["Singularity"] as const;

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function needOf(id: NeedId) {
  return needs.find((n) => n.id === id)!;
}

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  tag: "Science" | "Wellbeing" | "Culture";
  minutes: number;
  date: string; // ISO
  body: string[];
  related: string[];
};

export const articles: Article[] = [
  {
    slug: "leaf-not-flower",
    title: "Leaf, not flower: how Cosmos is legal in India",
    excerpt: "India’s narcotics law draws a line through the cannabis plant. Here’s which side we’re on, and why.",
    tag: "Science",
    minutes: 5,
    date: "2026-12-01",
    body: [
      "India’s NDPS Act defines ganja as the flowering or fruiting tops of the cannabis plant, and charas as its resin. Both are prohibited. The leaves and seeds, when not accompanied by those tops, sit outside that definition.",
      "That distinction has allowed Ayurvedic practitioners to use cannabis leaf, known as vijaya, for centuries, and it is the basis on which licensed manufacturers make leaf-based products today.",
      "Every Cosmos gummy is made only from leaf extract, under licence, and every batch is tested by an independent lab. You can read each batch’s certificate on the product page.",
    ],
    related: ["event-horizon", "nirvana"],
  },
  {
    slug: "start-low-go-slow",
    title: "Start low, go slow: your first gummy",
    excerpt: "A calm guide to timing, food, and what to expect the first time.",
    tag: "Wellbeing",
    minutes: 4,
    date: "2026-12-03",
    body: [
      "Gummies take longer to work than most people expect. Your body has to digest them first, so effects often begin between 45 and 90 minutes.",
      "The most common mistake is taking a second one too soon. Give the first a full two hours.",
      "Take your first one at home, on an evening with nothing to do, and keep a note of how you feel. That note is the most useful dosing guide you’ll ever have.",
    ],
    related: ["event-horizon", "moonwalk-bytes"],
  },
  {
    slug: "anatomy-of-the-plant",
    title: "Anatomy of the cannabis plant",
    excerpt: "Fan leaves, nodes, internodes, and which part ends up in your gummy.",
    tag: "Culture",
    minutes: 6,
    date: "2026-12-05",
    body: [
      "The fan leaves are the plant’s solar panels: the large, many-fingered leaves most people picture when they think of cannabis.",
      "Nodes are where branches leave the stem, and the spaces between them are internodes. The flowering tops grow at the nodes later in the plant’s life.",
      "Cosmos uses only the fan and sugar leaves, harvested before flowering, then extracted and lab-tested for consistency.",
    ],
    related: ["nirvana"],
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}

export type FaqGroup = { group: string; items: { q: string; a: string }[] };

export const faqs: FaqGroup[] = [
  {
    group: "Legality",
    items: [
      { q: "Is Cosmos legal in India?", a: "Yes. We use only cannabis leaf, which the NDPS Act does not classify as ganja, and we manufacture under licence. See The Science page for details." },
      { q: "Will it show up on a drug test?", a: "Leaf extract contains far less THC than flower, but trace amounts are possible. If you are tested for work or sport, don’t take it." },
      { q: "Do I need to be 18?", a: "Yes. You must be 18 or older to buy or use Cosmos." },
    ],
  },
  {
    group: "Effects and dosing",
    items: [
      { q: "Will I get high?", a: "Our gummies are designed for calm, not a high. Effects are subtle and build over 45 to 90 minutes." },
      { q: "How many should I take?", a: "Start with one. Wait two hours before considering a second. See the dosing guide on The Science page." },
      { q: "Can I combine it with medication?", a: "Ask your doctor first, especially for sleep, anxiety, blood pressure or blood-thinning medicines." },
    ],
  },
  {
    group: "Orders and shipping",
    items: [
      { q: "Where do you ship?", a: "Across India, to every PIN code our courier partners serve. You can check yours at checkout." },
      { q: "How long does delivery take?", a: "Usually 3 to 6 working days. You’ll get a tracking link by email when your order ships." },
      { q: "Is the packaging discreet?", a: "Yes. Orders ship in a plain outer box with no cannabis branding." },
    ],
  },
  {
    group: "Returns",
    items: [
      { q: "Can I return an opened pack?", a: "For safety, we can’t accept opened packs. If something arrives damaged, email us within 48 hours with a photo." },
    ],
  },
];

export const site = {
  launchDate: "2026-12-11",
  email: "info@cosmoscannabis.in",
  city: "Bangalore",
  freeShippingOver: 1999,
  shippingFee: 99,
};

export function inr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
