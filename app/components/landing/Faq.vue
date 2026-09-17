<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";

defineProps<{ items: AccordionItem[] }>();
</script>

<template>
  <section id="faq" aria-labelledby="faq-title" class="relative py-24 sm:py-32">
    <div class="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:px-8">
      <div class="space-y-8">
        <SectionHeading id="faq-title" eyebrow="Tavern talk" title="Frequently Asked Questions" align="left" />

        <div v-reveal="120" class="panel corners max-w-md space-y-4 p-7">
          <h3 class="font-display text-lg font-bold tracking-wide text-gold-200">Still have questions?</h3>
          <p class="font-serif leading-relaxed text-parchment-muted">
            Pull up a chair in the Discord. Ask anything, share ideas, and meet fellow adventurers.
          </p>
          <GameButton :to="SITE_LINKS.discord" variant="secondary" icon="i-simple-icons-discord">
            Join the Discord
          </GameButton>
        </div>
      </div>

      <div v-reveal="80">
        <UAccordion
          :items="items"
          :default-value="['0']"
          type="multiple"
          :unmount-on-hide="false"
          :ui="{
            root: 'space-y-3',
            item: 'panel border-b! border-gold-500/15 px-6 transition-colors duration-300 data-[state=open]:border-gold-400/40',
            trigger: 'py-5 gap-4 font-display text-base sm:text-lg font-semibold tracking-wide text-parchment hover:text-gold-200 data-[state=open]:text-gold-200 cursor-pointer',
            trailingIcon: 'size-5 text-gold-400',
            body: 'pb-6 pt-0 font-serif text-lg leading-relaxed text-parchment-muted',
          }"
        />
      </div>
    </div>
  </section>
</template>
