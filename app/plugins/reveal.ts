import type { Directive, DirectiveBinding } from "vue";

type RevealValue = number | { delay?: number; variant?: "up" | "fade" | "scale" } | undefined;

function options(binding: DirectiveBinding<RevealValue>) {
  const value = binding.value;
  if (typeof value === "number") return { delay: value, variant: "up" };
  return { delay: value?.delay ?? 0, variant: value?.variant ?? "up" };
}

/**
 * `v-reveal` animates an element in the first time it scrolls into view.
 * The attribute is rendered on the server so content is hidden before hydration
 * (only when JS is enabled, see `html.js` in main.css) and never flashes.
 *
 * The delay is deliberately client-only. It is only read by the `.is-revealed`
 * animation, which cannot start before `mounted`, and rendering it as an inline
 * style on the server made every element with its own `style` binding fail the
 * hydration style check, since the client vnode never includes directive SSR props.
 */
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | undefined;

  const getObserver = () => {
    observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer?.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    return observer;
  };

  const reveal: Directive<HTMLElement, RevealValue> = {
    getSSRProps(binding) {
      return { "data-reveal": options(binding).variant };
    },
    mounted(el, binding) {
      const { delay, variant } = options(binding);
      el.dataset.reveal = variant;
      if (delay) el.style.setProperty("--reveal-delay", `${delay}ms`);

      if (!("IntersectionObserver" in window)) {
        el.classList.add("is-revealed");
        return;
      }
      getObserver().observe(el);
    },
    beforeUnmount(el) {
      observer?.unobserve(el);
    },
  };

  nuxtApp.vueApp.directive("reveal", reveal);
});
