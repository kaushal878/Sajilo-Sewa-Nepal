import Fuse from "fuse.js";
import type { Service } from "@/types";

/**
 * Build a Fuse index for Nepali-friendly fuzzy matching.
 *
 * Fuse's threshold is fairly forgiving, which helps with:
 *  - typos (e.g. "नागरीकता" → "नागरिकता")
 *  - English/Roman queries via aliases (e.g. "passport" → राहदानी)
 *  - partial matches (e.g. "pan" → पान कार्ड)
 */
export function buildIndex(services: Service[]) {
  return new Fuse(services, {
    includeScore: true,
    threshold: 0.42,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: "titleNe", weight: 0.5 },
      { name: "titleEn", weight: 0.15 },
      { name: "summaryNe", weight: 0.1 },
      { name: "category", weight: 0.1 },
      { name: "aliases", weight: 0.5 },
      { name: "tags", weight: 0.1 },
      { name: "documents", weight: 0.05 },
    ],
  });
}

export function searchServices(
  index: Fuse<Service>,
  query: string,
  limit = 25,
): Service[] {
  const q = query.trim();
  if (!q) return [];
  // Roman → Devanagari hint table for very common terms; Fuse handles the rest.
  const expanded = q
    .replace(/\bpassport\b/gi, "passport राहदानी")
    .replace(/\bcitizenship\b/gi, "citizenship नागरिकता")
    .replace(/\bpan\b/gi, "pan पान")
    .replace(/\bvat\b/gi, "vat भ्याट")
    .replace(/\blicense\b/gi, "license लाइसेन्स")
    .replace(/\bland\b/gi, "land जग्गा");
  return index.search(expanded, { limit }).map((r) => r.item);
}
