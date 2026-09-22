<script setup lang="ts">
const { t } = useLocale();
const features = computed(() => [
  {
    icon: "i-lucide-trending-up",
    tag: t("features.p1.tag"), title: t("features.p1.title"), text: t("features.p1.text"),
  },
  {
    icon: "i-lucide-mountain",
    tag: t("features.p2.tag"), title: t("features.p2.title"), text: t("features.p2.text"),
  },
  {
    icon: "i-lucide-skull",
    tag: t("features.p3.tag"), title: t("features.p3.title"), text: t("features.p3.text"),
  },
  {
    icon: "i-lucide-users",
    tag: t("features.p4.tag"), title: t("features.p4.title"), text: t("features.p4.text"),
  },
  {
    icon: "i-lucide-book-open",
    tag: t("features.p5.tag"), title: t("features.p5.title"), text: t("features.p5.text"),
  },
  {
    icon: "i-lucide-scale",
    tag: t("features.p6.tag"), title: t("features.p6.title"), text: t("features.p6.text"),
  },
]);

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
      <SectionHeading id="features-title" :eyebrow="t('features.eyebrow')" :title="t('features.title')">
        {{ t("features.intro") }}
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
