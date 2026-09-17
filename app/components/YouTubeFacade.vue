<script setup lang="ts">
const props = defineProps<{
  playlistId: string;
  title: string;
}>();

const playing = ref(false);
const src = computed(
  () => `https://www.youtube-nocookie.com/embed/videoseries?list=${props.playlistId}&autoplay=1&rel=0`,
);
</script>

<template>
  <div class="relative aspect-video overflow-hidden bg-ink-900">
    <iframe
      v-if="playing"
      :src="src"
      :title="title"
      class="absolute inset-0 size-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
    <button
      v-else
      type="button"
      class="group absolute inset-0 flex size-full items-center justify-center"
      :aria-label="`Play: ${title}`"
      @click="playing = true"
    >
      <img
        :src="SCREENSHOT.src"
        :srcset="SCREENSHOT.srcset"
        sizes="(min-width: 1024px) 55vw, 95vw"
        alt=""
        loading="lazy"
        decoding="async"
        class="absolute inset-0 size-full object-cover object-[50%_35%] brightness-[0.55] saturate-[1.1] transition duration-700 group-hover:scale-105 group-hover:brightness-[0.7]"
      />
      <span class="absolute inset-0 bg-radial from-transparent to-ink-950/70" aria-hidden="true" />

      <span class="play-rune relative flex size-24 items-center justify-center sm:size-28" aria-hidden="true">
        <svg viewBox="0 0 100 100" class="play-rune__ring absolute inset-0 size-full text-gold-300" fill="none">
          <circle cx="50" cy="50" r="47" stroke="currentColor" stroke-width="1" stroke-dasharray="3 5" />
          <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="1.5" />
        </svg>
        <span
          class="flex size-16 items-center justify-center rounded-full bg-gradient-to-b from-gold-300 to-gold-600 shadow-[0_0_40px_rgba(231,150,40,0.55)] transition duration-300 group-hover:scale-110 sm:size-[4.5rem]"
        >
          <UIcon name="i-lucide-play" class="ml-1 size-7 fill-ink-950 text-ink-950" />
        </span>
      </span>

      <span class="absolute inset-x-0 bottom-0 flex items-center gap-3 p-5 text-left">
        <UIcon name="i-simple-icons-youtube" class="size-6 shrink-0 text-red-500" />
        <span class="font-display text-sm font-semibold tracking-[0.12em] text-parchment uppercase">{{ title }}</span>
      </span>
    </button>
  </div>
</template>

<style scoped>
.play-rune__ring {
  animation: spin 18s linear infinite;
}

@keyframes spin {
  to {
    rotate: 360deg;
  }
}
</style>
