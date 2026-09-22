<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import { SUPPORTED_LOCALES } from "~/composables/useLocale";

definePageMeta({ alias: ["/:locale(en|de|es|fr|pt-BR|ru|zh-CN)"] });
const { locale, t, localePath } = useLocale();

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

const faqItems: AccordionItem[] = [
  {
    label: "How will Elegon be monetized?",
    content:
      "Elegon will be supported by a single monthly subscription. There will never be an in-game store selling cosmetics or pay-to-win items. The only purchases that may exist outside the subscription are things like merchandise, but nothing that could exist within the world of Elegon itself.",
  },
  {
    label: "What platforms is Elegon available on?",
    content:
      "Elegon can be played through Steam on Windows, Linux, and macOS. Currently, the macOS version requires a small workaround because the application is not code-signed yet, but this will be addressed in the future.",
  },
  {
    label: "Who are you? Have you built anything like this before?",
    content:
      "My name is Keone. I'm a 28-year-old software developer working full-time at a non-gaming company in London, UK. In my free time, I dedicate as much time as possible to developing Elegon. I have around 10 years of experience in software development, and Elegon is my first large-scale game project.",
  },
  {
    label: "What technology does Elegon use?",
    content:
      "Elegon is built using the Godot game engine. I chose Godot because it is open source, highly flexible, and capable of supporting everything this project needs. It also allows me to modify the engine itself if necessary. For networking and backend systems, Elegon uses SpacetimeDB, which provides high performance and a modern architecture well suited to persistent online worlds.",
  },
  {
    label: "How can I support the development of Elegon?",
    content:
      "Your support is greatly appreciated, but never required. If you'd like to support the project financially, you can become a member on Patreon or Ko-fi. If that is not possible, that is completely fine too; simply watching the devlogs on YouTube, participating in the playtest, and sharing feedback helps more than you might think.",
  },
];

const [{ data: patreonMembers, pending: patreonPending }, { data: latestUpdates }] = await Promise.all([
  useFetch<{ tiers: PatreonTier[] }>("/api/patreon-members", {
    key: "patreon-members",
    default: () => ({ tiers: [] }),
  }),
  useFetch<ChangelogResponse>("/api/changelog", {
    key: "latest-updates",
    // Only ship the handful of entries the landing page shows.
    transform: ({ entries }) => {
      const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
      const first = sorted.at(-1)?.date;
      return {
        total: entries.length,
        since: first
          ? new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(
              new Date(`${first}T00:00:00Z`),
            )
          : null,
        entries: sorted.slice(0, 5),
      };
    },
  }),
]);

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
            mainEntity: faqItems.map((item) => ({
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
