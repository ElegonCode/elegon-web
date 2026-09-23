// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@vercel/speed-insights", "@nuxtjs/mdc"],
  css: ["~/assets/css/main.css"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  // The site is designed as a dark, in-world experience, so light mode is disabled.
  ui: {
    colorMode: false,
  },
  routeRules: {
    // Serve the landing page from the edge cache and refresh it in the background.
    "/": { isr: 600 },
  },
  runtimeConfig: {
    public: {
      // Canonical origin used for SEO tags, the sitemap and robots.txt.
      // Falls back to the request origin when unset.
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "",
    },
    patreonAccessToken:
      process.env.PATREON_ACCESS_TOKEN ||
      process.env.NUXT_PATREON_ACCESS_TOKEN ||
      "",
    patreonCampaignId:
      process.env.PATREON_CAMPAIGN_ID ||
      process.env.NUXT_PATREON_CAMPAIGN_ID ||
      "",
    patreonUserAgent:
      process.env.PATREON_USER_AGENT ||
      process.env.NUXT_PATREON_USER_AGENT ||
      "Elegon Website",
    patreonTier1Id:
      process.env.PATREON_TIER_1_ID || process.env.NUXT_PATREON_TIER_1_ID || "",
    patreonTier1Label:
      process.env.PATREON_TIER_1_LABEL ||
      process.env.NUXT_PATREON_TIER_1_LABEL ||
      "Legendary Supporters",
    patreonTier2Id:
      process.env.PATREON_TIER_2_ID || process.env.NUXT_PATREON_TIER_2_ID || "",
    patreonTier2Label:
      process.env.PATREON_TIER_2_LABEL ||
      process.env.NUXT_PATREON_TIER_2_LABEL ||
      "Epic Supporters",
    patreonTier3Id:
      process.env.PATREON_TIER_3_ID || process.env.NUXT_PATREON_TIER_3_ID || "",
    patreonTier3Label:
      process.env.PATREON_TIER_3_LABEL ||
      process.env.NUXT_PATREON_TIER_3_LABEL ||
      "Rare Supporters",
  },
  app: {
    head: {
      title: "Elegon",
      htmlAttrs: {
        lang: "en",
        class: "dark",
      },
      meta: [
        { name: "theme-color", content: "#0d0a08" },
        { name: "color-scheme", content: "dark" },
        { name: "application-name", content: "Elegon" },
        { name: "apple-mobile-web-app-title", content: "Elegon" },
        { name: "format-detection", content: "telephone=no" },
      ],
      link: [
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
        { rel: "icon", type: "image/png", href: "/icon-512.png" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
      style: [
        // Pin cascade layer order before any other CSS. In production, component styles are
        // inlined ahead of Tailwind's stylesheet; without this, a component using
        // `@layer components` would rank below Tailwind's `base` reset (e.g. losing padding).
        {
          innerHTML: "@layer theme, base, components, utilities;",
          tagPriority: "critical",
        },
      ],
      script: [
        {
          src: "https://umami-production-b655.up.railway.app/script.js",
          defer: true,
          "data-website-id": "8c227760-afe1-4453-8018-daba25e9cc91",
        },
        // Flags JS support before first paint so scroll-reveal content never flashes.
        {
          innerHTML: "document.documentElement.classList.add('js')",
          tagPosition: "head",
        },
      ],
    },
  },
  appConfig: {
    ui: {
      colors: {
        primary: "amber",
        neutral: "stone",
      },
    },
  },
});
