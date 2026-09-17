<template>
  <section id="devlogs" aria-labelledby="devlogs-title" class="relative overflow-hidden py-24 sm:py-32">
    <div class="glow-orb -left-32 top-10 size-[40rem] bg-sky-500/[0.07]" aria-hidden="true" />
    <div class="glow-orb bottom-0 left-1/3 size-[26rem] bg-gold-500/10 [animation-delay:-8s]" aria-hidden="true" />

    <div
      class="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.35fr_1fr] lg:gap-16 lg:px-8"
    >
      <div v-reveal="{ variant: 'scale' }" class="panel corners p-2">
        <YouTubeFacade playlist-id="PLcd5IWpvYJ8Q6G1l0s4IiyWWPK5RvlLln" title="Elegon devlog playlist" />
      </div>

      <div class="space-y-7">
        <SectionHeading id="devlogs-title" eyebrow="From the forge" title="Weekly Devlogs" align="left" />
        <div class="space-y-5 font-serif text-lg leading-relaxed text-parchment-muted">
          <p v-reveal="80">
            Follow the development of Elegon by subscribing to the YouTube channel, where I share weekly updates and
            behind-the-scenes devlogs about the progress of the game.
          </p>
          <p v-reveal="140">
            Developing Elegon openly with the community is really important to me. It gives me the opportunity to
            hear your real-time feedback and ideas, while also keeping you up to date with the latest progress as the
            world continues to grow.
          </p>
        </div>
        <div v-reveal="200" class="flex flex-wrap items-center gap-3 pt-2">
          <GameButton :to="SITE_LINKS.youtube" variant="secondary" icon="i-simple-icons-youtube">
            Subscribe on YouTube
          </GameButton>
          <GameButton to="/changelog" variant="ghost" trailing-icon="i-lucide-arrow-right">
            Read the changelog
          </GameButton>
        </div>
      </div>
    </div>
  </section>
</template>
