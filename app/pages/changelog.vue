<script setup lang="ts">
definePageMeta({ layout: false });

type ChangelogEntry = {
  id: number;
  date: string;
  description: string;
};

type ChangelogResponse = {
  revision: string;
  entries: ChangelogEntry[];
};

const {
  data: changelog,
  pending: isLoading,
  error: changelogError,
} = await useFetch<ChangelogResponse>("/api/changelog", {
  key: "public-changelog",
});
const entries = computed(() => changelog.value?.entries ?? []);

const groups = computed(() => {
  const byDate = new Map<string, ChangelogEntry[]>();
  for (const entry of entries.value) {
    const dateEntries = byDate.get(entry.date) ?? [];
    dateEntries.push(entry);
    byDate.set(entry.date, dateEntries);
  }

  return Array.from(byDate, ([date, changes]) => ({
    date,
    label: friendlyDate(date),
    changes: changes.sort((a, b) => b.id - a.id),
  })).sort((a, b) => b.date.localeCompare(a.date));
});

function dateAtUtcMidnight(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function friendlyDate(value: string) {
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const targetUtc = dateAtUtcMidnight(value).getTime();
  const daysAgo = Math.round((todayUtc - targetUtc) / 86_400_000);

  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo > 1 && daysAgo < 7) return `${daysAgo} days ago`;

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateAtUtcMidnight(value));
}
</script>

<template>
  <div class="min-h-screen xl:grid xl:grid-cols-2 -mt-16">
    <UPageSection
      title="Updates"
      description="The latest Elegon fixes, improvements, and new features."
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
        <div class="absolute -right-1/2 z-[-1] rounded-full bg-primary blur-[300px] size-60 sm:size-100 transform -translate-y-1/2 top-1/2" />
      </template>
      <template #default />
    </UPageSection>

    <section class="px-4 sm:px-6 xl:px-0 xl:-ms-30 xl:flex-1">
      <div v-if="isLoading" class="py-32 text-muted">Loading updates...</div>
      <UAlert
        v-else-if="changelogError"
        class="my-32 max-w-xl"
        color="error"
        title="Could not load updates"
        :description="changelogError.message"
      />
      <UChangelogVersions
        v-else
        as="main"
        :indicator-motion="false"
        :ui="{ root: 'py-16 sm:py-24 lg:py-32', indicator: 'inset-y-0' }"
      >
        <UChangelogVersion
          v-for="(group, index) in groups"
          :key="group.date"
          :title="group.label"
          :date="group.date"
          :badge="index === 0 ? 'Latest' : undefined"
          :ui="{
            root: 'flex items-start',
            container: 'max-w-xl min-w-0 flex-1',
            header: 'border-b border-default pb-4',
            title: 'text-3xl',
            date: 'text-xs/9 text-highlighted font-mono',
            indicator: 'sticky top-0 pt-16 -mt-16 sm:pt-24 sm:-mt-24 lg:pt-32 lg:-mt-32',
          }"
        >
          <template #body>
            <ul class="list-disc space-y-3 pl-5 text-muted">
              <li v-for="change in group.changes" :key="change.id">
                {{ change.description }}
              </li>
            </ul>
          </template>
        </UChangelogVersion>
      </UChangelogVersions>
    </section>
  </div>
</template>
