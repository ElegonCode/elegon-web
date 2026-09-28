<script setup lang="ts">
const section = ref<HTMLElement>();
const media = ref<HTMLElement>();

onMounted(() => {
  // Safety net in case the image finished loading before the inline onload handler existed.
  if (media.value?.querySelector("img")?.complete) media.value.setAttribute("data-loaded", "");

  const el = section.value;
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let frame = 0;
  // Pointer parallax eases towards its target so the scenery never jumps
  // (e.g. on the first mouse move after the page loads).
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };

  const update = () => {
    frame = 0;
    const scroll = Math.min(window.scrollY, el.offsetHeight);
    current.x += (target.x - current.x) * 0.06;
    current.y += (target.y - current.y) * 0.06;
    el.style.setProperty("--scroll", `${scroll}`);
    el.style.setProperty("--px", `${current.x.toFixed(2)}px`);
    el.style.setProperty("--py", `${current.y.toFixed(2)}px`);
    if (Math.abs(target.x - current.x) > 0.05 || Math.abs(target.y - current.y) > 0.05) schedule();
  };
  const schedule = () => (frame ||= requestAnimationFrame(update));

  const onPointer = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    target.x = (event.clientX / window.innerWidth - 0.5) * -22;
    target.y = (event.clientY / window.innerHeight - 0.5) * -14;
    schedule();
  };

  window.addEventListener("scroll", schedule, { passive: true });
  el.addEventListener("pointermove", onPointer, { passive: true });
  update();

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    el.removeEventListener("pointermove", onPointer);
  });
});

const platforms = [
  { label: "Windows", icon: "i-simple-icons-windows" },
  { label: "Linux", icon: "i-simple-icons-linux" },
  { label: "macOS", icon: "i-simple-icons-apple" },
];
const { t, locale } = useLocale();
</script>

<template>
  <section
    id="top"
    ref="section"
    aria-labelledby="hero-title"
    class="hero relative isolate flex min-h-[100svh] items-end overflow-hidden sm:items-center"
  >
    <!-- Parallax scenery -->
    <div ref="media" class="hero-media" aria-hidden="true">
      <img
        :src="HERO_ART.src"
        :srcset="HERO_ART.srcset"
        sizes="100vw"
        :width="HERO_ART.width"
        :height="HERO_ART.height"
        alt=""
        fetchpriority="high"
        decoding="async"
        class="hero-img"
        onload="this.parentElement.setAttribute('data-loaded', '')"
      />
    </div>

    <!-- Soft god rays fanning down from the sun behind the canopy -->
    <div class="hero-rays" aria-hidden="true">
      <div class="hero-rays__beams hero-rays__beams--a" />
      <div class="hero-rays__beams hero-rays__beams--b" />
    </div>
    <div class="hero-shade" aria-hidden="true" />
    <div class="hero-fog hero-fog--a" aria-hidden="true" />
    <div class="hero-fog hero-fog--b" aria-hidden="true" />
    <EmberField class="z-[2]" :density="6" />

    <div class="relative z-10 mx-auto w-full max-w-7xl px-4 pt-32 pb-28 sm:px-6 sm:pt-36 sm:pb-40 lg:px-8">
      <div class="hero-copy flex max-w-xl flex-col items-center text-center md:items-start md:text-left">
        <p class="hero-pill">
          <span class="size-2 rounded-full bg-green-400 animate-ember-pulse" aria-hidden="true" />
          {{ t("hero.live") }}
        </p>

        <h1 id="hero-title" class="mt-8 flex w-full flex-col items-center md:items-start">
          <span class="hero-logo-row">
            <span class="sr-only">Elegon: </span>
            <span class="hero-logo">
              <ElegonLogo aria-hidden="true" />
            </span>
          </span>
          <span class="hero-title-ornament" aria-hidden="true" />
          <span :class="['hero-tagline', { 'hero-tagline--cjk': locale === 'zh-CN' }]">{{ t("hero.tagline") }}</span>
        </h1>

        <p class="mt-6 max-w-xl font-serif text-lg leading-relaxed text-parchment/90 text-pretty sm:text-xl">
          {{ t("hero.description") }}
        </p>

        <div class="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <GameButton :to="SITE_LINKS.steam" size="lg" icon="i-simple-icons-steam">
            {{ t("nav.wishlistSteam") }}
          </GameButton>
          <GameButton :to="SITE_LINKS.discord" size="lg" variant="secondary" icon="i-simple-icons-discord">
            {{ t("hero.community") }}
          </GameButton>
        </div>

        <ul class="mt-8 flex items-center gap-5 text-xs text-parchment/75 md:self-start" :aria-label="t('hero.platforms')">
          <li v-for="platform in platforms" :key="platform.label" class="flex items-center gap-2">
            <UIcon :name="platform.icon" class="size-4" />
            <span class="font-display tracking-[0.18em] uppercase">{{ platform.label }}</span>
          </li>
        </ul>
      </div>
    </div>

    <a href="#world" class="hero-scroll" :aria-label="t('hero.begin')">
      <span class="font-display text-[0.62rem] tracking-[0.4em] uppercase">{{ t("hero.begin") }}</span>
      <span class="hero-scroll__line" aria-hidden="true" />
    </a>
  </section>
</template>

<style scoped>
.hero {
  --scroll: 0;
  --px: 0px;
  --py: 0px;
}

.hero-media {
  position: absolute;
  inset: -4%;
  z-index: -2;
  transform: translate3d(var(--px), calc(var(--scroll) * 0.32px + var(--py)), 0);
  will-change: transform;
  transition: opacity 1.4s ease-out;
}

/* Fade the scenery in once the image has actually decoded, rather than letting it pop in. */
:global(html.js .hero-media:not([data-loaded])) {
  opacity: 0;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 30%;
  filter: saturate(1.05) contrast(1.08);
  animation: ken-burns 26s ease-in-out infinite alternate;
  transform-origin: 50% 35%;
}

.hero-shade {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(90deg, rgba(8, 6, 4, 0.94) 0%, rgba(8, 6, 4, 0.82) 24%, rgba(8, 6, 4, 0.57) 43%, rgba(8, 6, 4, 0.12) 69%, transparent 100%),
    radial-gradient(ellipse 120% 90% at 50% 40%, transparent 48%, rgba(8, 6, 4, 0.72) 100%),
    linear-gradient(
      180deg,
      rgba(8, 6, 4, 0.72) 0%,
      rgba(8, 6, 4, 0.1) 24%,
      rgba(13, 10, 8, 0.08) 52%,
      rgba(13, 10, 8, 0.7) 82%,
      var(--color-ink-950) 100%
    );
}

/* Sun shafts breaking through the canopy. The container is centred on the sun
   (top-centre); each layer is a set of irregular, softly-ramped beams that is
   heavily blurred and faded out with distance so no hard edges remain. */
.hero-rays {
  position: absolute;
  top: -4%;
  left: 50%;
  z-index: -1;
  width: 170vmax;
  height: 170vmax;
  translate: -50% -50%;
  pointer-events: none;
  mix-blend-mode: screen;
  mask-image: radial-gradient(
    circle closest-side,
    #000 0%,
    rgba(0, 0, 0, 0.75) 22%,
    rgba(0, 0, 0, 0.3) 48%,
    transparent 78%
  );
}

/* Warm bloom where the light source sits */
.hero-rays::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle closest-side, rgba(255, 196, 120, 0.4), rgba(255, 170, 90, 0.12) 18%, transparent 34%);
  animation: rays-breathe 9s ease-in-out infinite;
}

.hero-rays__beams {
  position: absolute;
  inset: 0;
  filter: blur(34px);
  will-change: rotate, opacity;
}

/* `from 90deg` puts 0° pointing right, so 0–180° fans downward. */
.hero-rays__beams--a {
  background: conic-gradient(
    from 90deg at 50% 50%,
    transparent 0deg 22deg,
    rgba(255, 190, 115, 0.2) 30deg,
    transparent 40deg 52deg,
    rgba(255, 214, 160, 0.13) 57deg,
    transparent 63deg 71deg,
    rgba(255, 186, 105, 0.28) 81deg,
    rgba(255, 200, 130, 0.12) 90deg,
    transparent 97deg 108deg,
    rgba(255, 220, 170, 0.14) 114deg,
    transparent 121deg 131deg,
    rgba(255, 188, 110, 0.22) 141deg,
    transparent 153deg 360deg
  );
  animation: rays-sway 26s ease-in-out infinite alternate;
}

.hero-rays__beams--b {
  background: conic-gradient(
    from 90deg at 50% 50%,
    transparent 0deg 38deg,
    rgba(255, 205, 150, 0.16) 45deg,
    transparent 51deg 66deg,
    rgba(255, 180, 100, 0.2) 75deg,
    transparent 84deg 99deg,
    rgba(255, 210, 150, 0.18) 104deg,
    transparent 110deg 122deg,
    rgba(255, 196, 125, 0.16) 128deg,
    transparent 136deg 360deg
  );
  animation:
    rays-sway 34s ease-in-out -11s infinite alternate-reverse,
    rays-breathe 13s ease-in-out -4s infinite;
}

.hero-fog {
  position: absolute;
  z-index: 1;
  bottom: -10%;
  width: 90vw;
  height: 45vh;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(255, 170, 110, 0.14), transparent 65%);
  filter: blur(30px);
  pointer-events: none;
}

.hero-fog--a {
  left: -30vw;
  animation: fog-drift 38s ease-in-out infinite alternate;
}

.hero-fog--b {
  right: -30vw;
  background: radial-gradient(ellipse at center, rgba(230, 200, 170, 0.1), transparent 65%);
  animation: fog-drift 46s ease-in-out -12s infinite alternate-reverse;
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(242, 212, 136, 0.28);
  background: rgba(13, 10, 8, 0.55);
  backdrop-filter: blur(10px);
  font-family: var(--font-display);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-gold-200);
}

/* ---- Logo ---------------------------------------------------------- */

.hero-logo-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .hero-logo-row {
    justify-content: flex-start;
  }
}

/* Sized on a wrapper so it never competes with the logo component's own styles. */
.hero-logo {
  position: relative;
  isolation: isolate;
  display: block;
  width: min(80vw, 28rem);
  flex-shrink: 0;
}

.hero-logo::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: -30% -22% -20%;
  background: radial-gradient(ellipse at center, rgba(13, 9, 5, 0.64), rgba(13, 9, 5, 0.2) 54%, transparent 76%);
  pointer-events: none;
}

.hero-title-ornament {
  position: relative;
  display: block;
  width: clamp(8rem, 54%, 14rem);
  height: 1px;
  margin-top: 0.45rem;
  background: linear-gradient(90deg, transparent, rgba(231, 186, 90, 0.76) 18%, rgba(231, 186, 90, 0.76) 82%, transparent);
  filter: drop-shadow(0 0 5px rgba(231, 186, 90, 0.32));
}

.hero-title-ornament::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.42rem;
  height: 0.42rem;
  border: 1px solid var(--color-gold-300);
  background: var(--color-ink-950);
  transform: translate(-50%, -50%) rotate(45deg);
}

/* ---- Tagline ----------------------------------------------------------- */

.hero-tagline {
  display: block;
  width: 100%;
  max-width: 100%;
  margin-top: clamp(1rem, 2.4vw, 1.75rem);
  font-family: var(--font-display);
  font-size: clamp(0.78rem, 1.9vw, 1.05rem);
  font-weight: 600;
  letter-spacing: clamp(0.06em, 0.55vw, 0.2em);
  text-transform: uppercase;
  line-height: 1.4;
  text-wrap: balance;
  overflow-wrap: anywhere;
  color: var(--color-parchment);
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.8);
}

.hero-tagline--cjk {
  letter-spacing: 0.04em;
  text-transform: none;
}

.hero-scroll {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  translate: -50% 0;
  color: rgba(239, 228, 208, 0.6);
  transition: color 0.3s ease;
}

.hero-scroll:hover {
  color: var(--color-gold-300);
}

.hero-scroll__line {
  position: relative;
  width: 1px;
  height: 3rem;
  overflow: hidden;
  background: rgba(242, 212, 136, 0.18);
}

.hero-scroll__line::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent, var(--color-gold-300));
  animation: scroll-cue 2.2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

@keyframes ken-burns {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.12) translate3d(-1.5%, 1%, 0);
  }
}


@keyframes rays-sway {
  from {
    rotate: -4deg;
  }
  to {
    rotate: 5deg;
  }
}

@keyframes rays-breathe {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}


@keyframes fog-drift {
  to {
    transform: translate3d(30vw, -4vh, 0);
  }
}



@keyframes scroll-cue {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(100%);
  }
}

@media (max-width: 639px) {
  .hero-img {
    object-position: 50% 25%;
  }

  .hero-scroll {
    display: none;
  }

  .hero-tagline {
    letter-spacing: 0.08em;
  }

}

@media (max-width: 767px) {
  .hero-shade {
    background:
      radial-gradient(ellipse 110% 62% at 50% 68%, rgba(8, 6, 4, 0.82), rgba(8, 6, 4, 0.48) 56%, transparent 100%),
      linear-gradient(180deg, rgba(8, 6, 4, 0.5) 0%, transparent 24%, rgba(13, 10, 8, 0.12) 42%, rgba(13, 10, 8, 0.74) 82%, var(--color-ink-950) 100%);
  }
}

@media (min-width: 640px) and (max-width: 767px) {
  .hero-logo {
    width: min(72vw, 28rem);
  }
}
</style>
