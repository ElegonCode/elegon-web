<script setup lang="ts">
const stats = [
  { value: "24/7", label: "Open playtest on Steam" },
  { value: "Weekly", label: "Devlogs on YouTube" },
  { value: "0", label: "Items in a cash shop" },
  { value: "3", label: "Platforms: Windows, Linux & macOS" },
];
</script>

<template>
  <section id="world" aria-labelledby="world-title" class="relative overflow-hidden py-24 sm:py-32">
    <div class="glow-orb -left-40 top-20 size-[34rem] bg-ember-500/10" aria-hidden="true" />

    <div class="relative mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
      <div class="space-y-8">
        <SectionHeading id="world-title" eyebrow="Welcome, traveller" title="Not the Chosen One" align="left" />

        <div class="space-y-5 font-serif text-lg leading-relaxed text-parchment-muted">
          <p v-reveal="80">
            Hey, I'm Keone, a solo developer building Elegon. I started this project because I have always been
            passionate about this genre, but in recent years I have felt that the number of truly compelling online
            worlds, ones that respect the time and effort of their players, has been fading.
          </p>
          <p v-reveal="140">
            Elegon is an <strong class="font-normal text-parchment">always-online, open-world MMORPG</strong> where you
            are not the chosen hero, but rather a small part of a much larger story.
          </p>
          <p v-reveal="200">
            Watch your character grow stronger over time, defeat powerful enemies, make friends along the way, and
            stand against the evils of the world in pursuit of its greatest rewards.
          </p>
          <p v-reveal="260">
            Elegon is currently in open development, meaning you are welcome to join the
            <strong class="font-normal text-gold-300">24/7 Steam playtest</strong> and help shape the game with your
            feedback. Once the game reaches version 1.0, development will continue as the world expands and evolves.
          </p>
        </div>
      </div>

      <div v-reveal="{ variant: 'scale', delay: 120 }" class="relative mx-auto w-full max-w-xl lg:max-w-none">
        <div class="world-frame panel corners group overflow-hidden p-2">
          <div class="relative aspect-[4/5] overflow-hidden sm:aspect-[5/4] lg:aspect-[4/5]">
            <img
              :src="SCREENSHOT.src"
              :srcset="SCREENSHOT.srcset"
              sizes="(min-width: 1024px) 40vw, 90vw"
              :width="SCREENSHOT.width"
              :height="SCREENSHOT.height"
              :alt="SCREENSHOT.alt"
              loading="lazy"
              decoding="async"
              class="size-full object-cover object-[48%_50%] transition duration-[1.6s] ease-out group-hover:scale-105"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-ink-950/10"
              aria-hidden="true"
            />
          </div>
        </div>

        <div class="float-card panel absolute -bottom-6 -left-2 flex items-center gap-3 px-4 py-3 sm:-left-8">
          <span class="flex size-10 rotate-45 items-center justify-center border border-gold-400/60 bg-ink-800">
            <UIcon name="i-lucide-swords" class="size-5 -rotate-45 text-gold-300" />
          </span>
          <span class="flex flex-col">
            <span class="font-display text-[0.62rem] tracking-[0.25em] text-gold-400 uppercase">Now open</span>
            <span class="font-display text-sm font-semibold text-parchment">24/7 Steam Playtest</span>
          </span>
        </div>

        <div
          class="float-card float-card--late panel absolute -top-5 -right-2 hidden items-center gap-3 px-4 py-3 sm:flex sm:-right-6"
        >
          <UIcon name="i-lucide-shield-check" class="size-5 text-green-400" />
          <span class="font-display text-xs font-semibold tracking-[0.12em] text-parchment uppercase">
            No pay-to-win. Ever.
          </span>
        </div>
      </div>
    </div>

    <dl
      class="relative mx-auto mt-24 grid max-w-7xl grid-cols-2 gap-px overflow-hidden border-y border-gold-500/15 bg-gold-500/10 px-0 lg:grid-cols-4"
    >
      <div
        v-for="(stat, index) in stats"
        :key="stat.label"
        v-reveal="index * 90"
        class="flex flex-col items-center justify-center gap-2 bg-ink-950 px-4 py-8 text-center"
      >
        <dt class="order-2 text-sm text-parchment-dim">{{ stat.label }}</dt>
        <dd class="order-1 font-display text-3xl font-bold text-gold-gradient sm:text-4xl">{{ stat.value }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.float-card {
  z-index: 5;
  backdrop-filter: blur(8px);
  animation: bob 6s ease-in-out infinite;
}

.float-card--late {
  animation-delay: -3s;
}

@keyframes bob {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -8px, 0);
  }
}
</style>
