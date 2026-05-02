<script setup lang="ts">
definePageMeta({
  layout: false,
});

import { parseMarkdown } from "@nuxtjs/mdc/runtime";

import v1Markdown from "../assets/changelog/1.md?raw";
import v2Markdown from "../assets/changelog/2.md?raw";
import v3Markdown from "../assets/changelog/3.md?raw";
import v4Markdown from "../assets/changelog/4.md?raw";
import v5Markdown from "../assets/changelog/5.md?raw";
import v6Markdown from "../assets/changelog/6.md?raw";
import v7Markdown from "../assets/changelog/7.md?raw";
import v8Markdown from "../assets/changelog/8.md?raw";
import v9Markdown from "../assets/changelog/9.md?raw";
import v10Markdown from "../assets/changelog/10.md?raw";
import v11Markdown from "../assets/changelog/11.md?raw";
import v12Markdown from "../assets/changelog/12.md?raw";
import v13Markdown from "../assets/changelog/13.md?raw";
import v14Markdown from "../assets/changelog/14.md?raw";

const changelogFiles = [
  v14Markdown,
  v13Markdown,
  v12Markdown,
  v11Markdown,
  v10Markdown,
  v9Markdown,
  v8Markdown,
  v7Markdown,
  v6Markdown,
  v5Markdown,
  v4Markdown,
  v3Markdown,
  v2Markdown,
  v1Markdown,
];

const versions = await Promise.all(
  changelogFiles.map(async (markdown) => {
    const ast = await parseMarkdown(markdown);

    return {
      id: ast.data.id,
      badge: ast.data.badge,
      title: ast.data.title,
      date: ast.data.date,
      authors: ast.data.authors,
      body: ast.body,
      data: ast.data,
    };
  }),
);
</script>

<template>
  <div class="min-h-screen xl:grid xl:grid-cols-2 -mt-16">
    <UPageSection
      title="Changelog"
      description="View the latest updates for the elegon project! Updated everyday."
      orientation="vertical"
      :ui="{
        root: 'border-b border-default xl:border-b-0 xl:sticky xl:inset-y-0 xl:h-screen overflow-hidden',
        container: 'h-full items-center justify-center',
        wrapper: 'flex flex-col',
        headline: 'mb-6',
        title: 'text-left text-4xl',
        description: 'text-left max-w-lg',
      }"
    >
      <template #top>
        <SkyBg />

        <div
          class="absolute -right-1/2 z-[-1] rounded-full bg-primary blur-[300px] size-60 sm:size-100 transform -translate-y-1/2 top-1/2"
        />
      </template>

      <template #headline>
        <AppLogo class="w-auto h-6 shrink-0 text-highlighted rounded" />
      </template>

      <template #default />
    </UPageSection>

    <section class="px-4 sm:px-6 xl:px-0 xl:-ms-30 xl:flex-1">
      <UChangelogVersions
        as="main"
        :indicator-motion="false"
        :ui="{
          root: 'py-16 sm:py-24 lg:py-32',
          indicator: 'inset-y-0',
        }"
      >
        <UChangelogVersion
          v-for="(version, index) in versions"
          :key="version.badge"
          :title="version.title"
          :date="version.date"
          :badge="index == 0 ? 'New' : version.badge"
          :authors="version.authors"
          :ui="{
            root: 'flex items-start',
            container: 'max-w-xl min-w-0',
            header: 'border-b border-default pb-4',
            title: 'text-3xl',
            date: 'text-xs/9 text-highlighted font-mono',
            indicator:
              'sticky top-0 pt-16 -mt-16 sm:pt-24 sm:-mt-24 lg:pt-32 lg:-mt-32',
          }"
        >
          <template #body>
            <MDCRenderer
              v-if="version.body"
              :body="version.body"
              :data="version.data"
            />
          </template>
        </UChangelogVersion>
      </UChangelogVersions>
    </section>
  </div>
</template>
