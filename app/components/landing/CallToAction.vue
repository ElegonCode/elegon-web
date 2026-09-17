<template>
  <section aria-labelledby="cta-title" class="relative isolate overflow-hidden py-32 sm:py-44">
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <img
        :src="SCREENSHOT.src"
        :srcset="SCREENSHOT.srcset"
        sizes="100vw"
        alt=""
        loading="lazy"
        decoding="async"
        class="size-full object-cover object-[50%_20%] brightness-[0.75] saturate-[1.2]"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-ink-950 via-transparent to-ink-950" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,10,8,0.35)_0%,rgba(13,10,8,0.85)_90%)]" />
    </div>
    <EmberField :density="4" />

    <div class="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
      <p v-reveal class="eyebrow">The journey begins</p>
      <div v-reveal="80" class="mt-5">
        <h2
          id="cta-title"
          class="font-display text-5xl leading-[1.02] font-bold tracking-wide text-balance text-shine sm:text-6xl lg:text-7xl"
        >
          Your Adventure Awaits
        </h2>
      </div>
      <OrnamentDivider v-reveal="140" class="mt-6" />
      <p v-reveal="180" class="mt-6 max-w-xl font-serif text-lg leading-relaxed text-parchment/85 sm:text-xl">
        Wishlist Elegon on Steam, jump into the 24/7 playtest, and help shape a world built to last.
      </p>
      <div v-reveal="240" class="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <GameButton :to="SITE_LINKS.steam" size="lg" icon="i-simple-icons-steam">Wishlist on Steam</GameButton>
        <GameButton :to="SITE_LINKS.discord" size="lg" variant="secondary" icon="i-simple-icons-discord">
          Join the Discord
        </GameButton>
      </div>
    </div>
  </section>
</template>
