<script setup lang="ts">
const { t, localePath } = useLocale();
const columns = computed(() => [
  {
    title: t("footer.game"),
    links: [
      { label: t("footer.world"), to: `${localePath()}#world` },
      { label: t("nav.features"), to: `${localePath()}#features` },
      { label: t("footer.vision"), to: `${localePath()}#vision` },
      { label: t("nav.faq"), to: `${localePath()}#faq` },
      { label: t("nav.changelog"), to: localePath("/changelog") },
    ],
  },
  {
    title: t("footer.community"),
    links: [
      { label: "Steam", to: SITE_LINKS.steam },
      { label: "Discord", to: SITE_LINKS.discord },
      { label: "YouTube", to: SITE_LINKS.youtube },
      { label: "Patreon", to: SITE_LINKS.patreon },
    ],
  },
  {
    title: t("footer.shape"),
    links: [
      { label: t("footer.feedback"), to: SITE_LINKS.feedback },
      { label: t("nav.roadmap"), to: SITE_LINKS.roadmap },
    ],
  },
]);

const isExternal = (to: string) => to.startsWith("http");
</script>

<template>
  <footer class="relative overflow-hidden border-t border-gold-500/15 bg-ink-950">
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent"
      aria-hidden="true"
    />
    <div class="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_2fr] lg:px-8">
      <div class="max-w-sm space-y-5">
        <NuxtLink :to="localePath()" class="flex items-center gap-3" :aria-label="t('nav.home')">
          <AppLogo class="h-11 w-11 rounded-sm ring-1 ring-gold-500/40" />
          <span class="font-display text-2xl font-bold tracking-[0.28em] text-gold-gradient">ELEGON</span>
        </NuxtLink>
        <p class="font-serif leading-relaxed text-parchment-muted">
          {{ t("footer.description") }}
        </p>
        <p class="flex items-center gap-2 text-sm text-parchment-dim">
          <UIcon name="i-simple-icons-godotengine" class="size-4" />
          {{ t("footer.engine") }}
        </p>
      </div>

      <nav :aria-label="t('nav.footer')" class="grid grid-cols-2 gap-10 sm:grid-cols-3">
        <div v-for="column in columns" :key="column.title">
          <h2 class="eyebrow mb-5 !text-[0.7rem]">{{ column.title }}</h2>
          <ul class="space-y-3">
            <li v-for="link in column.links" :key="link.label">
              <NuxtLink
                :to="link.to"
                :target="isExternal(link.to) ? '_blank' : undefined"
                :rel="isExternal(link.to) ? 'noopener' : undefined"
                class="text-parchment-muted transition hover:text-gold-300"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="border-t border-gold-500/10">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-parchment-dim sm:flex-row sm:px-6 lg:px-8"
      >
        <p>© {{ new Date().getFullYear() }} Elegon. {{ t("footer.rights") }}</p>
        <p class="font-display text-xs tracking-[0.25em] uppercase">{{ t("footer.london") }}</p>
      </div>
    </div>
  </footer>
</template>
