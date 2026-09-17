<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Particles per 100,000 px² of canvas area. */
    density?: number;
    maxParticles?: number;
  }>(),
  { density: 5, maxParticles: 110 },
);

type Ember = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  phase: number;
  hue: number;
};

const canvas = ref<HTMLCanvasElement>();

onMounted(() => {
  const el = canvas.value;
  const ctx = el?.getContext("2d");
  if (!el || !ctx) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let width = 0;
  let height = 0;
  let embers: Ember[] = [];
  let frame = 0;
  let running = false;
  let visible = true;
  let last = performance.now();

  const spawn = (initial = false): Ember => {
    const maxLife = 6 + Math.random() * 8;
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 10,
      r: 0.6 + Math.random() * 1.9,
      vx: (Math.random() - 0.5) * 12,
      vy: -(14 + Math.random() * 38),
      life: initial ? Math.random() * maxLife : 0,
      maxLife,
      phase: Math.random() * Math.PI * 2,
      hue: 18 + Math.random() * 26,
    };
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = el.clientWidth;
    height = el.clientHeight;
    el.width = Math.round(width * dpr);
    el.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.min(
      props.maxParticles,
      Math.round(((width * height) / 100_000) * props.density),
    );
    embers = Array.from({ length: target }, () => spawn(true));
  };

  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < embers.length; i++) {
      const e = embers[i]!;
      e.life += dt;
      e.phase += dt * 1.6;
      e.x += (e.vx + Math.sin(e.phase) * 10) * dt;
      e.y += e.vy * dt;

      if (e.life > e.maxLife || e.y < -20) {
        embers[i] = spawn();
        continue;
      }

      const t = e.life / e.maxLife;
      const alpha = Math.sin(Math.PI * t) * (0.55 + 0.45 * Math.sin(e.phase * 3));
      const glow = e.r * 5;
      const gradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, glow);
      gradient.addColorStop(0, `hsla(${e.hue + 20}, 100%, 78%, ${alpha})`);
      gradient.addColorStop(0.25, `hsla(${e.hue}, 100%, 58%, ${alpha * 0.55})`);
      gradient.addColorStop(1, `hsla(${e.hue}, 100%, 50%, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(e.x, e.y, glow, 0, Math.PI * 2);
      ctx.fill();
    }

    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running || !visible || document.hidden) return;
    running = true;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(el);

  // Pause when scrolled out of view or the tab is hidden.
  const intersection = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    visible ? start() : stop();
  });
  intersection.observe(el);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVisibility);

  resize();
  start();

  onBeforeUnmount(() => {
    stop();
    resizeObserver.disconnect();
    intersection.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
  });
});
</script>

<template>
  <canvas ref="canvas" class="pointer-events-none absolute inset-0 size-full" aria-hidden="true" />
</template>
