<script setup lang="ts">
export type LatestUpdates = {
  total: number;
  since: string | null;
  entries: { id: number; date: string; description: string }[];
};

defineProps<{ updates: LatestUpdates | null | undefined }>();
const { locale, t, localePath } = useLocale();

const formatDate = (value: string) => new Intl.DateTimeFormat(locale.value, {
  day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
}).format(new Date(`${value}T00:00:00Z`));
</script>

<template>
  <section
    v-if="updates?.entries.length"
    id="updates"
    aria-labelledby="updates-title"
    class="relative overflow-hidden py-24 sm:py-32"
  >
    <div class="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:gap-20 lg:px-8">
      <div class="space-y-8 lg:sticky lg:top-28 lg:self-start">
        <SectionHeading id="updates-title" :eyebrow="t('updates.eyebrow')" :title="t('updates.title')" align="left">
          {{ t("updates.intro") }}
        </SectionHeading>

        <div v-reveal="120" class="panel corners inline-flex items-center gap-5 px-6 py-5">
          <span class="font-display text-5xl font-bold text-gold-gradient">{{ updates.total }}</span>
          <span class="font-display text-xs leading-relaxed tracking-[0.2em] text-parchment-muted uppercase">
            {{ t("updates.shipped") }}<br />
            <span v-if="updates.since" class="text-parchment-dim">{{ t("updates.since") }} {{ updates.since }}</span>
          </span>
        </div>

        <div v-reveal="180">
          <GameButton :to="localePath('/changelog')" variant="secondary" trailing-icon="i-lucide-arrow-right">
            {{ t("updates.viewAll") }}
          </GameButton>
        </div>
      </div>

      <ol class="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[0.95rem] before:w-px before:bg-gradient-to-b before:from-gold-400/60 before:via-gold-500/20 before:to-transparent">
        <li v-for="(entry, index) in updates.entries" :key="entry.id" v-reveal="index * 70" class="relative pl-12">
          <span
            class="absolute top-6 left-[0.62rem] size-3 rotate-45 border border-gold-400 bg-ink-950 shadow-[0_0_12px_rgba(231,186,90,0.5)]"
            :class="{ 'bg-gold-400!': index === 0 }"
            aria-hidden="true"
          />
          <article class="panel px-6 py-5 transition duration-300 hover:border-gold-400/35">
            <div class="mb-2 flex items-center gap-3">
              <time :datetime="entry.date" class="font-display text-[0.68rem] font-semibold tracking-[0.2em] text-gold-400 uppercase">
                {{ formatDate(entry.date) }}
              </time>
              <span
                v-if="index === 0"
                class="border border-green-400/40 bg-green-400/10 px-2 py-0.5 font-display text-[0.6rem] tracking-[0.2em] text-green-300 uppercase"
              >
                {{ t("updates.latest") }}
              </span>
            </div>
            <p class="leading-relaxed text-parchment wrap-anywhere">{{ entry.description }}</p>
          </article>
        </li>
      </ol>
    </div>
  </section>
</template>
