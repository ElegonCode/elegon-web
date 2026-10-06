<script setup lang="ts">
// A medal for Patreon supporters with their months of support in the middle.
// It grows grander with time: bronze, silver, gold with laurels, an amethyst
// gem, then a radiant legendary star. The looks are named only in code: the
// label shows the player's Patreon tier, so the two are never confused.
// `former`: the run has ended. The medal they earned stays, shown calmer.
const props = defineProps<{ months: number; tiers?: string[]; former?: boolean }>();
const tierLabel = computed(() => props.tiers?.filter(Boolean).join(" · ") || "Elegon supporter");

type Tier = { key: string; light: string; mid: string; dark: string; ink: string; glow: string };
const TIERS: (Tier & { from: number })[] = [
  { from: 24, key: "legendary", light: "#fff3c4", mid: "#f6a623", dark: "#a2470c", ink: "#3a1602", glow: "rgba(246,166,35,0.55)" },
  { from: 12, key: "epic", light: "#f0dcff", mid: "#a76bf0", dark: "#4b1d86", ink: "#fff", glow: "rgba(167,107,240,0.45)" },
  { from: 6, key: "gold", light: "#fff6cf", mid: "#e7ba5a", dark: "#8a5a12", ink: "#3b2504", glow: "rgba(231,186,90,0.35)" },
  { from: 3, key: "silver", light: "#ffffff", mid: "#c3cad3", dark: "#5f6873", ink: "#22272d", glow: "rgba(195,202,211,0.25)" },
  { from: 0, key: "bronze", light: "#f7d2b0", mid: "#c07a43", dark: "#6b3a17", ink: "#2c1406", glow: "rgba(192,122,67,0.2)" },
];
const tier = computed(() => TIERS.find(t => props.months >= t.from)!);
const label = computed(() => (props.months < 1 ? "New" : String(props.months)));
const fontSize = computed(() => (label.value.length >= 3 ? 15 : label.value === "New" ? 13 : 20));
const id = useId();
const gradient = `badge-face-${id}`;
const rim = `badge-rim-${id}`;
const shine = `badge-shine-${id}`;

// An octagon for the gem tiers, a circle for the metals.
const octagon = (r: number) => Array.from({ length: 8 }, (_, i) => {
  const a = Math.PI / 8 + (i * Math.PI) / 4;
  return `${(32 + r * Math.cos(a)).toFixed(2)},${(32 + r * Math.sin(a)).toFixed(2)}`;
}).join(" ");
const rays = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  const p = (r: number, da = 0) => `${(32 + r * Math.cos(a + da)).toFixed(2)},${(32 + r * Math.sin(a + da)).toFixed(2)}`;
  return `${p(18, -0.2)} ${p(31.5)} ${p(18, 0.2)}`;
});
// Two laurel branches climbing the lower sides, each leaf tilted along its branch.
const leaves = [
  ...Array.from({ length: 6 }, (_, i) => ({ angle: 205 + i * 17, tilt: -32 })),
  ...Array.from({ length: 6 }, (_, i) => ({ angle: 155 - i * 17, tilt: 32 })),
];
</script>

<template>
  <div class="supporter-badge" :class="[`supporter-badge--${tier.key}`, { 'supporter-badge--former': former }]" :style="{ '--glow': tier.glow }">
    <svg viewBox="0 0 64 64" class="supporter-badge__medal" role="img" :aria-label="`${former ? 'Former supporter' : 'Supporter'} medal, ${months} ${months === 1 ? 'month' : 'months'} of support`">
      <defs>
        <radialGradient :id="gradient" cx="38%" cy="30%" r="75%">
          <stop offset="0%" :stop-color="tier.light" />
          <stop offset="55%" :stop-color="tier.mid" />
          <stop offset="100%" :stop-color="tier.dark" />
        </radialGradient>
        <linearGradient :id="rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" :stop-color="tier.light" />
          <stop offset="50%" :stop-color="tier.dark" />
          <stop offset="100%" :stop-color="tier.mid" />
        </linearGradient>
        <linearGradient :id="shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#fff" stop-opacity="0" />
          <stop offset="50%" stop-color="#fff" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
      </defs>

      <g v-if="tier.key === 'legendary'" class="supporter-badge__rays">
        <polygon v-for="(ray, i) in rays" :key="i" :points="ray" :fill="`url(#${rim})`" />
      </g>
      <g v-if="tier.key === 'gold' || tier.key === 'epic' || tier.key === 'legendary'" :fill="tier.key === 'epic' ? '#c9a4f5' : '#e7ba5a'" :stroke="tier.key === 'epic' ? '#5b2a9c' : '#8a5a12'" stroke-width="0.4">
        <ellipse v-for="leaf in leaves" :key="leaf.angle" cx="32" cy="5.5" rx="2.2" ry="4.6" :transform="`rotate(${leaf.angle} 32 32) rotate(${leaf.tilt} 32 5.5)`" />
      </g>

      <template v-if="tier.key === 'epic' || tier.key === 'legendary'">
        <polygon :points="octagon(24)" :fill="`url(#${rim})`" />
        <polygon :points="octagon(21)" :fill="`url(#${gradient})`" />
        <polygon :points="octagon(17)" fill="none" :stroke="tier.light" stroke-opacity="0.45" stroke-width="0.8" />
      </template>
      <template v-else>
        <circle cx="32" cy="32" r="24" :fill="`url(#${rim})`" />
        <circle cx="32" cy="32" r="21" :fill="`url(#${gradient})`" />
        <circle cx="32" cy="32" r="17.5" fill="none" :stroke="tier.light" stroke-opacity="0.5" stroke-width="0.8" stroke-dasharray="1.5 2" />
      </template>

      <text x="32" y="32" text-anchor="middle" dominant-baseline="central" :fill="tier.ink" :font-size="fontSize" class="supporter-badge__number">{{ label }}</text>
      <rect v-if="tier.key !== 'bronze'" class="supporter-badge__shine" x="-30" y="0" width="22" height="64" :fill="`url(#${shine})`" transform="skewX(-20)" />
    </svg>
    <div class="min-w-0">
      <template v-if="former">
        <p class="text-xs uppercase tracking-[0.2em] text-parchment-muted">Former Patreon supporter</p>
        <p class="mt-1 font-display text-lg leading-tight text-parchment">Thank you for your support</p>
        <p class="mt-0.5 text-xs text-parchment-muted">Supported Elegon for {{ months }} {{ months === 1 ? 'month' : 'months' }}</p>
      </template>
      <template v-else>
        <p class="text-xs uppercase tracking-[0.2em] text-orange-200/90">Patreon supporter</p>
        <p class="mt-1 font-display text-lg leading-tight text-parchment">{{ tierLabel }}</p>
        <p class="mt-0.5 text-xs text-parchment-muted">{{ months < 1 ? 'Supporting Elegon since this month' : `${months} ${months === 1 ? 'month' : 'months'} supporting Elegon` }}</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.supporter-badge { display: flex; align-items: center; gap: 0.85rem; }
.supporter-badge__medal { width: 4rem; height: 4rem; flex-shrink: 0; overflow: visible; filter: drop-shadow(0 0 0.55rem var(--glow)); }
.supporter-badge__number { font-family: var(--font-display); font-weight: 700; letter-spacing: -0.02em; }
.supporter-badge__shine { opacity: 0; }
.supporter-badge--gold .supporter-badge__shine,
.supporter-badge--epic .supporter-badge__shine,
.supporter-badge--legendary .supporter-badge__shine { animation: badge-shine 4.5s ease-in-out infinite; }
.supporter-badge--legendary .supporter-badge__rays { transform-origin: 32px 32px; animation: badge-spin 40s linear infinite; }
.supporter-badge--legendary .supporter-badge__medal { animation: badge-pulse 3s ease-in-out infinite; }
@keyframes badge-shine { 0%, 55% { opacity: 0; transform: skewX(-20deg) translateX(0); } 60% { opacity: 1; } 85%, 100% { opacity: 0; transform: skewX(-20deg) translateX(110px); } }
@keyframes badge-spin { to { transform: rotate(360deg); } }
@keyframes badge-pulse { 50% { filter: drop-shadow(0 0 0.9rem var(--glow)); } }
/* An ended run keeps its medal, quieter: muted colour and no movement. */
.supporter-badge--former .supporter-badge__medal { filter: grayscale(0.45) brightness(0.85); animation: none !important; }
.supporter-badge--former .supporter-badge__shine, .supporter-badge--former .supporter-badge__rays { animation: none !important; }
@media (prefers-reduced-motion: reduce) {
  .supporter-badge__shine, .supporter-badge__rays, .supporter-badge__medal { animation: none !important; }
}
</style>
