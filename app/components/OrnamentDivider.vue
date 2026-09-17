<script setup lang="ts">
withDefaults(defineProps<{ width?: string }>(), { width: "min(22rem, 80%)" });
</script>

<template>
  <div class="flex items-center justify-center" :style="{ width }" aria-hidden="true">
    <span class="h-px flex-1 bg-gradient-to-r from-transparent via-gold-600/70 to-gold-400" />
    <svg viewBox="0 0 64 20" class="mx-2 h-4 w-14 shrink-0 text-gold-400" fill="none">
      <path d="M2 10h14M48 10h14" stroke="currentColor" stroke-width="1" />
      <path d="M32 1.5 40.5 10 32 18.5 23.5 10Z" stroke="currentColor" stroke-width="1.2" />
      <path d="M32 6 36 10 32 14 28 10Z" fill="currentColor" />
      <circle cx="19" cy="10" r="1.6" fill="currentColor" />
      <circle cx="45" cy="10" r="1.6" fill="currentColor" />
    </svg>
    <span class="h-px flex-1 bg-gradient-to-l from-transparent via-gold-600/70 to-gold-400" />
  </div>
</template>
