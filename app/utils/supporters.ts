export type PatreonTier = {
  id: string;
  label: string;
  members: string[];
  memberCount: number;
};

export type RarityGlyph = { viewBox: string; path: string };

export type SupporterRarity = {
  name: string;
  color: string;
  icon: string;
  glyph?: RarityGlyph;
};

// Lucide's crown is a body plus a detached base bar. Inside the diamond the bar
// floats under a top-heavy body, so the legendary gem uses the body alone,
// shifted down 2 units by the viewBox so its ink is centred like the gem and
// shield glyphs are.
const crownGlyph: RarityGlyph = {
  viewBox: "0 -2 24 24",
  path: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
};

// Tiers arrive ordered from highest to lowest, mirroring classic loot rarities.
export const SUPPORTER_RARITIES: SupporterRarity[] = [
  { name: "Legendary", color: "var(--color-rarity-legendary)", icon: "i-lucide-crown", glyph: crownGlyph },
  { name: "Epic", color: "var(--color-rarity-epic)", icon: "i-lucide-gem" },
  { name: "Rare", color: "var(--color-rarity-rare)", icon: "i-lucide-shield" },
];

/** Pairs each tier with its rarity styling and drops tiers without members. */
export function withSupporterRarity(tiers: PatreonTier[]) {
  return tiers
    .map((tier, index) => ({ ...tier, rarity: SUPPORTER_RARITIES[index] ?? SUPPORTER_RARITIES[2]! }))
    .filter((tier) => tier.members.length > 0);
}
