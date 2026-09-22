<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import { SUPPORTED_LOCALES } from "~/utils/locales";

definePageMeta({ alias: ["/:locale(en|de|es|fr|pt-BR|ru|zh-CN)"] });
const { locale, t, localePath, translatePatchNote } = useLocale();

type PatreonTier = {
  id: string;
  label: string;
  members: string[];
  memberCount: number;
};

type ChangelogResponse = {
  revision: string;
  entries: { id: number; date: string; description: string }[];
};

const faqItems = computed<AccordionItem[]>(() => [
  { label: t("faq.q1"), content: t("faq.a1") },
  { label: t("faq.q2"), content: t("faq.a2") },
  { label: t("faq.q3"), content: t("faq.a3") },
  { label: t("faq.q4"), content: t("faq.a4") },
  { label: t("faq.q5"), content: t("faq.a5") },
]);

const [{ data: patreonMembers, pending: patreonPending }, { data: changelog }] = await Promise.all([
  useFetch<{ tiers: PatreonTier[] }>("/api/patreon-members", {
    key: "patreon-members",
    default: () => ({ tiers: [] }),
  }),
  useFetch<ChangelogResponse>("/api/changelog", {
    key: "latest-updates",
  }),
]);
const latestUpdates = computed(() => {
  const entries = changelog.value?.entries ?? [];
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const first = sorted.at(-1)?.date;
  return {
    total: entries.length,
    since: first
      ? new Intl.DateTimeFormat(locale.value, { month: "long", year: "numeric", timeZone: "UTC" }).format(
          new Date(`${first}T00:00:00Z`),
        )
      : null,
    entries: sorted.slice(0, 5).map((entry) => ({ ...entry, description: translatePatchNote(entry.id, entry.description) })),
  };
});

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

const siteUrl = useSiteUrl();
const pageUrl = computed(() => `${siteUrl}${localePath()}`);
const ogImage = `${siteUrl}/images/og-image.jpg`;
const title = computed(() => t("seo.title"));

useHead({
  title: title.value,
  titleTemplate: "%s",
  htmlAttrs: { lang: locale.value },
  link: [
    { rel: "canonical", href: pageUrl.value },
    ...SUPPORTED_LOCALES.map((code) => ({ rel: "alternate", hreflang: code, href: `${siteUrl}${localePath("/", code)}` })),
    { rel: "alternate", hreflang: "x-default", href: `${siteUrl}/` },
    {
      rel: "preload",
      as: "image",
      type: "image/webp",
      href: SCREENSHOT.src,
      imagesrcset: SCREENSHOT.srcset,
      imagesizes: "100vw",
      fetchpriority: "high",
    },
  ],
});

useSeoMeta({
  description: t("seo.description"),
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  ogType: "website",
  ogSiteName: "Elegon",
  ogUrl: pageUrl.value,
  ogTitle: title.value,
  ogDescription: t("seo.description"),
  ogImage: {
    url: ogImage,
    secureUrl: ogImage,
    width: 1200,
    height: 630,
    type: "image/jpeg",
    alt: SCREENSHOT.alt,
  },
  ogLocale: locale.value.replace("-", "_"),
  twitterCard: "summary_large_image",
  twitterTitle: title.value,
  twitterDescription: t("seo.description"),
  twitterImage: ogImage,
  twitterImageAlt: SCREENSHOT.alt,
});

const sameAs = [SITE_LINKS.steam, SITE_LINKS.youtube, SITE_LINKS.discord, SITE_LINKS.patreon];

useHead({
  script: [
    {
      key: "ld-json",
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${pageUrl.value}#website`,
            url: pageUrl.value,
            name: "Elegon",
            description: t("seo.description"),
            inLanguage: locale.value,
            publisher: { "@id": `${siteUrl}/#organization` },
          },
          {
            "@type": "Organization",
            "@id": `${siteUrl}/#organization`,
            name: "Elegon",
            url: pageUrl.value,
            logo: `${siteUrl}/icon-512.png`,
            founder: { "@type": "Person", name: "Keone" },
            sameAs,
          },
          {
            "@type": "VideoGame",
            "@id": `${pageUrl.value}#game`,
            name: "Elegon",
            url: pageUrl.value,
            description: t("seo.description"),
            inLanguage: locale.value,
            image: ogImage,
            genre: ["MMORPG", "Role-playing game", "Open world"],
            playMode: ["MultiPlayer", "CoOp"],
            gamePlatform: ["PC", "Steam"],
            operatingSystem: "Windows, Linux, macOS",
            applicationCategory: "Game",
            gameServer: { "@type": "GameServer", serverStatus: "Online" },
            author: { "@type": "Person", name: "Keone" },
            publisher: { "@id": `${siteUrl}/#organization` },
            sameAs,
          },
          {
            "@type": "FAQPage",
            "@id": `${siteUrl}/#faq`,
            mainEntity: faqItems.value.map((item) => ({
              "@type": "Question",
              name: item.label,
              acceptedAnswer: { "@type": "Answer", text: item.content },
            })),
          },
        ],
      }).replace(/</g, "\\u003c"),
    },
  ],
});
</script>

<template>
  <div>
    <LandingHero />
    <LandingWorld />
    <LandingFeatures />
    <LandingDevlogs />
    <LandingVision />
    <LandingUpdates :updates="latestUpdates" />
    <LandingSupporters :tiers="patreonMembers?.tiers ?? []" :pending="patreonPending" />
    <LandingFaq :items="faqItems" />
    <LandingCallToAction />
  </div>
</template>
