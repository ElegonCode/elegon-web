<script setup lang="ts">
withDefaults(
  defineProps<{
    id?: string;
    eyebrow?: string;
    title: string;
    align?: "center" | "left";
  }>(),
  { align: "center" },
);
</script>

<template>
  <header
    v-reveal
    :class="[
      'flex flex-col gap-4',
      align === 'center' ? 'items-center text-center' : 'items-start text-left',
    ]"
  >
    <p v-if="eyebrow" class="eyebrow flex items-center gap-3">
      <span class="h-px w-8 bg-gold-500/60" aria-hidden="true" />
      {{ eyebrow }}
      <span v-if="align === 'center'" class="h-px w-8 bg-gold-500/60" aria-hidden="true" />
    </p>
    <h2
      :id="id"
      :class="[
        'font-display text-4xl leading-[1.05] font-bold tracking-wide text-balance text-gold-gradient sm:text-5xl',
        align === 'center' && 'lg:text-6xl',
      ]"
    >
      {{ title }}
    </h2>
    <OrnamentDivider v-if="align === 'center'" class="mt-1" />
    <div
      v-if="$slots.default"
      :class="[
        'font-serif text-lg leading-relaxed text-parchment-muted text-pretty sm:text-xl',
        align === 'center' ? 'max-w-2xl' : 'max-w-xl',
      ]"
    >
      <slot />
    </div>
  </header>
</template>
