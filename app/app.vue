<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { Analytics } from '@vercel/analytics/nuxt';

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Home',
    to: '/',
    active: route.fullPath == ('/')
  },
  {
    label: 'About',
    to: '#about',
    active: route.hash == ('#about')
  },
  {
    label: 'Vision',
    to: '#vision',
    active: route.hash == ('#vision')
  },
  {
    label: 'FaQ',
    to: '#faq',
    active: route.hash == ('#faq')
  },
  {
    label: 'Feedback',
    to: 'https://elegon.userjot.com/board',
    target: '_blank'
  },
  {
    label: 'Roadmap',
    to: 'https://elegon.userjot.com/roadmap',
    target: '_blank'
  }
])
</script>

<template>
  <UApp>
    <UHeader title="Elegon" :toggle="false">
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-9 shrink-0 rounded" />
        </NuxtLink>

        <!-- <TemplateMenu /> -->
      </template>

            <UNavigationMenu :items="items" />

            <template #right>
            <UColorModeButton />

            <UTooltip text="Watch on YouTube">
                <UButton
                color="neutral"
                variant="ghost"
                to="https://www.youtube.com/@ElegonMMO"
                target="_blank"
                icon="i-simple-icons-youtube"
                aria-label="YouTube"
                />
            </UTooltip>
            <UTooltip text="View our Steam page">
                <UButton
                color="neutral"
                variant="ghost"
                to="https://store.steampowered.com/app/4235360/Elegon/"
                target="_blank"
                icon="i-simple-icons-steam"
                aria-label="Steam"
                />
            </UTooltip>
            <UTooltip text="Join our Discord Server">
                <UButton
                color="neutral"
                variant="ghost"
                to="https://discord.gg/4G32msBn7V"
                target="_blank"
                icon="i-simple-icons-discord"
                aria-label="Discord"
                />
            </UTooltip>
            <UTooltip text="Support me on Patreon">
                <UButton
                color="neutral"
                variant="ghost"
                to="https://www.patreon.com/cw/Elegon"
                target="_blank"
                icon="i-simple-icons-patreon"
                aria-label="Patreon"
                />
            </UTooltip>
            <UTooltip text="Support me on Ko-fi">
                <UButton
                color="neutral"
                variant="ghost"
                to="https://ko-fi.com/elegon"
                target="_blank"
                icon="i-simple-icons-kofi"
                aria-label="KO-FI"
                />
            </UTooltip>
            </template>
        </UHeader>
        <UMain>
          <NuxtLayout>
              <Analytics />
              <NuxtPage />
          </NuxtLayout>
        </UMain>
        <UFooter class="p-4 bg-neutral-100 dark:bg-neutral-950 text-sm">
          © 2026 Elegon. Solo-developed with passion. All rights reserved.
        </UFooter>
  </UApp>
</template>