<script setup lang="ts">
export type PatreonTier = {
  id: string;
  label: string;
  members: string[];
  memberCount: number;
};

const props = defineProps<{
  tiers: PatreonTier[];
  pending?: boolean;
}>();

// Lucide's crown is a body plus a detached base bar. Inside the diamond the bar
// floats under a top-heavy body, so the legendary gem uses the body alone,
// shifted down 2 units by the viewBox so its ink is centred like the gem and
// shield glyphs are.
const crownGlyph = {
  viewBox: "0 -2 24 24",
  path: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
};

// Tiers arrive ordered from highest to lowest, mirroring classic loot rarities.
const rarities = [
  { name: "Legendary", color: "var(--color-rarity-legendary)", icon: "i-lucide-crown", glyph: crownGlyph },
  { name: "Epic", color: "var(--color-rarity-epic)", icon: "i-lucide-gem" },
  { name: "Rare", color: "var(--color-rarity-rare)", icon: "i-lucide-shield" },
];

const populatedTiers = computed(() =>
  props.tiers
    .map((tier, index) => ({ ...tier, rarity: rarities[index] ?? rarities[2]! }))
    .filter((tier) => tier.members.length > 0),
);
</script>

<template>
  <section id="supporters" aria-labelledby="supporters-title" class="relative overflow-hidden py-24 sm:py-32">
    <div
      class="glow-orb top-1/4 left-1/2 size-[40rem] -translate-x-1/2 bg-rarity-epic/[0.07]"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading id="supporters-title" eyebrow="Hall of heroes" title="Patreon Supporters">
        Elegon is made possible by the generosity of these adventurers. Their names are etched into the history of the
        world.
      </SectionHeading>

      <div v-if="pending" class="mt-14 text-center text-parchment-dim">Summoning supporters…</div>

      <div v-else-if="populatedTiers.length" class="mt-14 space-y-4">
        <div
          v-for="(tier, index) in populatedTiers"
          :key="tier.id"
          v-reveal="index * 100"
          class="tier panel flex flex-col overflow-hidden md:flex-row md:items-stretch"
          :style="{ '--rarity': tier.rarity.color }"
        >
          <div
            class="tier__label flex shrink-0 items-center gap-4 px-6 py-5 md:w-72 md:border-r md:border-[color-mix(in_srgb,var(--rarity)_25%,transparent)]"
          >
            <span class="tier__gem flex size-10 items-center justify-center">
              <svg
                v-if="tier.rarity.glyph"
                :viewBox="tier.rarity.glyph.viewBox"
                class="relative size-5 text-[var(--rarity)]"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path :d="tier.rarity.glyph.path" />
              </svg>
              <UIcon v-else :name="tier.rarity.icon" class="relative size-5 text-[var(--rarity)]" />
            </span>
            <span class="flex flex-col">
              <span class="font-display text-sm font-bold tracking-[0.12em] text-[var(--rarity)] uppercase">
                {{ tier.label }}
              </span>
              <span class="text-xs text-parchment-dim">
                {{ tier.memberCount }} {{ tier.memberCount === 1 ? "hero" : "heroes" }}
              </span>
            </span>
          </div>

          <UMarquee
            pause-on-hover
            :ui="{ root: 'flex-1 py-4 [--duration:40s] [--gap:--spacing(10)]', content: 'items-center' }"
            :overlay="true"
          >
            <span
              v-for="member in tier.members"
              :key="`${tier.id}-${member}`"
              class="font-serif text-lg whitespace-nowrap text-parchment"
              :style="{ textShadow: `0 0 18px ${tier.rarity.color}` }"
            >
              {{ member }}
            </span>
          </UMarquee>
        </div>
      </div>

      <div v-reveal="120" class="mt-12 flex justify-center">
        <GameButton :to="SITE_LINKS.patreon" icon="i-simple-icons-patreon">Become a Supporter</GameButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tier {
  border-color: color-mix(in srgb, var(--rarity) 28%, transparent);
  box-shadow:
    inset 3px 0 0 var(--rarity),
    0 0 50px -30px var(--rarity);
}

.tier__label {
  background: linear-gradient(90deg, color-mix(in srgb, var(--rarity) 14%, transparent), transparent);
}

.tier__gem {
  position: relative;
}

.tier__gem::before {
  content: "";
  position: absolute;
  inset: 4px;
  rotate: 45deg;
  border: 1px solid color-mix(in srgb, var(--rarity) 70%, transparent);
  background: color-mix(in srgb, var(--rarity) 14%, #0d0a08);
  box-shadow: 0 0 18px color-mix(in srgb, var(--rarity) 45%, transparent);
}
</style>
