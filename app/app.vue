<script setup lang="ts">
import { Analytics } from "@vercel/analytics/nuxt";

useHead({
  titleTemplate: (title) => (title && title !== "Elegon" ? `${title} · Elegon` : "Elegon"),
});
</script>

<template>
  <UApp :tooltip="{ delayDuration: 150 }">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-gold-400 focus:px-4 focus:py-2 focus:font-display focus:text-ink-950"
    >
      Skip to content
    </a>
    <div class="grain">
      <SiteHeader />
      <main id="main">
        <NuxtPage />
      </main>
      <SiteFooter />
    </div>
    <Analytics />
  </UApp>
</template>
