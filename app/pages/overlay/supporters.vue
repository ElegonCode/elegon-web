<script setup lang="ts">
// Patreon supporters as a single compact card, for use as an OBS browser source.
// No site chrome, transparent page background.
definePageMeta({ layout: false });

useHead({
  title: "Supporters Overlay",
  htmlAttrs: { class: "overlay" },
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const { data, refresh } = await useFetch<{ tiers: PatreonTier[] }>("/api/patreon-members", {
  key: "patreon-members",
  default: () => ({ tiers: [] }),
});

// Keep showing the last good list if a later refresh fails, so the card never vanishes mid-stream.
const lastTiers = ref<PatreonTier[]>(data.value?.tiers ?? []);
watch(data, (value) => {
  if (value?.tiers?.length) lastTiers.value = value.tiers;
});

const tiers = computed(() => withSupporterRarity(lastTiers.value));

// Marquee duration is per full pass of the names, so scale it by the (estimated) width of the
// row to keep every row scrolling at the same speed regardless of how many names it has.
const SCROLL_PX_PER_SECOND = 45;
function scrollDuration(members: string[]) {
  const width = members.reduce((total, name) => total + name.length * 9 + 24, 0);
  return `${Math.max(12, Math.round(width / SCROLL_PX_PER_SECOND))}s`;
}

// Browser sources stay open for hours; pick up new supporters on the same cadence as the API cache.
onMounted(() => {
  const timer = setInterval(() => refresh(), 10 * 60 * 1000);
  onBeforeUnmount(() => clearInterval(timer));
});
</script>

<template>
  <div class="overlay-root">
    <div v-if="tiers.length" class="overlay-frame corners">
      <div class="overlay-card panel">
        <div
          v-for="tier in tiers"
          :key="tier.id"
          class="overlay-row"
          :style="{ '--rarity': tier.rarity.color, '--row-duration': scrollDuration(tier.members) }"
        >
          <div class="overlay-row__badge">
            <RarityGem :rarity="tier.rarity" size="sm" />
          </div>

          <div class="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-2">
            <p class="flex items-baseline gap-2 px-3 font-display text-[0.62rem] font-bold tracking-[0.14em] uppercase">
              <span class="truncate text-[var(--rarity)]">{{ tier.label }}</span>
              <span class="shrink-0 text-parchment-dim">· {{ tier.memberCount }}</span>
            </p>

            <UMarquee
              :overlay="false"
              :ui="{
                root: 'overlay-row__names [--duration:var(--row-duration)] [--gap:--spacing(6)]',
                content: 'items-center',
              }"
            >
              <span
                v-for="member in tier.members"
                :key="`${tier.id}-${member}`"
                class="font-serif text-[0.95rem] leading-snug whitespace-nowrap text-parchment"
                :style="{ textShadow: `0 0 12px ${tier.rarity.color}` }"
              >
                {{ member }}
              </span>
            </UMarquee>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Breathing room so the card's glow and gilded corners aren't clipped by the source bounds. */
.overlay-root {
  padding: 14px;
}

/* Compact corner widget: pinned top-left, never wider than 24rem (shrinks with the source). */
.overlay-frame {
  width: 100%;
  max-width: 24rem;
}

.overlay-card {
  overflow: hidden;
}

.overlay-row {
  display: flex;
  align-items: stretch;
  box-shadow: inset 3px 0 0 var(--rarity);
}

.overlay-row + .overlay-row {
  border-top: 1px solid rgba(231, 186, 90, 0.12);
}

.overlay-row__badge {
  display: flex;
  width: 3.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-right: 1px solid color-mix(in srgb, var(--rarity) 25%, transparent);
  background: linear-gradient(90deg, color-mix(in srgb, var(--rarity) 18%, transparent), transparent);
}

/* Fade names in and out at the edges without painting a background colour over the card. */
:deep(.overlay-row__names) {
  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
}
</style>
