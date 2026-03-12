// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Elegon',
      htmlAttrs: {
        lang: 'en',
      },
      }
  },
  appConfig: {
      ui: {
      colors: {
          primary: 'yellow',
          neutral: 'neutral'
      }
    }
  }
})
