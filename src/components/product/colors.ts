/** Colours shared by the product's 3D objects (pouch scene, gummy close-up). */
export type RGB = [number, number, number];

// gummy colours follow each formula's flavour: blackcurrant, mango, orange
export const GUMMY: Record<string, RGB> = {
  "event-horizon": [0.5, 0.17, 0.6],   // lighter blackcurrant: the deep purple read as grapes
  nirvana: [1.0, 0.6, 0.1],
  "moonwalk-bytes": [1.0, 0.42, 0.06],
};

export function rgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
