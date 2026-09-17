<script setup lang="ts">
const features = [
  {
    icon: "i-lucide-trending-up",
    tag: "Progression",
    title: "Progression That's Earned",
    text: "Grow stronger through time, effort and adventure. Unlock new class spells as you level and shape your character with talents.",
  },
  {
    icon: "i-lucide-mountain",
    tag: "Exploration",
    title: "An Always-Online World",
    text: "Explore a persistent open world shared with other players, with new zones and world bosses added as it continues to grow.",
  },
  {
    icon: "i-lucide-skull",
    tag: "Challenge",
    title: "Breaches & Rare Loot",
    text: "Take on instanced breaches and face their final bosses for a chance at the world's rarest rewards, including mounts.",
  },
  {
    icon: "i-lucide-users",
    tag: "Social",
    title: "Adventure Together",
    text: "Make friends, form a party and stand against the evils of the world side by side. Some foes aren't meant to be faced alone.",
  },
  {
    icon: "i-lucide-book-open",
    tag: "Discovery",
    title: "The Compendium",
    text: "Chronicle everything you uncover on your journey and chase that final percentage of total discoveries.",
  },
  {
    icon: "i-lucide-scale",
    tag: "Fair play",
    title: "Fair by Design",
    text: "One simple subscription. No in-game cash shop, no cosmetics for sale and never any pay-to-win.",
  },
];

function spotlight(event: PointerEvent) {
  const card = event.currentTarget as HTMLElement;
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--x", `${event.clientX - rect.left}px`);
  card.style.setProperty("--y", `${event.clientY - rect.top}px`);
}
</script>

<template>
  <section id="features" aria-labelledby="features-title" class="features relative overflow-hidden py-24 sm:py-32">
    <div class="glow-orb top-1/3 -right-40 size-[36rem] bg-gold-500/10" aria-hidden="true" />

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading id="features-title" eyebrow="Forge your legend" title="What Awaits in Elegon">
        A world inspired by the MMORPGs that defined the genre, built for players who want their time to mean
        something.
      </SectionHeading>

      <ul class="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="(feature, index) in features"
          :key="feature.title"
          v-reveal="(index % 3) * 110"
          class="feature-card panel group"
          @pointermove="spotlight"
        >
          <div class="relative z-10 flex h-full flex-col p-7 sm:p-8">
            <div class="mb-7 flex items-start justify-between">
              <span class="feature-icon">
                <UIcon :name="feature.icon" class="relative size-6 text-gold-300" />
              </span>
              <span class="font-display text-[0.62rem] font-semibold tracking-[0.28em] text-parchment-dim uppercase">
                {{ feature.tag }}
              </span>
            </div>
            <h3 class="font-display text-xl font-bold tracking-wide text-parchment transition group-hover:text-gold-200">
              {{ feature.title }}
            </h3>
            <p class="mt-3 leading-relaxed text-parchment-muted">{{ feature.text }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.features::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(231, 186, 90, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(231, 186, 90, 0.035) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent);
}

.feature-card {
  --x: 50%;
  --y: 0%;
  overflow: hidden;
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.45s ease,
    box-shadow 0.45s ease;
}

.feature-card::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0;
  background: radial-gradient(420px circle at var(--x) var(--y), rgba(231, 186, 90, 0.13), transparent 45%);
  transition: opacity 0.4s ease;
}

.feature-card::after {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(242, 212, 136, 0.7), transparent);
  opacity: 0.35;
  transition: opacity 0.4s ease;
}

.feature-card:hover {
  transform: translateY(-6px);
  border-color: rgba(231, 186, 90, 0.4);
  box-shadow:
    inset 0 1px 0 rgba(255, 236, 190, 0.08),
    0 30px 60px -30px rgba(0, 0, 0, 0.95),
    0 0 40px -12px rgba(231, 150, 40, 0.3);
}

.feature-card:hover::before,
.feature-card:hover::after {
  opacity: 1;
}

.feature-icon {
  position: relative;
  display: flex;
  width: 3rem;
  height: 3rem;
  align-items: center;
  justify-content: center;
  margin: 0.35rem;
}

.feature-icon::before {
  content: "";
  position: absolute;
  inset: 0;
  rotate: 45deg;
  border: 1px solid rgba(231, 186, 90, 0.45);
  background: radial-gradient(circle, rgba(231, 186, 90, 0.18), rgba(20, 16, 12, 0.9) 70%);
  box-shadow:
    0 0 0 4px rgba(13, 10, 8, 0.9),
    0 0 0 5px rgba(231, 186, 90, 0.18);
  transition:
    box-shadow 0.45s ease,
    rotate 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.feature-card:hover .feature-icon::before {
  rotate: 225deg;
  box-shadow:
    0 0 0 4px rgba(13, 10, 8, 0.9),
    0 0 0 5px rgba(231, 186, 90, 0.5),
    0 0 26px rgba(231, 150, 40, 0.45);
}
</style>
