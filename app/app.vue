<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

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
    label: 'The Vision',
    to: '#vision',
    active: route.hash == ('#vision')
  },
  {
    label: 'FaQ',
    to: '#faq',
    active: route.hash == ('#faq')
  },
  {
    label: 'Feedback Tracker',
    to: 'https://elegon.userjot.com/board/all?cursor=1&order=top&limit=10',
    target: '_blank'
  }
])
</script>

<template>
  <UApp>
    <UHeader title="Elegon">
            <UNavigationMenu :items="items" />

            <template #right>
            <UColorModeButton />

            <UTooltip text="Open on YouTube">
                <UButton
                color="neutral"
                variant="ghost"
                to="https://www.youtube.com/@ElegonMMO"
                target="_blank"
                icon="i-simple-icons-youtube"
                aria-label="YouTube"
                />
            </UTooltip>
            <UTooltip text="Open in Steam">
                <UButton
                color="neutral"
                variant="ghost"
                to="https://store.steampowered.com/app/4235360/Elegon/"
                target="_blank"
                icon="i-simple-icons-steam"
                aria-label="Steam"
                />
            </UTooltip>
            <UTooltip text="Open on Discord">
                <UButton
                color="neutral"
                variant="ghost"
                to="https://discord.gg/4G32msBn7V"
                target="_blank"
                icon="i-simple-icons-discord"
                aria-label="Discord"
                />
            </UTooltip>
            <UTooltip text="Open on Patreon">
                <UButton
                color="neutral"
                variant="ghost"
                to="https://www.patreon.com/cw/Elegon"
                target="_blank"
                icon="i-simple-icons-patreon"
                aria-label="Patreon"
                />
            </UTooltip>
            <UTooltip text="Open on KO-FI">
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
              <NuxtPage />
          </NuxtLayout>
        </UMain>
        <UFooter class="p-4 bg-neutral-100 dark:bg-neutral-950 text-sm">
          © 2026 Elegon. Solo-developed with passion. All rights reserved.
        </UFooter>
  </UApp>
</template>
