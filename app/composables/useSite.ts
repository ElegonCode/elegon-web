export const SITE_LINKS = {
  steam: "https://store.steampowered.com/app/4235360/Elegon/",
  discord: "https://discord.gg/4G32msBn7V",
  youtube: "https://www.youtube.com/@ElegonMMO",
  patreon: "https://www.patreon.com/cw/Elegon",
  feedback: "https://feedback.elegon.app",
} as const;

/** Responsive in-game screenshot, pre-optimised from public/images/banner.png. */
export const SCREENSHOT = {
  src: "/images/hero-1600.webp",
  srcset:
    "/images/hero-640.webp 640w, /images/hero-1024.webp 1024w, /images/hero-1600.webp 1600w, /images/hero-2400.webp 2400w",
  width: 2400,
  height: 1328,
  alt: "An adventurer with a crescent-moon staff looks out over an autumn forest glowing in the sunset in Elegon",
} as const;

export const SITE_DESCRIPTION =
  "Elegon is a solo-developed, classic-inspired MMORPG. Explore an always-online open world, earn your progression, and play the free 24/7 Steam playtest. No pay-to-win, no cash shop.";

/** Absolute origin for canonical URLs and social tags (no trailing slash). */
export function useSiteUrl() {
  const configured = useRuntimeConfig().public.siteUrl as string;
  const origin = configured || useRequestURL().origin;
  return origin.replace(/\/+$/, "");
}
