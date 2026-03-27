// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    patreonAccessToken: process.env.PATREON_ACCESS_TOKEN || process.env.NUXT_PATREON_ACCESS_TOKEN || '',
    patreonCampaignId: process.env.PATREON_CAMPAIGN_ID || process.env.NUXT_PATREON_CAMPAIGN_ID || '',
    patreonUserAgent: process.env.PATREON_USER_AGENT || process.env.NUXT_PATREON_USER_AGENT || 'Elegon Website',
    patreonTier1Id: process.env.PATREON_TIER_1_ID || process.env.NUXT_PATREON_TIER_1_ID || '',
    patreonTier1Label: process.env.PATREON_TIER_1_LABEL || process.env.NUXT_PATREON_TIER_1_LABEL || 'Legendary Supporters',
    patreonTier2Id: process.env.PATREON_TIER_2_ID || process.env.NUXT_PATREON_TIER_2_ID || '',
    patreonTier2Label: process.env.PATREON_TIER_2_LABEL || process.env.NUXT_PATREON_TIER_2_LABEL || 'Epic Supporters',
    patreonTier3Id: process.env.PATREON_TIER_3_ID || process.env.NUXT_PATREON_TIER_3_ID || '',
    patreonTier3Label: process.env.PATREON_TIER_3_LABEL || process.env.NUXT_PATREON_TIER_3_LABEL || 'Rare Supporters',
  },
  app: {
    head: {
      title: 'Elegon',
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
  appConfig: {
    ui: {
      colors: {
        primary: 'yellow',
        neutral: 'neutral',
      },
    },
  },
})
