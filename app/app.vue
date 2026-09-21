<script setup lang="ts">
useHead({
  titleTemplate: (title) => (title && title !== "Elegon" ? `${title} · Elegon` : "Elegon"),
});
</script>

<template>
  <UApp :tooltip="{ delayDuration: 150 }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
