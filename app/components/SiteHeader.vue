<script setup lang="ts">
import { LOCALE_NAMES, SUPPORTED_LOCALES, type SupportedLocale } from "~/utils/locales";

const route = useRoute();
const { locale, t, localePath } = useLocale();
const localePreference = useCookie<SupportedLocale>("elegon_locale", {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
  path: "/",
});

const sectionLinks = computed(() => [
  { label: t("nav.world"), hash: "world" },
  { label: t("nav.features"), hash: "features" },
  { label: t("nav.devlogs"), hash: "devlogs" },
  { label: t("nav.vision"), hash: "vision" },
  { label: t("nav.faq"), hash: "faq" },
]);

const externalLinks = computed(() => [
  { label: t("nav.feedback"), to: SITE_LINKS.feedback },
]);

const socials = computed(() => [
  { label: t("devlogs.subscribe"), icon: "i-simple-icons-youtube", to: SITE_LINKS.youtube },
  { label: t("faq.join"), icon: "i-simple-icons-discord", to: SITE_LINKS.discord },
  { label: t("supporters.become"), icon: "i-simple-icons-patreon", to: SITE_LINKS.patreon },
]);

const scrolled = ref(false);
const activeSection = ref("");
const mobileOpen = ref(false);
const languageMenu = ref<HTMLDetailsElement>();
const localizedPath = computed(() => route.path.replace(/^\/(de|es|fr|pt-BR|ru|zh-CN)(?=\/|$)/, "") || "/");
const changeLanguage = (targetLocale: SupportedLocale) => {
  localePreference.value = targetLocale;
  return navigateTo(localePath(localizedPath.value, targetLocale));
};

const isHome = computed(() => route.path === localePath());

watch(() => route.fullPath, () => (mobileOpen.value = false));

onMounted(() => {
  const onScroll = () => (scrolled.value = window.scrollY > 24);
  const onDocumentPointerDown = (event: PointerEvent) => {
    if (languageMenu.value?.open && !languageMenu.value.contains(event.target as Node)) {
      languageMenu.value.open = false;
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("pointerdown", onDocumentPointerDown);

  let spy: IntersectionObserver | undefined;
  const observeSections = () => {
    spy?.disconnect();
    activeSection.value = "";
    if (!isHome.value) return;
    spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) activeSection.value = entry.target.id;
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const { hash } of sectionLinks.value) {
      const el = document.getElementById(hash);
      if (el) spy.observe(el);
    }
  };

  observeSections();
  watch(isHome, () => nextTick(observeSections));

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("pointerdown", onDocumentPointerDown);
    spy?.disconnect();
  });
});
</script>

<template>
  <header
    :class="[
      'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500',
      scrolled || !isHome
        ? 'bg-ink-950/80 shadow-[0_1px_0_rgba(231,186,90,0.14),0_20px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl'
        : 'bg-transparent',
    ]"
  >
    <div class="mx-auto flex min-h-[var(--ui-header-height)] max-w-7xl items-center justify-between gap-x-3 px-4 py-3 sm:gap-x-5 sm:px-6 lg:px-8 2xl:gap-x-6 2xl:py-0">
      <NuxtLink :to="localePath()" class="group flex min-w-0 items-center gap-3 justify-self-start" :aria-label="t('nav.home')">
        <AppLogo
          class="h-9 w-9 shrink-0 rounded-sm ring-1 ring-gold-500/40 transition duration-300 group-hover:ring-gold-300 group-hover:shadow-[0_0_18px_rgba(231,186,90,0.45)]"
        />
        <span class="font-display text-lg font-bold tracking-[0.28em] text-gold-gradient">ELEGON</span>
      </NuxtLink>

      <nav :aria-label="t('nav.primary')" :class="['hidden min-w-0 flex-1 items-center justify-center 2xl:flex', { 'nav-locale-compact': locale !== 'en' }]">
        <ul class="flex min-w-0 flex-wrap items-center justify-center gap-x-0.5">
          <li v-for="link in sectionLinks" :key="link.hash">
            <NuxtLink
              :to="{ path: localePath(), hash: `#${link.hash}` }"
              :class="['nav-link', { 'is-active': activeSection === link.hash }]"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink :to="localePath('/changelog')" :class="['nav-link', { 'is-active': route.path === localePath('/changelog') }]">
              {{ t("nav.changelog") }}
            </NuxtLink>
          </li>
          <li>
            <details class="header-menu">
              <summary class="nav-link cursor-pointer list-none">
                {{ t("nav.more") }}
                <UIcon name="i-lucide-chevron-down" class="size-3 opacity-60" />
              </summary>
              <ul class="header-popover" :aria-label="t('nav.more')">
                <li v-for="link in externalLinks" :key="link.label">
                  <NuxtLink :to="link.to" target="_blank" rel="noopener" class="header-popover-link">
                    {{ link.label }}
                    <UIcon name="i-lucide-arrow-up-right" class="size-3 opacity-50" />
                  </NuxtLink>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </nav>

      <div class="flex shrink-0 items-center gap-1">
        <details ref="languageMenu" class="header-menu">
          <summary class="flex size-9 cursor-pointer list-none items-center justify-center text-parchment-muted transition hover:text-gold-300" :aria-label="t('nav.language')">
            <UIcon name="i-lucide-languages" class="size-[1.15rem]" />
          </summary>
          <ul class="header-popover header-language-popover" :aria-label="t('nav.language')">
            <li v-for="code in SUPPORTED_LOCALES" :key="code">
              <button type="button" :class="['header-popover-link w-full text-left', { 'is-current': locale === code }]" @click="changeLanguage(code)">
                {{ LOCALE_NAMES[code] }}
              </button>
            </li>
          </ul>
        </details>
        <UTooltip v-for="social in socials" :key="social.label" :text="social.label">
          <NuxtLink
            :to="social.to"
            target="_blank"
            rel="noopener"
            :aria-label="social.label"
            class="hidden size-9 items-center justify-center text-parchment-muted transition hover:text-gold-300 sm:flex"
          >
            <UIcon :name="social.icon" class="size-[1.15rem]" />
          </NuxtLink>
        </UTooltip>

        <GameButton :to="SITE_LINKS.steam" icon="i-simple-icons-steam" class="ml-2 hidden md:inline-flex">
          {{ t("nav.wishlist") }}
        </GameButton>

        <button
          type="button"
          class="ml-1 flex size-10 items-center justify-center text-gold-200 2xl:hidden"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-menu"
          :aria-label="t('nav.openMenu')"
          @click="mobileOpen = true"
        >
          <UIcon name="i-lucide-menu" class="size-6" />
        </button>
      </div>
    </div>

    <USlideover
      v-model:open="mobileOpen"
      side="right"
      :title="t('nav.menu')"
      :ui="{
        content: 'bg-ink-950 border-l border-gold-500/20 max-w-xs',
        header: 'border-b border-gold-500/15',
        title: 'font-display tracking-[0.25em] uppercase text-gold-300 text-sm',
        body: 'p-0 sm:p-0',
      }"
    >
      <template #body>
        <nav id="mobile-menu" :aria-label="t('nav.mobile')" class="flex h-full flex-col">
          <ul class="flex flex-col py-2">
            <li v-for="link in sectionLinks" :key="link.hash">
              <NuxtLink :to="{ path: localePath(), hash: `#${link.hash}` }" class="mobile-link" @click="mobileOpen = false">
                {{ link.label }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/changelog')" class="mobile-link" @click="mobileOpen = false">{{ t("nav.changelog") }}</NuxtLink>
            </li>
            <li v-for="link in externalLinks" :key="link.label">
              <NuxtLink :to="link.to" target="_blank" rel="noopener" class="mobile-link">
                {{ link.label }}
                <UIcon name="i-lucide-arrow-up-right" class="size-4 opacity-50" />
              </NuxtLink>
            </li>
          </ul>

          <div class="mt-auto space-y-5 border-t border-gold-500/15 p-5">
            <GameButton :to="SITE_LINKS.steam" icon="i-simple-icons-steam" class="w-full">
              {{ t("nav.wishlistSteam") }}
            </GameButton>
            <div class="flex justify-center gap-5">
              <NuxtLink
                v-for="social in socials"
                :key="social.label"
                :to="social.to"
                target="_blank"
                rel="noopener"
                :aria-label="social.label"
                class="text-parchment-muted transition hover:text-gold-300"
              >
                <UIcon :name="social.icon" class="size-6" />
              </NuxtLink>
            </div>
          </div>
        </nav>
      </template>
    </USlideover>
  </header>
</template>

<style scoped>
.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem clamp(0.35rem, 0.6vw, 0.65rem);
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
  color: rgba(239, 228, 208, 0.78);
  transition: color 0.25s ease;
}

.nav-locale-compact .nav-link {
  padding-inline: 0.3rem;
  font-size: 0.66rem;
  letter-spacing: 0;
  text-transform: none;
}

.nav-link::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0.15rem;
  width: 5px;
  height: 5px;
  background: var(--color-gold-400);
  box-shadow: 0 0 10px var(--color-gold-400);
  transform: translateX(-50%) rotate(45deg) scale(0);
  transition: transform 0.3s ease;
}

.nav-link:hover,
.nav-link.is-active {
  color: var(--color-gold-300);
}

.nav-link:hover::after,
.nav-link.is-active::after {
  transform: translateX(-50%) rotate(45deg) scale(1);
}

.header-menu {
  position: relative;
}

.header-menu > summary::-webkit-details-marker {
  display: none;
}

.header-popover {
  position: absolute;
  top: calc(100% + 0.55rem);
  right: 0;
  z-index: 10;
  min-width: 10.5rem;
  overflow: hidden;
  border: 1px solid rgba(231, 186, 90, 0.22);
  border-radius: 0.25rem;
  background: rgba(12, 14, 20, 0.98);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
}

.header-language-popover {
  min-width: 11rem;
}

.header-popover-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 0.9rem;
  font-family: var(--font-display);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: rgba(239, 228, 208, 0.82);
  transition: color 0.2s ease, background-color 0.2s ease;
}

.header-popover-link:hover,
.header-popover-link.is-current {
  color: var(--color-gold-300);
  background: rgba(231, 186, 90, 0.08);
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.25rem;
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-parchment);
  border-left: 2px solid transparent;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.mobile-link:hover {
  color: var(--color-gold-300);
  background: rgba(231, 186, 90, 0.06);
  border-left-color: var(--color-gold-400);
}
</style>
