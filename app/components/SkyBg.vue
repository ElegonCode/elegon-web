<script setup lang="ts">
import { kebabCase } from "scule";

interface Star {
  x: number;
  y: number;
  size: number;
  twinkleDelay: number;
  id: string;
}

const props = withDefaults(
  defineProps<{
    starCount?: number;
    color?: string;
    size?: { min: number; max: number };
    speed?: "slow" | "normal" | "fast";
  }>(),
  {
    starCount: 50,
    color: "var(--ui-primary)",
    size: () => ({
      min: 1,
      max: 3,
    }),
    speed: "normal",
  },
);

const route = useRoute();

// Generate random stars
const generateStars = (count: number): Star[] => {
  return Array.from({ length: count }, () => {
    const x = Math.floor(38 + Math.random() * 62);
    const y = Math.floor(Math.random() * 100);
    const size =
      Math.random() * (props.size.max - props.size.min) + props.size.min;
    const twinkleDelay = Math.random() * 5;

    return {
      x,
      y,
      size,
      twinkleDelay,
      id: Math.random().toString(36).substring(2, 9),
    };
  });
};

// Generate all stars
const stars = useState<Star[]>(`${kebabCase(route.path)}-sky`, () =>
  generateStars(props.starCount),
);

// Compute twinkle animation duration based on speed
const twinkleDuration = computed(() => {
  const speedMap: Record<string, string> = {
    slow: "4s",
    normal: "2s",
    fast: "1s",
  };
  return speedMap[props.speed];
});
</script>

<template>
  <div
    class="sky-bg absolute inset-0 pointer-events-none z-[-1] overflow-hidden"
  >
    <div class="sky-bg-media relative top-0" aria-hidden="true" />
    <div class="sky-bg-fade" aria-hidden="true" />
    <div class="sky-bg-overlay" aria-hidden="true" />

    <div
      v-for="star in stars"
      :key="star.id"
      class="star absolute"
      :style="{
        left: `${star.x}%`,
        top: `${star.y}%`,
        transform: 'translate(-50%, -50%)',
        '--star-size': `${star.size}px`,
        '--star-color': color,
        '--twinkle-delay': `${star.twinkleDelay}s`,
        '--twinkle-duration': twinkleDuration,
      }"
    />
  </div>
</template>

<style scoped>
.sky-bg {
  isolation: isolate;
}

.sky-bg-media,
.sky-bg-overlay,
.sky-bg-fade {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.sky-bg-media {
  background-image: url("/images/banner.png");
  background-position: center 18%;
  background-size: cover;
  filter: blur(5px) saturate(0.82) contrast(0.9) brightness(1.36);
  transform: scale(1.05);
}

.sky-bg-overlay {
  background:
    radial-gradient(
      circle at 18% 26%,
      rgba(255, 255, 255, 0.68) 0%,
      rgba(255, 255, 255, 0) 32%
    ),
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.84) 0%,
      rgba(255, 255, 255, 0.68) 38%,
      rgba(255, 255, 255, 0.52) 58%,
      rgba(255, 255, 255, 0.84) 86%,
      var(--ui-bg) 100%
    );
}

.dark .sky-bg-media {
  filter: blur(5px) saturate(1.12) contrast(1.08) brightness(0.5);
}

.dark .sky-bg-overlay {
  background:
    radial-gradient(
      circle at 18% 26%,
      rgba(255, 213, 111, 0.24) 0%,
      rgba(255, 213, 111, 0) 30%
    ),
    linear-gradient(
      180deg,
      rgba(4, 8, 18, 0.86) 0%,
      rgba(6, 10, 20, 0.62) 38%,
      rgba(10, 15, 24, 0.48) 58%,
      rgba(11, 15, 23, 0.78) 86%,
      var(--ui-bg) 100%
    );
}

.sky-bg-fade {
  inset: auto 0 0;
  height: 16rem;
  z-index: 0;
  background: linear-gradient(
    180deg,
    var(--hero-banner-fade-start) 0%,
    var(--hero-banner-fade-mid) 42%,
    var(--ui-bg) 100%
  );
}

.star {
  width: var(--star-size);
  height: var(--star-size);
  background-color: var(--star-color);
  border-radius: 50%;
  animation: twinkle var(--twinkle-duration) ease-in-out infinite;
  animation-delay: var(--twinkle-delay);
  will-change: opacity;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
}

@media (max-width: 767px) {
  .sky-bg-media {
    background-position: 58% 14%;
    transform: scale(1.08);
  }

  .sky-bg-fade {
    height: 12rem;
  }
}

@media (max-width: 639px) {
  .sky-bg-fade {
    height: 8rem;
  }
}

@media (max-width: 475px) {
  .sky-bg-media {
    background-position: 62% 12%;
  }
}
</style>
