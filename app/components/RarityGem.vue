<script setup lang="ts">
// Inline prop type: the SFC compiler must resolve it, and auto-imported types are not visible to it.
withDefaults(
  defineProps<{
    rarity: { color: string; icon: string; glyph?: { viewBox: string; path: string } };
    size?: "md" | "sm";
  }>(),
  { size: "md" },
);

// The root is shrink-0: in a fixed-width column a long tier title otherwise squeezes the gem,
// and the rotated square behind the icon turns into a lopsided rhombus.
</script>

<template>
  <span
    :class="['rarity-gem flex shrink-0 items-center justify-center', size === 'sm' ? 'size-8' : 'size-10']"
    :style="{ '--rarity': rarity.color }"
  >
    <svg
      v-if="rarity.glyph"
      :viewBox="rarity.glyph.viewBox"
      :class="['relative text-[var(--rarity)]', size === 'sm' ? 'size-4' : 'size-5']"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path :d="rarity.glyph.path" />
    </svg>
    <UIcon
      v-else
      :name="rarity.icon"
      :class="['relative text-[var(--rarity)]', size === 'sm' ? 'size-4' : 'size-5']"
    />
  </span>
</template>

<style scoped>
.rarity-gem {
  position: relative;
}

.rarity-gem::before {
  content: "";
  position: absolute;
  inset: 4px;
  rotate: 45deg;
  border: 1px solid color-mix(in srgb, var(--rarity) 70%, transparent);
  background: color-mix(in srgb, var(--rarity) 14%, #0d0a08);
  box-shadow: 0 0 18px color-mix(in srgb, var(--rarity) 45%, transparent);
}
</style>
