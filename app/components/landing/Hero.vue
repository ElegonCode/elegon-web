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
        :src="SCREENSHOT.src"
        :srcset="SCREENSHOT.srcset"
        sizes="100vw"
        :width="SCREENSHOT.width"
        :height="SCREENSHOT.height"
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

    <div class="relative z-10 mx-auto w-full max-w-7xl px-4 pt-32 pb-24 sm:px-6 sm:pb-44 lg:px-8">
      <div class="mx-auto flex max-w-6xl flex-col items-center text-center">
        <p class="hero-pill">
          <span class="size-2 rounded-full bg-green-400 animate-ember-pulse" aria-hidden="true" />
          Open playtest live 24/7 on Steam
        </p>

        <h1 id="hero-title" class="mt-8 flex w-full flex-col items-center">
          <span class="hero-logo-row">
            <svg class="hero-blade" viewBox="0 0 320 40" fill="none" aria-hidden="true">
              <path d="M0 20 258 15.5 274 20 258 24.5Z" fill="currentColor" />
              <path d="M283 20l9-9 9 9-9 9Z" stroke="currentColor" stroke-width="2" />
              <path d="M292 15.5 296.5 20 292 24.5 287.5 20Z" fill="currentColor" />
              <circle cx="313" cy="20" r="2.5" fill="currentColor" />
            </svg>
            <span class="sr-only">Elegon: </span>
            <span class="hero-logo">
              <ElegonLogo aria-hidden="true" />
            </span>
            <svg class="hero-blade" viewBox="0 0 320 40" fill="none" aria-hidden="true">
              <g transform="matrix(-1 0 0 1 320 0)">
                <path d="M0 20 258 15.5 274 20 258 24.5Z" fill="currentColor" />
                <path d="M283 20l9-9 9 9-9 9Z" stroke="currentColor" stroke-width="2" />
                <path d="M292 15.5 296.5 20 292 24.5 287.5 20Z" fill="currentColor" />
                <circle cx="313" cy="20" r="2.5" fill="currentColor" />
              </g>
            </svg>
          </span>
          <span class="hero-tagline">An MMORPG inspired by the classics</span>
        </h1>

        <p class="mt-6 max-w-xl font-serif text-lg leading-relaxed text-parchment/85 text-pretty sm:text-xl">
          Step into a world where your progression matters and adventure awaits.
        </p>

        <div class="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <GameButton :to="SITE_LINKS.steam" size="lg" icon="i-simple-icons-steam">
            Wishlist on Steam
          </GameButton>
          <GameButton :to="SITE_LINKS.discord" size="lg" variant="secondary" icon="i-simple-icons-discord">
            Join the Community
          </GameButton>
        </div>

        <ul class="mt-10 flex items-center gap-5 text-xs text-parchment/60" aria-label="Available platforms">
          <li v-for="platform in platforms" :key="platform.label" class="flex items-center gap-2">
            <UIcon :name="platform.icon" class="size-4" />
            <span class="font-display tracking-[0.18em] uppercase">{{ platform.label }}</span>
          </li>
        </ul>
      </div>
    </div>

    <a href="#world" class="hero-scroll" aria-label="Scroll to learn about the world">
      <span class="font-display text-[0.62rem] tracking-[0.4em] uppercase">Begin your journey</span>
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
  filter: saturate(1.12) contrast(1.05);
  animation: ken-burns 26s ease-in-out infinite alternate;
  transform-origin: 50% 35%;
}

.hero-shade {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(ellipse 70% 55% at 50% 58%, rgba(13, 10, 8, 0.55), transparent 70%),
    radial-gradient(ellipse 120% 90% at 50% 40%, transparent 45%, rgba(8, 6, 4, 0.8) 100%),
    linear-gradient(
      180deg,
      rgba(8, 6, 4, 0.75) 0%,
      rgba(8, 6, 4, 0.15) 22%,
      rgba(13, 10, 8, 0.1) 50%,
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
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: clamp(0.75rem, 2vw, 1.75rem);
}

/* Sized on a wrapper so it never competes with the logo component's own styles. */
.hero-logo {
  display: block;
  width: min(80vw, 38rem);
  flex-shrink: 0;
}

.hero-blade {
  width: clamp(3rem, 9vw, 8rem);
  flex-shrink: 1;
  color: var(--color-gold-300);
  opacity: 1;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.7));
}

/* ---- Tagline ----------------------------------------------------------- */

.hero-tagline {
  margin-top: clamp(1rem, 2.4vw, 1.75rem);
  font-family: var(--font-display);
  font-size: clamp(0.78rem, 1.9vw, 1.05rem);
  font-weight: 600;
  letter-spacing: 0.42em;
  text-transform: uppercase;
  color: var(--color-parchment);
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.8);
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
    letter-spacing: 0.24em;
  }

  .hero-blade {
    display: none;
  }
}
</style>
