<script setup lang="ts">
type NewsLink = { id: string; title: string; date: string } | null;
type NewsPostResponse = {
  post: {
    id: string;
    title: string;
    date: string;
    url: string;
    image: string | null;
    excerpt: string;
    html: string;
  };
  newer: NewsLink;
  older: NewsLink;
};

definePageMeta({ alias: ["/:locale(en|de|es|fr|pt-BR|ru|zh-CN)/news/:id"] });
const route = useRoute();
const { locale, t, localePath } = useLocale();
const id = computed(() => String(route.params.id ?? ""));

const { data, error } = await useFetch<NewsPostResponse>(() => `/api/news/${id.value}`, {
  key: computed(() => `steam-news-${id.value}`),
});
if (error.value?.statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: "News post not found", fatal: true });
}

const post = computed(() => data.value?.post);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(locale.value, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

const siteUrl = useSiteUrl();
const pageUrl = computed(() => `${siteUrl}${localePath(`/news/${id.value}`)}`);
const ogImage = computed(() => post.value?.image ?? `${siteUrl}/images/og-image.jpg`);
useHead({
  htmlAttrs: { lang: locale.value },
  link: [{ rel: "canonical", href: pageUrl }],
  script: computed(() =>
    post.value
      ? [
          {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              headline: post.value.title,
              datePublished: post.value.date,
              image: [ogImage.value],
              author: { "@type": "Person", name: "Keone" },
              publisher: { "@type": "Organization", name: "Elegon" },
              mainEntityOfPage: pageUrl.value,
            }).replace(/</g, "\\u003c"),
          },
        ]
      : [],
  ),
});
useSeoMeta({
  title: () => post.value?.title ?? t("news.title"),
  description: () => post.value?.excerpt ?? t("news.description"),
  ogType: "article",
  ogSiteName: "Elegon",
  ogUrl: pageUrl,
  ogTitle: () => post.value?.title ?? t("news.title"),
  ogDescription: () => post.value?.excerpt ?? t("news.description"),
  ogImage,
  articlePublishedTime: () => post.value?.date,
  twitterCard: "summary_large_image",
  twitterTitle: () => post.value?.title ?? t("news.title"),
  twitterDescription: () => post.value?.excerpt ?? t("news.description"),
  twitterImage: ogImage,
});
</script>

<template>
  <div class="min-h-screen">
    <header class="relative isolate overflow-hidden border-b border-gold-500/15">
      <SkyBg />
      <div v-if="post?.image" class="absolute inset-0 z-[-1]" aria-hidden="true">
        <img :src="post.image" alt="" class="size-full object-cover opacity-25 blur-sm" />
        <div class="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/80 to-ink-950" />
      </div>
      <EmberField :density="2" />
      <div class="relative mx-auto max-w-3xl px-4 pt-32 pb-12 sm:px-6 sm:pt-36 sm:pb-16">
        <NuxtLink
          :to="localePath('/news')"
          class="mb-8 inline-flex items-center gap-2 font-display text-xs font-semibold tracking-[0.2em] text-parchment-muted uppercase transition hover:text-gold-300"
        >
          <UIcon name="i-lucide-arrow-left" class="size-4" />
          {{ t("news.back") }}
        </NuxtLink>
        <template v-if="post">
          <time
            :datetime="post.date"
            class="block font-display text-xs font-semibold tracking-[0.22em] text-gold-400 uppercase"
          >
            {{ formatDate(post.date) }}
          </time>
          <h1
            class="mt-4 font-display text-3xl leading-tight font-bold tracking-wide text-gold-gradient sm:text-5xl"
          >
            {{ post.title }}
          </h1>
          <OrnamentDivider width="10rem" class="mt-6 justify-start!" />
        </template>
      </div>
    </header>

    <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <UAlert
        v-if="!post"
        color="error"
        :title="t('news.error')"
        :actions="[
          {
            label: t('news.allOnSteam'),
            to: 'https://store.steampowered.com/news/app/4268360',
            target: '_blank',
            trailingIcon: 'i-lucide-arrow-up-right',
          },
        ]"
      />

      <template v-else>
        <img
          v-if="post.image"
          :src="post.image"
          alt=""
          class="mb-10 w-full border border-gold-500/20 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]"
        />
        <!-- Rebuilt from an allowlist on the server (server/utils/steamNews.ts). -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <article class="news-prose" v-html="post.html" />

        <div class="mt-12 flex flex-wrap items-center gap-3 border-t border-gold-500/15 pt-8">
          <GameButton
            :to="post.url"
            variant="secondary"
            icon="i-simple-icons-steam"
            trailing-icon="i-lucide-arrow-up-right"
          >
            {{ t("news.viewOnSteam") }}
          </GameButton>
          <GameButton :to="SITE_LINKS.steam" icon="i-simple-icons-steam">
            {{ t("nav.wishlistSteam") }}
          </GameButton>
        </div>

        <nav
          v-if="data?.newer || data?.older"
          :aria-label="t('news.title')"
          class="mt-10 grid gap-4 sm:grid-cols-2"
        >
          <NuxtLink
            v-if="data?.older"
            :to="localePath(`/news/${data.older.id}`)"
            class="panel group flex flex-col gap-2 px-5 py-4 transition hover:border-gold-400/35"
          >
            <span
              class="inline-flex items-center gap-1.5 font-display text-[0.65rem] tracking-[0.2em] text-gold-400 uppercase"
            >
              <UIcon name="i-lucide-arrow-left" class="size-3.5" />
              {{ t("news.older") }}
            </span>
            <span class="text-parchment transition group-hover:text-gold-300">{{
              data.older.title
            }}</span>
          </NuxtLink>
          <NuxtLink
            v-if="data?.newer"
            :to="localePath(`/news/${data.newer.id}`)"
            class="panel group flex flex-col items-end gap-2 px-5 py-4 text-right transition hover:border-gold-400/35 sm:col-start-2"
          >
            <span
              class="inline-flex items-center gap-1.5 font-display text-[0.65rem] tracking-[0.2em] text-gold-400 uppercase"
            >
              {{ t("news.newer") }}
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </span>
            <span class="text-parchment transition group-hover:text-gold-300">{{
              data.newer.title
            }}</span>
          </NuxtLink>
        </nav>
      </template>
    </div>
  </div>
</template>

<style scoped>
.news-prose {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--color-parchment);
  overflow-wrap: anywhere;
}

.news-prose :deep(> * + *) {
  margin-top: 1.1em;
}

.news-prose :deep(h2),
.news-prose :deep(h3),
.news-prose :deep(h4) {
  margin-top: 2.2em;
  font-family: var(--font-display);
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.04em;
  color: var(--color-gold-300);
}

.news-prose :deep(h2) {
  font-size: 1.75rem;
}

.news-prose :deep(h3) {
  font-size: 1.4rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(231, 186, 90, 0.16);
}

.news-prose :deep(h4) {
  font-size: 1.15rem;
}

.news-prose :deep(h2 + *),
.news-prose :deep(h3 + *),
.news-prose :deep(h4 + *) {
  margin-top: 0.8em;
}

.news-prose :deep(b),
.news-prose :deep(strong) {
  font-weight: 600;
  color: var(--color-gold-200);
}

.news-prose :deep(a) {
  color: var(--color-gold-300);
  text-decoration: underline;
  text-decoration-color: rgba(231, 186, 90, 0.4);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.2s ease;
}

.news-prose :deep(a:hover) {
  text-decoration-color: currentColor;
}

.news-prose :deep(ul),
.news-prose :deep(ol) {
  padding-left: 1.4rem;
  color: var(--color-parchment-muted);
}

.news-prose :deep(ul) {
  list-style: none;
}

.news-prose :deep(ol) {
  list-style: decimal;
}

.news-prose :deep(li) {
  position: relative;
  margin-top: 0.45em;
}

.news-prose :deep(ul > li)::before {
  content: "";
  position: absolute;
  left: -1.1rem;
  top: 0.75em;
  width: 6px;
  height: 6px;
  background: var(--color-gold-400);
  transform: rotate(45deg);
}

.news-prose :deep(li p) {
  margin: 0;
}

.news-prose :deep(img) {
  display: block;
  width: 100%;
  height: auto;
  margin-block: 1.75em;
  border: 1px solid rgba(231, 186, 90, 0.2);
}

.news-prose :deep(blockquote) {
  padding-left: 1rem;
  border-left: 2px solid var(--color-gold-500);
  font-style: italic;
  color: var(--color-parchment-muted);
}

.news-prose :deep(hr) {
  border: 0;
  border-top: 1px solid rgba(231, 186, 90, 0.18);
  margin-block: 2em;
}

.news-prose :deep(code) {
  font-size: 0.9em;
  padding: 0.1em 0.35em;
  background: var(--color-ink-800);
}

.news-prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95em;
}

.news-prose :deep(th),
.news-prose :deep(td) {
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(231, 186, 90, 0.16);
  text-align: left;
}
</style>
