<script setup lang="ts">
import { SUPPORTED_LOCALES } from "~/utils/locales";

type NewsPost = {
  id: string;
  title: string;
  date: string;
  url: string;
  image: string | null;
  excerpt: string;
};

definePageMeta({ alias: ["/:locale(en|de|es|fr|pt-BR|ru|zh-CN)/news"] });
const { locale, t, localePath } = useLocale();

const { data, error } = await useFetch<{ steamUrl: string; posts: NewsPost[] }>("/api/news", {
  key: "steam-news",
});
const posts = computed(() => data.value?.posts ?? []);
const featured = computed(() => posts.value[0]);
const rest = computed(() => posts.value.slice(1));
const steamNewsUrl = computed(
  () => data.value?.steamUrl ?? "https://store.steampowered.com/news/app/4268360",
);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(locale.value, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

const siteUrl = useSiteUrl();
const description = t("news.description");
useHead({
  htmlAttrs: { lang: locale.value },
  link: [
    { rel: "canonical", href: `${siteUrl}${localePath("/news")}` },
    ...SUPPORTED_LOCALES.map((code) => ({
      rel: "alternate",
      hreflang: code,
      href: `${siteUrl}${localePath("/news", code)}`,
    })),
    { rel: "alternate", hreflang: "x-default", href: `${siteUrl}/news` },
  ],
});
useSeoMeta({
  title: t("news.title"),
  description,
  ogType: "website",
  ogSiteName: "Elegon",
  ogUrl: `${siteUrl}${localePath("/news")}`,
  ogTitle: `Elegon ${t("news.title")}`,
  ogDescription: description,
  ogImage: { url: `${siteUrl}/images/og-image.jpg`, width: 1200, height: 630, alt: SCREENSHOT.alt },
  twitterCard: "summary_large_image",
  twitterTitle: `Elegon ${t("news.title")}`,
  twitterDescription: description,
  twitterImage: `${siteUrl}/images/og-image.jpg`,
});
</script>

<template>
  <div class="min-h-screen">
    <section
      aria-labelledby="news-title"
      class="relative isolate overflow-hidden border-b border-gold-500/15"
    >
      <SkyBg />
      <div
        class="absolute top-1/2 -right-40 z-[-1] size-60 -translate-y-1/2 rounded-full bg-gold-500 blur-[300px] sm:size-100"
        aria-hidden="true"
      />
      <EmberField :density="3" />
      <div class="relative mx-auto max-w-7xl px-4 pt-36 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div class="flex max-w-2xl flex-col gap-5">
          <p class="eyebrow">{{ t("news.eyebrow") }}</p>
          <h1
            id="news-title"
            class="font-display text-5xl leading-none font-bold tracking-wide text-shine sm:text-6xl"
          >
            {{ t("news.heading") }}
          </h1>
          <OrnamentDivider width="12rem" class="justify-start!" />
          <p class="font-serif text-lg leading-relaxed text-parchment-muted sm:text-xl">
            {{ t("news.intro") }}
          </p>
          <div class="flex flex-wrap items-center gap-3 pt-2">
            <GameButton :to="SITE_LINKS.steam" icon="i-simple-icons-steam">{{
              t("nav.wishlistSteam")
            }}</GameButton>
            <GameButton
              :to="localePath('/changelog')"
              variant="ghost"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ t("nav.changelog") }}
            </GameButton>
          </div>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <UAlert
        v-if="error"
        class="max-w-xl"
        color="error"
        :title="t('news.error')"
        :actions="[
          {
            label: t('news.allOnSteam'),
            to: steamNewsUrl,
            target: '_blank',
            trailingIcon: 'i-lucide-arrow-up-right',
          },
        ]"
      />
      <p v-else-if="!posts.length" class="text-parchment-muted">{{ t("news.empty") }}</p>

      <template v-else>
        <NuxtLink
          v-if="featured"
          :to="localePath(`/news/${featured.id}`)"
          class="news-card group panel corners grid overflow-hidden lg:grid-cols-[1.35fr_1fr]"
        >
          <div class="relative aspect-video overflow-hidden bg-ink-900 lg:aspect-auto lg:min-h-96">
            <img
              :src="featured.image ?? SCREENSHOT.src"
              alt=""
              class="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.03]"
              fetchpriority="high"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-ink-950/40"
              aria-hidden="true"
            />
          </div>
          <div class="flex flex-col justify-center gap-4 p-6 sm:p-10">
            <div class="flex flex-wrap items-center gap-3">
              <span
                class="border border-green-400/40 bg-green-400/10 px-2 py-0.5 font-display text-[0.6rem] tracking-[0.2em] text-green-300 uppercase"
              >
                {{ t("news.latest") }}
              </span>
              <time
                :datetime="featured.date"
                class="font-display text-[0.68rem] font-semibold tracking-[0.2em] text-gold-400 uppercase"
              >
                {{ formatDate(featured.date) }}
              </time>
            </div>
            <h2
              class="font-display text-2xl leading-tight font-bold text-gold-200 transition group-hover:text-gold-300 sm:text-3xl"
            >
              {{ featured.title }}
            </h2>
            <p class="leading-relaxed text-parchment-muted">{{ featured.excerpt }}</p>
            <span
              class="mt-2 inline-flex items-center gap-2 font-display text-xs font-semibold tracking-[0.2em] text-gold-300 uppercase"
            >
              {{ t("news.readMore") }}
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 transition group-hover:translate-x-1"
              />
            </span>
          </div>
        </NuxtLink>

        <ul v-if="rest.length" class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="post in rest" :key="post.id" class="flex">
            <NuxtLink
              :to="localePath(`/news/${post.id}`)"
              class="news-card group panel flex w-full flex-col overflow-hidden transition duration-300 hover:border-gold-400/35"
            >
              <div class="relative aspect-video overflow-hidden bg-ink-900">
                <img
                  v-if="post.image"
                  :src="post.image"
                  alt=""
                  loading="lazy"
                  class="size-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div
                  v-else
                  class="flex size-full items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(231,186,90,0.16),transparent_65%)]"
                  aria-hidden="true"
                >
                  <AppLogo class="size-14 rounded-sm opacity-70 ring-1 ring-gold-500/30" />
                </div>
              </div>
              <div class="flex flex-1 flex-col gap-3 p-6">
                <time
                  :datetime="post.date"
                  class="font-display text-[0.65rem] font-semibold tracking-[0.2em] text-gold-400 uppercase"
                >
                  {{ formatDate(post.date) }}
                </time>
                <h2
                  class="font-display text-lg leading-snug font-bold text-gold-200 transition group-hover:text-gold-300"
                >
                  {{ post.title }}
                </h2>
                <p class="line-clamp-3 text-sm leading-relaxed text-parchment-muted">
                  {{ post.excerpt }}
                </p>
              </div>
            </NuxtLink>
          </li>
        </ul>

        <div
          class="mt-12 flex flex-col items-start justify-between gap-4 border-t border-gold-500/15 pt-8 sm:flex-row sm:items-center"
        >
          <NuxtLink
            :to="localePath('/changelog')"
            class="text-sm text-parchment-muted transition hover:text-gold-300"
          >
            {{ t("news.patchNotes") }}
          </NuxtLink>
          <GameButton
            :to="steamNewsUrl"
            variant="secondary"
            icon="i-simple-icons-steam"
            trailing-icon="i-lucide-arrow-up-right"
          >
            {{ t("news.allOnSteam") }}
          </GameButton>
        </div>
      </template>
    </div>
  </div>
</template>
