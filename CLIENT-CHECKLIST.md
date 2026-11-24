# Cosmos Cannabis Cure: details to confirm before launch

Soft launch: the week of 11 December 2026. Everything below is a placeholder on the preview site until the
client confirms it. Each item says where it lives in the code, so it is a one-line change once decided.

## 1. Brand colour (open in the WhatsApp brief, 21 Nov: "we are seeing if we have to consider Orange")

- The preview shows **Gold** (`#e8b86d`) by default. **Orange** (`#ff7a2e`) is one click away: use the
  "Brand colour preview" switch at the bottom of any page, or open any link with `?accent=orange`
  (`?accent=gold` switches back).
- Logo green (`#9FC657`) is unchanged in both.
- Once chosen: set the winning colour as `--accent` / `--accent-soft` / `--accent-rgb` in the `:root`
  block of `src/app/globals.css`, then delete the `:root[data-accent="orange"]` block there and
  `<AccentSwitch />` (with the preview note) in `src/components/layout/Footer.tsx`.
- The black-hole and nebula animations keep their natural warm light in both versions; only the
  interface accent (buttons, highlights, glows, pouch rings) changes.

## 2. Products (max 3 at launch, from the brief): `src/lib/data.ts`

| | Event Horizon (rest) | Space Elevator – Nirvana (balance) | Goldilocks' Moonwalk Bytes (focus) |
|---|---|---|---|
| Price (pack) | ₹1,499 | ₹1,399 | ₹1,399 |
| Gummies per pack | 30 | 30 | 30 |
| Leaf extract per gummy | 5 mg | 5 mg | 5 mg |
| Other actives | Ashwagandha 50 mg, chamomile 25 mg | L-theanine 100 mg, Brahmi 50 mg | Lion's mane 100 mg, Shankhpushpi 50 mg |
| Flavour | Blackcurrant | Mango | Orange |
| Batch code | CC-EH-001 | CC-NV-001 | CC-MB-001 |
| Lab certificate (PDF) | to send | to send | to send |

Also confirm: the taglines and "story of the name" text on each product page, the dosing guide on
`/science`, and shipping (₹99, free over ₹1,999).

## 3. Names

- **Asteroid Belt** is shown as "coming soon" for the fourth need, **Ease** (the previous site listed
  rest, balance, focus and ease). Is that the right pairing?
- **Singularity** (also on the shortlist) is held back for a future formula and not shown anywhere.
  Should it appear (for example as "coming soon"), or stay unused?
- **GRIEN / LEEEF** (alternate brand names in the brief): the site uses COSMOS throughout. Confirm
  COSMOS is final.
- Store / legal name: the site now says **Cosmos Cannabis Cure**, matching the Shopify store.

## 4. Legal and contact

- AYUSH / manufacturing **licence number**: shown as "[to be added]" in the footer and on `/science`.
- **WhatsApp number**: the Contact page says "Coming at launch".
- **Instagram handle**: `@cosmoscannabis` is shown as text, not a link, until confirmed.
- Founders' letter on `/our-story` is placeholder copy.

## 5. Tone

The brief calls customers "clients/patients". The site stays in wellness language ("rest, balance,
focus") and makes no medical claims, with the standard "not intended to diagnose, treat, cure or prevent
any disease" line. Confirm that's the tone you want, or share approved medical/Ayurvedic wording.
