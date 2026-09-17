<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to?: string;
    variant?: "primary" | "secondary" | "ghost";
    size?: "md" | "lg";
    icon?: string;
    trailingIcon?: string;
    type?: "button" | "submit";
  }>(),
  { variant: "primary", size: "md", type: "button" },
);

const external = computed(() => !!props.to && /^https?:\/\//.test(props.to));
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
    :class="['game-btn', `game-btn--${variant}`, `game-btn--${size}`]"
  >
    <span class="game-btn__fill" aria-hidden="true" />
    <span class="game-btn__label">
      <UIcon v-if="icon" :name="icon" class="size-[1.15em] shrink-0" />
      <slot />
      <UIcon v-if="trailingIcon" :name="trailingIcon" class="game-btn__trail size-[1.05em] shrink-0" />
    </span>
  </NuxtLink>
  <button
    v-else
    :type="type"
    :class="['game-btn', `game-btn--${variant}`, `game-btn--${size}`]"
  >
    <span class="game-btn__fill" aria-hidden="true" />
    <span class="game-btn__label">
      <UIcon v-if="icon" :name="icon" class="size-[1.15em] shrink-0" />
      <slot />
      <UIcon v-if="trailingIcon" :name="trailingIcon" class="game-btn__trail size-[1.05em] shrink-0" />
    </span>
  </button>
</template>

<style scoped>
/* Layered so utility classes passed in (e.g. `hidden md:inline-flex`) take precedence. */
@layer components {
.game-btn {
  --bevel: 10px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    filter 0.25s ease;
  -webkit-tap-highlight-color: transparent;
}

.game-btn--md {
  min-height: 2.75rem;
  padding: 0 1.35rem;
  font-size: 0.74rem;
}

.game-btn--lg {
  min-height: 3.5rem;
  padding: 0 2rem;
  font-size: 0.84rem;
}

/* Outer bevelled border */
.game-btn::before,
.game-btn__fill {
  content: "";
  position: absolute;
  clip-path: polygon(
    var(--bevel) 0,
    calc(100% - var(--bevel)) 0,
    100% 50%,
    calc(100% - var(--bevel)) 100%,
    var(--bevel) 100%,
    0 50%
  );
}

.game-btn::before {
  inset: 0;
  z-index: -2;
}

.game-btn__fill {
  inset: 1.5px;
  z-index: -1;
  overflow: hidden;
}

/* Sweeping light */
.game-btn__fill::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 35%,
    rgba(255, 255, 255, 0.55) 50%,
    transparent 65%
  );
  transform: translateX(-120%);
  transition: transform 0.8s ease;
}

.game-btn:hover .game-btn__fill::after {
  transform: translateX(120%);
}

.game-btn__label {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.game-btn__trail {
  transition: transform 0.25s ease;
}

.game-btn:hover .game-btn__trail {
  transform: translateX(3px);
}

.game-btn:hover {
  transform: translateY(-2px);
}

.game-btn:active {
  transform: translateY(0);
  filter: brightness(0.92);
}

.game-btn:focus-visible {
  outline: 2px solid var(--color-gold-300);
  outline-offset: 4px;
}

/* Primary — molten gold */
.game-btn--primary {
  color: #2a1a06;
  text-shadow: 0 1px 0 rgba(255, 240, 200, 0.45);
  filter: drop-shadow(0 8px 22px rgba(231, 150, 40, 0.35));
}

.game-btn--primary::before {
  background: linear-gradient(180deg, #fff1c2, #a2741f 60%, #fbd77c);
}

.game-btn--primary .game-btn__fill {
  background:
    radial-gradient(120% 90% at 50% 0%, rgba(255, 248, 220, 0.55), transparent 55%),
    linear-gradient(180deg, #f6cf6e 0%, #e3a53c 55%, #c07a1f 100%);
}

.game-btn--primary:hover {
  filter: drop-shadow(0 10px 30px rgba(255, 170, 60, 0.55)) brightness(1.06);
}

/* Secondary — dark steel with gilded edge */
.game-btn--secondary {
  color: var(--color-gold-200);
}

.game-btn--secondary::before {
  background: linear-gradient(
    180deg,
    rgba(242, 212, 136, 0.85),
    rgba(162, 116, 31, 0.45) 50%,
    rgba(242, 212, 136, 0.7)
  );
}

.game-btn--secondary .game-btn__fill {
  background: linear-gradient(180deg, rgba(40, 31, 23, 0.94), rgba(14, 11, 8, 0.96));
}

.game-btn--secondary .game-btn__fill::after {
  background: linear-gradient(
    105deg,
    transparent 35%,
    rgba(242, 212, 136, 0.18) 50%,
    transparent 65%
  );
}

.game-btn--secondary:hover {
  color: #fff4d1;
  filter: drop-shadow(0 8px 24px rgba(231, 186, 90, 0.22));
}

/* Ghost — plain text link */
.game-btn--ghost {
  color: var(--color-parchment-muted);
  padding-inline: 0.5rem;
}

.game-btn--ghost::before,
.game-btn--ghost .game-btn__fill {
  display: none;
}

.game-btn--ghost:hover {
  color: var(--color-gold-300);
}
}
</style>
