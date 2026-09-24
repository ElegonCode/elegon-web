<script setup lang="ts">
import { SUPPORTED_LOCALES } from "~/utils/locales";

type ChangelogEntry = {
  id: number;
  date: string;
  description: string;
};

type ChangelogResponse = {
  revision: string;
  entries: ChangelogEntry[];
};
definePageMeta({ alias: ["/:locale(en|de|es|fr|pt-BR|ru|zh-CN)/changelog"] });
const { locale, t, localePath } = useLocale();

const {
  data: changelog,
  pending: isLoading,
  error: changelogError,
} = await useFetch<ChangelogResponse>("/api/changelog", {
  key: "public-changelog",
});
const entries = computed(() => changelog.value?.entries ?? []);

const siteUrl = useSiteUrl();
const description = t("changelog.description");

useHead({
  htmlAttrs: { lang: locale.value },
  link: [
    { rel: "canonical", href: `${siteUrl}${localePath("/changelog")}` },
    ...SUPPORTED_LOCALES.map((code) => ({ rel: "alternate", hreflang: code, href: `${siteUrl}${localePath("/changelog", code)}` })),
    { rel: "alternate", hreflang: "x-default", href: `${siteUrl}/changelog` },
  ],
});
useSeoMeta({
  title: t("changelog.title"),
  description,
  ogType: "website",
  ogSiteName: "Elegon",
  ogUrl: `${siteUrl}${localePath("/changelog")}`,
  ogTitle: `Elegon ${t("changelog.title")}`,
  ogDescription: description,
  ogImage: { url: `${siteUrl}/images/og-image.jpg`, width: 1200, height: 630, alt: SCREENSHOT.alt },
  twitterCard: "summary_large_image",
  twitterTitle: `Elegon ${t("changelog.title")}`,
  twitterDescription: description,
  twitterImage: `${siteUrl}/images/og-image.jpg`,
});

const groups = computed(() => {
  const byDate = new Map<string, ChangelogEntry[]>();
  for (const entry of entries.value) {
    const dateEntries = byDate.get(entry.date) ?? [];
    dateEntries.push(entry);
    byDate.set(entry.date, dateEntries);
  }

  return Array.from(byDate, ([date, changes]) => ({
    date,
    label: friendlyDate(date),
    changes: changes.sort((a, b) => b.id - a.id),
  })).sort((a, b) => b.date.localeCompare(a.date));
});

function dateAtUtcMidnight(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function friendlyDate(value: string) {
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const targetUtc = dateAtUtcMidnight(value).getTime();
  const daysAgo = Math.round((todayUtc - targetUtc) / 86_400_000);

  if (daysAgo === 0) return t("changelog.today");
  if (daysAgo === 1) return t("changelog.yesterday");
  if (daysAgo > 1 && daysAgo < 7) return `${daysAgo} ${t("changelog.daysAgo")}`;

  return new Intl.DateTimeFormat(locale.value, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateAtUtcMidnight(value));
}
</script>

<template>
  <div class="min-h-screen xl:grid xl:grid-cols-2">
    <section
      aria-labelledby="changelog-title"
      class="relative isolate overflow-hidden border-b border-gold-500/15 xl:sticky xl:inset-y-0 xl:h-screen xl:border-b-0"
    >
      <SkyBg />
      <div
        class="absolute top-1/2 -right-1/2 z-[-1] size-60 -translate-y-1/2 rounded-full bg-gold-500 blur-[300px] sm:size-100"
        aria-hidden="true"
      />
      <EmberField :density="3" />
      <div class="relative flex h-full items-center px-4 pt-36 pb-20 sm:px-6 lg:px-8 xl:justify-center xl:pt-0 xl:pb-0">
        <div class="flex max-w-lg flex-col gap-5">
          <p class="eyebrow">Chronicles of development</p>
          <h1
            id="changelog-title"
            class="font-display text-5xl leading-none font-bold tracking-wide text-shine sm:text-6xl"
          >
            Updates
          </h1>
          <OrnamentDivider width="12rem" class="justify-start!" />
          <p class="font-serif text-lg leading-relaxed text-parchment-muted sm:text-xl">
            The latest Elegon fixes, improvements, and new features.
          </p>
          <div class="flex flex-wrap items-center gap-3 pt-2">
            <GameButton :to="SITE_LINKS.steam" icon="i-simple-icons-steam">Play the Playtest</GameButton>
            <GameButton :to="SITE_LINKS.feedback" variant="ghost" trailing-icon="i-lucide-arrow-up-right">
              Feedback
            </GameButton>
          </div>
        </div>
      </div>
    </section>

    <section class="px-4 sm:px-6 xl:px-0 xl:-ms-30 xl:flex-1">
      <div v-if="isLoading" class="py-32 text-muted">Loading updates...</div>
      <UAlert
        v-else-if="changelogError"
        class="my-32 max-w-xl"
        color="error"
        title="Could not load updates"
        :description="changelogError.message"
      />
      <UChangelogVersions
        v-else
        as="div"
        :indicator-motion="false"
        :ui="{ root: 'py-16 sm:py-24 lg:py-32', indicator: 'inset-y-0' }"
      >
        <UChangelogVersion
          v-for="(group, index) in groups"
          :key="group.date"
          :title="group.label"
          :date="group.date"
          :badge="index === 0 ? 'Latest' : undefined"
          :ui="{
            root: 'flex items-start',
            container: 'max-w-xl min-w-0 flex-1',
            header: 'border-b border-default pb-4',
            title: 'text-3xl',
            date: 'text-xs/9 text-highlighted font-mono',
            indicator: 'sticky top-0 pt-16 -mt-16 sm:pt-24 sm:-mt-24 lg:pt-32 lg:-mt-32',
          }"
        >
          <template #body>
            <ul class="list-disc space-y-3 pl-5 text-muted wrap-anywhere">
              <li v-for="change in group.changes" :key="change.id">
                {{ change.description }}
              </li>
            </ul>
          </template>
        </UChangelogVersion>
      </UChangelogVersions>
    </section>
  </div>
</template>
