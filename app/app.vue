<script setup lang="ts">
useHead({
  titleTemplate: (title) => (title && title !== "Elegon" ? `${title} · Elegon` : "Elegon"),
});
</script>

<template>
  <UApp :tooltip="{ delayDuration: 150 }">
    <NuxtLayout>
      <!-- Locale aliases share page components; keying by the route ensures head and SSR-bound copy refresh on language changes. -->
      <NuxtPage :page-key="(route) => route.fullPath" />
    </NuxtLayout>
  </UApp>
</template>
