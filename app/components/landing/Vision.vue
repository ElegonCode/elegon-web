<script setup lang="ts">
const { t } = useLocale();
const pillars = computed(() => [
  {
    numeral: "I",
    title: t("vision.p1.title"), text: t("vision.p1.text"),
  },
  {
    numeral: "II",
    title: t("vision.p2.title"), text: t("vision.p2.text"),
  },
  {
    numeral: "III",
    title: t("vision.p3.title"), text: t("vision.p3.text"),
  },
]);
</script>

<template>
  <section id="vision" aria-labelledby="vision-title" class="vision relative isolate overflow-hidden py-28 sm:py-36">
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <img
        :src="SCREENSHOT.src"
        :srcset="SCREENSHOT.srcset"
        sizes="100vw"
        alt=""
        loading="lazy"
        decoding="async"
        class="size-full scale-110 object-cover object-[50%_15%] blur-[2px] brightness-[0.45] saturate-[1.2]"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-950/40 to-ink-950" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(13,10,8,0.85)_100%)]" />
    </div>

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading id="vision-title" :eyebrow="t('vision.eyebrow')" :title="t('vision.title')" />

      <figure v-reveal="120" class="mx-auto mt-14 max-w-4xl text-center">
        <UIcon name="i-lucide-quote" class="mx-auto mb-4 size-8 text-gold-500/60" />
        <blockquote class="font-serif text-3xl leading-snug text-balance text-parchment sm:text-4xl lg:text-5xl">
          {{ t("vision.quote") }}
        </blockquote>
        <figcaption class="mt-6 font-display text-xs tracking-[0.3em] text-parchment-dim uppercase">
          {{ t("vision.credit") }}
        </figcaption>
      </figure>

      <ol class="mt-20 grid gap-5 lg:grid-cols-3">
        <li
          v-for="(pillar, index) in pillars"
          :key="pillar.title"
          v-reveal="index * 120"
          class="panel corners relative flex flex-col bg-ink-950/60! p-8 backdrop-blur-md sm:p-10"
        >
          <span
            class="pointer-events-none absolute top-4 right-6 font-display text-7xl font-bold text-gold-500/[0.08] select-none"
            aria-hidden="true"
          >
            {{ pillar.numeral }}
          </span>
          <span class="eyebrow mb-3 !text-[0.68rem]">{{ t("vision.pillar") }} {{ pillar.numeral }}</span>
          <h3 class="font-display text-2xl font-bold tracking-wide text-gold-200">{{ pillar.title }}</h3>
          <div class="my-5 h-px w-12 bg-gradient-to-r from-gold-400 to-transparent" aria-hidden="true" />
          <p class="font-serif leading-relaxed text-parchment-muted">{{ pillar.text }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
