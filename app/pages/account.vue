<script setup lang="ts">
import type { PatreonSupport } from "../../server/utils/patreonSupport";
import { patreonSupportMonths } from "~/utils/patreonStats";
import type { CharacterCard } from "../../server/utils/accountCharacters";
import type { AccountMessageKey } from "~/utils/accountMessages";

type Realm = { name: string; available: boolean; characters: CharacterCard[]; error: string | null };
definePageMeta({ alias: ["/:locale(en|de|es|fr|pt-BR|ru|zh-CN)/account"] });
const { locale } = useLocale();
const { t, tn, formatDate, formatAge } = useAccountMessages();
useSeoMeta({ title: () => t("seo.title"), robots: "noindex, nofollow" });
useHead({ htmlAttrs: { lang: () => locale.value } });
const route = useRoute();
const { data, pending, error, refresh, status } = useAccount();
const account = computed(() => data.value?.account);
const tabs = computed<{ id: string; label: string; disabled?: boolean }[]>(() => [{ id: 'details', label: t('tabs.details') }, { id: 'subscription', label: t('tabs.subscription'), disabled: true }, { id: 'connections', label: t('tabs.connections') }, { id: 'characters', label: t('tabs.characters') }, { id: 'danger', label: t('tabs.danger') }]);
const activeTab = ref(route.query.connection ? 'connections' : 'details');
const username = ref('');
const savingUsername = ref(false);
const usernameMessage = ref('');
const usernameError = ref('');
const deleteDialog = ref<HTMLDialogElement | null>(null);
const deletionConfirmation = ref('');
const deleting = ref(false);
const deletionError = ref('');
const deleted = ref(false);
const steamConnection = computed(() => account.value?.connections?.find(c => c.provider === 'steam'));
watch(() => account.value?.display_name, name => { username.value = name ?? ''; }, { immediate: true });
watch(() => account.value?.deletion_pending, pending => { if (pending) activeTab.value = 'danger'; }, { immediate: true });
function tabKey(event: KeyboardEvent, index: number) {
  const enabledTabs = tabs.value.filter(tab => !tab.disabled);
  index = enabledTabs.findIndex(tab => tab.id === tabs.value[index]?.id);
  let next = index;
  if (event.key === 'ArrowRight') next = (index + 1) % enabledTabs.length;
  else if (event.key === 'ArrowLeft') next = (index + enabledTabs.length - 1) % enabledTabs.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = enabledTabs.length - 1;
  else return;
  event.preventDefault(); activeTab.value = enabledTabs[next]!.id;
  document.getElementById(`account-tab-${activeTab.value}`)?.focus();
}
async function saveUsername() {
  savingUsername.value = true; usernameError.value = ''; usernameMessage.value = '';
  try {
    await $fetch('/api/account/username', { method: 'POST', body: { username: username.value } });
    await refresh(); usernameMessage.value = t('details.usernameSaved');
  } catch { usernameError.value = t('details.usernameError'); }
  finally { savingUsername.value = false; }
}
function openDeleteDialog() { deletionConfirmation.value = ''; deletionError.value = ''; deleteDialog.value?.showModal(); }
async function deleteAccount() {
  if (!account.value || deletionConfirmation.value !== 'DELETE') return;
  deleting.value = true; deletionError.value = '';
  try {
    await $fetch('/api/account/delete', { method: 'POST', body: { account_id: account.value.id, confirmation: deletionConfirmation.value }, timeout: 90_000, retry: 0 });
    deleteDialog.value?.close(); realms.value = []; deleted.value = true; await refresh();
  } catch { deletionError.value = t('danger.error'); await refresh(); }
  finally { deleting.value = false; }
}
const accountAge = computed(() => formatAge(account.value?.created_at));
const realms = ref<Realm[]>([]);
const loadingCharacters = ref(false);
const characterError = ref("");
const signingOut = ref(false);
const connectingDiscord = ref(false);
const disconnectingDiscord = ref(false);
const connectionError = ref("");
const connectionMessage = ref("");
const discordConnection = computed(() => account.value?.connections?.find(connection => connection.provider === "discord"));
const connectionNotices = ["linked", "cancelled", "expired", "in-use", "already-linked", "failed"].flatMap(result => [`discord-${result}`, `patreon-${result}`]);
const connectionNotice = computed(() => {
  if (connectionMessage.value) return connectionMessage.value;
  const notice = String(route.query.connection ?? "");
  return connectionNotices.includes(notice) ? t(`notice.${notice}` as AccountMessageKey) : "";
});
const connectingPatreon = ref(false);
const disconnectingPatreon = ref(false);
const patreonConnection = computed(() => account.value?.connections?.find(connection => connection.provider === "patreon"));
const connectedProviders = computed(() => 1 + Number(!!discordConnection.value) + Number(!!patreonConnection.value));
const totalCharacters = computed(() => {
  if (loadingCharacters.value || characterError.value || !realms.value.length || realms.value.some(realm => !realm.available)) return null;
  return realms.value.reduce((total, realm) => total + realm.characters.length, 0);
});
const patreonSupport = ref<PatreonSupport | null>(null);
const patreonLoading = ref(false);
const patreonError = ref("");
let supportRequest = 0;
async function loadPatreonSupport() {
  const request = ++supportRequest;
  patreonSupport.value = null;
  patreonError.value = "";
  patreonLoading.value = !!patreonConnection.value;
  if (!patreonConnection.value) return;
  try {
    const result = await $fetch<{ support: PatreonSupport | null }>("/api/account/patreon");
    if (request === supportRequest) patreonSupport.value = result.support;
  } catch { if (request === supportRequest) patreonError.value = t("connections.patreonError"); }
  finally { if (request === supportRequest) patreonLoading.value = false; }
}
watch(() => `${account.value?.id ?? ''}:${patreonConnection.value?.provider_subject ?? ''}`, loadPatreonSupport, { immediate: true });
const patreonStatus = computed(() => {
  const status = patreonSupport.value?.status ?? "";
  return ["active", "declined", "former", "free", "none"].includes(status) ? t(`patreon.${status}` as AccountMessageKey) : undefined;
});
const patreonDuration = computed(() => {
  const months = patreonSupportMonths(patreonSupport.value?.since);
  return months === null ? "" : months === 0 ? t("patreon.lessThanMonth") : tn("patreon.months", months);
});
// The profile card's medal: only while the player is an active supporter.
const supporterMonths = computed(() => patreonSupport.value?.status === "active" ? patreonSupportMonths(patreonSupport.value.since) ?? 0 : null);
// A former supporter keeps the medal their last run earned. Coming back starts
// a new run, so the active medal counts from its own start again.
const formerSupporterMonths = computed(() => patreonSupport.value?.status === "former" && patreonSupport.value.past_months ? patreonSupport.value.past_months : null);
type FeedbackStats = { posts: number; comments: number; votes: number };
const feedbackStats = ref<FeedbackStats | null>(null);
const feedbackLinked = ref<boolean | null>(null);
let feedbackRequest = 0;
async function loadFeedbackStats() {
  const request = ++feedbackRequest;
  feedbackStats.value = null;
  feedbackLinked.value = null;
  if (!account.value || account.value.deletion_pending) return;
  try {
    const result = await $fetch<{ stats: FeedbackStats | null }>("/api/account/feedback");
    if (request !== feedbackRequest) return;
    feedbackStats.value = result.stats;
    feedbackLinked.value = !!result.stats;
  } catch { /* The counts are a decoration; leave them out if unavailable. */ }
}
watch(() => account.value?.id, loadFeedbackStats, { immediate: true });
async function connectPatreon() {
  connectingPatreon.value = true;
  connectionError.value = "";
  try {
    const result = await $fetch<{ url: string }>("/api/account/connections/patreon/start", { method: "POST" });
    window.location.assign(result.url);
  } catch { connectionError.value = t("connections.patreonConnectError"); connectingPatreon.value = false; }
}
async function disconnectPatreon() {
  const id = patreonConnection.value?.provider_subject;
  if (!id) return;
  disconnectingPatreon.value = true;
  connectionError.value = "";
  try {
    await $fetch("/api/account/connections/patreon", { method: "DELETE", body: { patreon_id: id } });
    await refresh();
    connectionMessage.value = t("connections.patreonDisconnected");
  } catch { connectionError.value = t("connections.patreonDisconnectError"); }
  finally { disconnectingPatreon.value = false; }
}
const loginMessage = computed(() => {
  if (!route.query.login) return "";
  return route.query.login === "unavailable" ? t("login.unavailable") : t("login.failed");
});
const className = (selection: number) => [1, 2, 3].includes(selection) ? t(`class.${selection}` as AccountMessageKey) : t("profile.adventurer");
let rosterRequest = 0;
async function loadCharacters() {
  if (!account.value || account.value.deletion_pending) return;
  const request = ++rosterRequest;
  loadingCharacters.value = true;
  characterError.value = "";
  try {
    const result = await $fetch<{ realms: Realm[] }>("/api/account/characters");
    if (request === rosterRequest) realms.value = result.realms;
  }
  catch { if (request === rosterRequest) characterError.value = t("characters.loadError"); }
  finally { if (request === rosterRequest) loadingCharacters.value = false; }
}
watch(() => `${account.value?.id ?? ''}:${!!account.value?.deletion_pending}`, () => {
  ++rosterRequest;
  realms.value = [];
  loadingCharacters.value = false;
  if (account.value && !account.value.deletion_pending) loadCharacters();
}, { immediate: true });
async function signOut() {
  signingOut.value = true;
  try {
    await $fetch("/api/account/logout", { method: "POST" });
    realms.value = [];
    await refresh();
  } catch { characterError.value = t("profile.signOutError"); }
  finally { signingOut.value = false; }
}
async function connectDiscord() {
  connectingDiscord.value = true;
  connectionError.value = "";
  try {
    const result = await $fetch<{ url: string }>("/api/account/connections/discord/start", { method: "POST" });
    window.location.assign(result.url);
  } catch {
    connectionError.value = t("connections.discordConnectError");
    connectingDiscord.value = false;
  }
}
async function disconnectDiscord() {
  const id = discordConnection.value?.provider_subject;
  if (!id) return;
  disconnectingDiscord.value = true;
  connectionError.value = "";
  try {
    await $fetch("/api/account/connections/discord", { method: "DELETE", body: { discord_id: id } });
    await refresh();
    connectionMessage.value = t("connections.discordDisconnected");
  } catch { connectionError.value = t("connections.discordDisconnectError"); }
  finally { disconnectingDiscord.value = false; }
}
</script>

<template>
  <section class="account-page min-h-[80vh] px-4 pb-24 pt-36 sm:px-6">
    <div class="mx-auto max-w-5xl">
      <p class="mb-4 text-xs uppercase tracking-[0.3em] text-gold-400">{{ t("header.eyebrow") }}</p>
      <h1 class="font-display text-4xl text-parchment sm:text-5xl">{{ t("header.title") }}</h1>
      <p class="mt-4 max-w-xl leading-relaxed text-parchment-muted">{{ account ? t('header.introSignedIn') : t('header.introSignedOut') }}</p>

      <p v-if="deleted" role="status" class="account-panel mt-8 text-parchment">{{ t("status.deleted") }}</p>
      <p v-if="loginMessage" role="alert" class="mt-8 rounded border border-gold-500/30 bg-gold-500/5 p-4 text-parchment">{{ loginMessage }}</p>
      <p v-if="pending || status === 'idle'" role="status" class="mt-12 text-parchment-muted">{{ t("status.loading") }}</p>
      <div v-else-if="error" role="alert" class="account-panel mt-10">
        <p class="text-parchment-muted">{{ t("status.loadError") }}</p>
        <GameButton class="mt-6" variant="secondary" @click="refresh()">{{ t("status.tryAgain") }}</GameButton>
      </div>
      <div v-else-if="!account" class="account-panel mt-10 max-w-xl">
        <UIcon name="i-simple-icons-steam" class="mb-5 size-9 text-gold-300" />
        <h2 class="font-display text-2xl text-parchment">{{ t("signIn.title") }}</h2>
        <p class="mt-3 leading-relaxed text-parchment-muted">{{ t("signIn.description") }}</p>
        <a v-if="data?.enabled" href="/auth/steam/start" class="mt-7 inline-flex items-center gap-3 rounded-sm border border-gold-400/40 bg-gold-400/10 px-6 py-3 font-display text-sm text-gold-200 transition hover:bg-gold-400/20">
          <UIcon name="i-simple-icons-steam" class="size-5" /> {{ t("signIn.steam") }}
        </a>
        <p v-else class="mt-7 text-sm text-gold-300">{{ t("signIn.comingSoon") }}</p>
      </div>
      <template v-else>
        <div class="account-panel mt-10 flex flex-wrap items-center justify-between gap-6">
          <div class="flex min-w-0 items-center gap-4">
            <img v-if="account.avatar_url" :src="account.avatar_url" alt="" referrerpolicy="no-referrer" class="size-16 rounded-sm border border-gold-500/30" />
            <div class="min-w-0">
              <h2 class="break-words font-display text-2xl text-parchment">{{ account.display_name || t('profile.adventurer') }}</h2>
              <p class="mt-2 text-sm text-parchment-muted">{{ t("profile.created") }} <time v-if="accountAge" :datetime="account.created_at">{{ formatDate(account.created_at) }}</time><span v-else>{{ t("profile.notRecorded") }}</span><span v-if="accountAge"> ({{ accountAge }})</span></p>
              <p v-if="feedbackStats" class="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-parchment-muted">
                <UIcon name="i-lucide-message-square-heart" class="size-4 text-gold-300" />
                <a href="https://feedback.elegon.app" target="_blank" rel="noopener" class="hover:text-gold-200">{{ tn('profile.feedbackPosts', feedbackStats.posts) }} · {{ tn('profile.comments', feedbackStats.comments) }} · {{ tn('profile.votes', feedbackStats.votes) }}</a>
              </p>
              <p v-else-if="feedbackLinked === false" class="mt-1 text-sm text-parchment-muted">
                <button class="text-gold-300 hover:text-gold-200" @click="activeTab = 'details'">{{ t("profile.addEmail") }}</button> {{ t("profile.addEmailSuffix") }}
              </p>
            </div>
          </div>
          <SupporterBadge v-if="supporterMonths !== null" :months="supporterMonths" :tiers="patreonSupport?.tiers" class="supporter-slot" />
          <SupporterBadge v-else-if="formerSupporterMonths !== null" :months="formerSupporterMonths" former class="supporter-slot" />
          <GameButton variant="ghost" :disabled="signingOut || connectingDiscord || disconnectingDiscord || connectingPatreon || disconnectingPatreon" @click="signOut">{{ signingOut ? t('profile.signingOut') : t('profile.signOut') }}</GameButton>
        </div>
        <div role="tablist" :aria-label="t('tabs.label')" class="mt-8 flex flex-wrap gap-2 border-b border-gold-500/20 pb-3">
          <button v-for="(tab, index) in tabs" :id="`account-tab-${tab.id}`" :key="tab.id" role="tab" :disabled="tab.disabled" :aria-disabled="tab.disabled || undefined" :aria-selected="activeTab === tab.id" :aria-controls="tab.disabled ? undefined : `account-panel-${tab.id}`" :tabindex="!tab.disabled && activeTab === tab.id ? 0 : -1" class="inline-flex items-center gap-2 rounded-sm px-4 py-3 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-300 disabled:cursor-not-allowed disabled:opacity-40" :class="activeTab === tab.id ? 'bg-gold-400/10 text-gold-200' : tab.disabled ? 'text-parchment-muted' : 'text-parchment-muted hover:text-parchment'" @click="activeTab = tab.id" @keydown="tabKey($event, index)">
            {{ tab.label }}
            <span v-if="tab.id === 'connections'" class="rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums" :class="connectedProviders === 3 ? 'border-green-400/40 bg-green-400/10 text-green-300' : 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300'" :aria-label="t('tabs.connectedCount', { count: connectedProviders })">{{ connectedProviders }}/3</span>
            <span v-if="tab.id === 'characters'" class="rounded-full border border-gold-400/30 bg-gold-400/10 px-2 py-0.5 text-xs font-medium tabular-nums text-gold-200" :aria-label="totalCharacters === null ? (loadingCharacters ? t('tabs.loadingCharacterCount') : t('tabs.characterCountUnavailable')) : tn('tabs.totalCharacters', totalCharacters)">{{ loadingCharacters ? '…' : totalCharacters ?? '—' }}</span>
          </button>
        </div>
        <p v-if="account.deletion_pending" role="alert" class="mt-6 rounded border border-red-400/40 p-4 text-sm text-red-200">{{ t("deletionPending") }}</p>
        <section v-show="activeTab === 'connections'" id="account-panel-connections" role="tabpanel" aria-labelledby="account-tab-connections" tabindex="0" class="mt-10">
          <h2 id="connections-heading" class="font-display text-2xl text-parchment">{{ t("connections.title") }}</h2>
          <p class="mt-3 text-sm leading-relaxed text-parchment-muted">{{ t("connections.description") }}</p>
          <p v-if="connectionNotice" role="status" class="mt-5 rounded border border-gold-500/25 bg-gold-500/5 p-4 text-sm text-parchment">{{ connectionNotice }}</p>
          <p v-if="connectionError" role="alert" class="mt-5 text-sm text-gold-300">{{ connectionError }}</p>
          <div class="mt-6 grid gap-6 md:grid-cols-2">
            <div class="account-panel flex flex-col gap-5">
              <div class="flex items-center gap-3">
                <UIcon name="i-simple-icons-steam" class="size-7 shrink-0 text-gold-300" />
                <h3 class="font-display text-xl text-parchment">Steam</h3>
                <span class="ml-auto flex items-center gap-1.5 text-xs text-parchment-muted"><UIcon name="i-lucide-lock-keyhole" class="size-3.5" /> {{ t("connections.required") }}</span>
              </div>
              <div class="flex min-w-0 items-center gap-3">
                <img v-if="account.avatar_url" :src="account.avatar_url" alt="" referrerpolicy="no-referrer" class="size-10 shrink-0 rounded-sm" />
                <div class="min-w-0">
                  <p class="break-words text-parchment">{{ steamConnection?.display_name || t('profile.adventurer') }}</p>
                  <p class="mt-1 break-all text-xs text-parchment-muted">{{ t("connections.steamId", { id: account.steam_id }) }}</p>
                </div>
              </div>
              <p class="text-sm leading-relaxed text-parchment-muted">{{ t("connections.steamPrimary") }}</p>
              <a :href="`https://steamcommunity.com/profiles/${account.steam_id}`" target="_blank" rel="noopener noreferrer" class="mt-auto inline-flex items-center gap-1 text-sm text-gold-300 hover:text-gold-200">{{ t("connections.steamProfile") }} <UIcon name="i-lucide-arrow-up-right" class="size-3" /></a>
            </div>
            <div class="account-panel flex flex-col gap-5">
              <div class="flex items-center gap-3">
                <UIcon name="i-simple-icons-discord" class="size-7 shrink-0 text-indigo-300" />
                <h3 class="font-display text-xl text-parchment">Discord</h3>
                <span class="ml-auto text-xs text-parchment-muted">{{ discordConnection ? t('connections.connected') : t('connections.notConnected') }}</span>
              </div>
              <div v-if="discordConnection" class="flex min-w-0 items-center gap-3">
                <img v-if="discordConnection.avatar_url" :src="discordConnection.avatar_url" alt="" referrerpolicy="no-referrer" class="size-10 shrink-0 rounded-sm" />
                <div class="min-w-0">
                  <p class="break-words text-parchment">{{ discordConnection.display_name }}</p>
                  <p class="mt-1 break-all text-xs text-parchment-muted">{{ t("connections.discordId", { id: discordConnection.provider_subject }) }}</p>
                  <p class="mt-1 text-xs text-parchment-muted">{{ t("connections.connectedOn", { date: formatDate(discordConnection.linked_at) }) }}</p>
                </div>
              </div>
              <p v-else class="text-sm leading-relaxed text-parchment-muted">{{ t("connections.discordPrompt") }}</p>
              <div class="mt-auto">
                <GameButton v-if="discordConnection" variant="secondary" :disabled="account.deletion_pending || disconnectingDiscord || signingOut" @click="disconnectDiscord">{{ disconnectingDiscord ? t('connections.disconnecting') : t('connections.discordDisconnect') }}</GameButton>
                <GameButton v-else-if="data?.discord_enabled" variant="secondary" :disabled="account.deletion_pending || connectingDiscord || signingOut" @click="connectDiscord">{{ connectingDiscord ? t('connections.connecting') : t('connections.discordConnect') }}</GameButton>
                <p v-else class="text-sm text-parchment-muted">{{ t("connections.discordPreparing") }}</p>
              </div>
            </div>
            <div class="account-panel flex flex-col gap-5 md:col-span-2">
              <div class="flex items-center gap-3">
                <UIcon name="i-simple-icons-patreon" class="size-7 shrink-0 text-orange-300" />
                <h3 class="font-display text-xl text-parchment">Patreon</h3>
                <span class="ml-auto text-xs text-parchment-muted">{{ patreonConnection ? t('connections.connected') : t('connections.notConnected') }}</span>
              </div>
              <div v-if="patreonConnection" class="flex min-w-0 items-center gap-3">
                <img v-if="patreonConnection.avatar_url" :src="patreonConnection.avatar_url" alt="" referrerpolicy="no-referrer" class="size-10 shrink-0 rounded-sm" />
                <div class="min-w-0">
                  <p class="break-words text-parchment">{{ patreonConnection.display_name }}</p>
                  <p class="mt-1 break-all text-xs text-parchment-muted">{{ t("connections.patreonId", { id: patreonConnection.provider_subject }) }}</p>
                  <p class="mt-1 text-xs text-parchment-muted">{{ t("connections.connectedOn", { date: formatDate(patreonConnection.linked_at) }) }}</p>
                </div>
              </div>
              <template v-if="patreonConnection">
                <p v-if="patreonLoading" role="status" class="text-sm text-parchment-muted">{{ t("connections.patreonChecking") }}</p>
                <p v-else-if="patreonError" role="status" class="text-sm text-parchment-muted">{{ patreonError }}</p>
                <div v-else-if="patreonSupport" class="grid gap-5 border-t border-gold-500/15 pt-5 sm:grid-cols-2">
                  <div>
                    <p class="text-xs uppercase tracking-widest text-parchment-muted">{{ t("connections.patreonSupport") }}</p>
                    <p class="mt-2 text-parchment">{{ patreonStatus }}</p>
                    <p v-if="patreonSupport.tiers.length" class="mt-2 text-sm text-gold-300">{{ patreonSupport.tiers.join(' · ') }}</p>
                  </div>
                  <div v-if="patreonSupport.since">
                    <p class="text-xs uppercase tracking-widest text-parchment-muted">{{ t("connections.patreonSince") }}</p>
                    <p class="mt-2 text-parchment">{{ formatDate(patreonSupport.since) }}</p>
                    <p class="mt-2 text-xs text-parchment-muted">{{ patreonDuration }}</p>
                  </div>
                </div>
                <p class="text-xs leading-relaxed text-parchment-muted">{{ t("connections.patreonNote") }}</p>
              </template>
              <p v-else class="text-sm leading-relaxed text-parchment-muted">{{ t("connections.patreonPrompt") }}</p>
              <div class="mt-auto flex flex-wrap items-center gap-5">
                <GameButton v-if="patreonConnection" variant="secondary" :disabled="account.deletion_pending || disconnectingPatreon || signingOut" @click="disconnectPatreon">{{ disconnectingPatreon ? t('connections.disconnecting') : t('connections.patreonDisconnect') }}</GameButton>
                <GameButton v-else-if="data?.patreon_enabled" variant="secondary" :disabled="account.deletion_pending || connectingPatreon || signingOut" @click="connectPatreon">{{ connectingPatreon ? t('connections.connecting') : t('connections.patreonConnect') }}</GameButton>
                <p v-else class="text-sm text-parchment-muted">{{ t("connections.patreonPreparing") }}</p>
                <button v-if="patreonConnection" class="text-sm text-gold-300 disabled:opacity-50" :disabled="patreonLoading || disconnectingPatreon || signingOut" @click="loadPatreonSupport">{{ t("connections.patreonRefresh") }}</button>
              </div>
            </div>
          </div>
        </section>
        <section v-show="activeTab === 'details'" id="account-panel-details" role="tabpanel" aria-labelledby="account-tab-details" tabindex="0">
        <form class="account-panel mt-6" @submit.prevent="saveUsername">
          <label for="account-username" class="font-display text-xl text-parchment">{{ t("details.usernameLabel") }}</label>
          <p id="username-help" class="mt-2 text-sm text-parchment-muted">{{ t("details.usernameHelp") }}</p>
          <div class="mt-5 flex flex-wrap gap-3">
            <input id="account-username" v-model="username" autocomplete="nickname" minlength="2" maxlength="64" required aria-describedby="username-help" :disabled="savingUsername || account.deletion_pending" class="min-w-0 flex-1 rounded-sm border border-gold-500/30 bg-black/30 px-4 py-3 text-parchment focus:outline-gold-300" />
            <GameButton type="submit" variant="secondary" :disabled="savingUsername || account.deletion_pending || username.trim() === account.display_name">{{ savingUsername ? t('details.saving') : t('details.saveUsername') }}</GameButton>
          </div>
          <p v-if="usernameMessage" role="status" class="mt-4 text-sm text-gold-200">{{ usernameMessage }}</p>
          <p v-if="usernameError" role="alert" class="mt-4 text-sm text-red-200">{{ usernameError }}</p>
        </form>
        <div class="account-panel mt-6">
          <h3 class="font-display text-xl text-parchment">{{ t("details.emailTitle") }}</h3>
          <p class="mt-2 mb-5 max-w-2xl text-sm leading-relaxed text-parchment-muted">{{ t("details.emailBefore") }} <a href="https://feedback.elegon.app" target="_blank" rel="noopener" class="text-gold-300 hover:text-gold-200">Elegon Feedback</a> {{ t("details.emailAfter") }}</p>
          <AccountEmail :disabled="account.deletion_pending" />
        </div>
        </section>
        <section v-show="activeTab === 'characters'" id="account-panel-characters" role="tabpanel" aria-labelledby="account-tab-characters" tabindex="0">
        <div class="mb-6 mt-8 flex items-center justify-between gap-4">
          <h2 class="font-display text-2xl text-parchment">{{ t("characters.title") }}</h2>
          <button class="flex items-center gap-2 text-sm text-gold-300 disabled:opacity-50" :disabled="loadingCharacters || account.deletion_pending" @click="loadCharacters">
            <UIcon name="i-lucide-refresh-cw" class="size-4" /> {{ t("characters.refresh") }}
          </button>
        </div>
        <p v-if="characterError" role="alert" class="mb-6 text-gold-300">{{ characterError }}</p>
        <p v-if="loadingCharacters" role="status" class="mb-6 text-parchment-muted">{{ t("characters.loading") }}</p>
        <div class="grid gap-6 md:grid-cols-2">
          <section v-for="realm in realms" :key="realm.name" class="account-panel">
            <h3 class="mb-5 flex items-center gap-3 font-display text-lg text-gold-200"><UIcon name="i-lucide-globe" class="size-5 text-gold-400" /> {{ t("characters.realm", { name: realm.name }) }}</h3>
            <p v-if="!realm.available" role="status" class="text-sm leading-relaxed text-parchment-muted">{{ t("characters.realmError") }}</p>
            <p v-else-if="!realm.characters.length" class="text-sm text-parchment-muted">{{ t("characters.none") }}</p>
            <ul v-else class="space-y-4">
              <li v-for="character in realm.characters" :key="character.id" class="border-t border-gold-500/15 pt-4">
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0">
                    <p class="break-words font-display text-lg text-parchment">{{ character.name }}</p>
                    <p class="mt-1 text-sm text-parchment-muted">{{ className(character.classSelection) }} · {{ character.zone }}</p>
                    <p v-if="character.lastPlayed" class="mt-1 text-xs text-parchment-muted">{{ t("characters.lastPlayed", { date: formatDate(character.lastPlayed) }) }}</p>
                  </div>
                  <span class="shrink-0 rounded-sm border border-gold-500/20 px-2 py-1 text-xs text-gold-200">{{ t("characters.level", { level: character.level }) }}</span>
                </div>
              </li>
            </ul>
          </section>
        </div>
        <p v-if="account.has_legacy_link && realms.some(realm => realm.available && !realm.characters.length)" class="mt-6 max-w-2xl text-sm leading-relaxed text-parchment-muted">{{ t("characters.legacy") }}</p>
        </section>
        <section v-show="activeTab === 'danger'" id="account-panel-danger" role="tabpanel" aria-labelledby="account-tab-danger" tabindex="0" class="account-panel mt-8 border-red-400/30">
          <h2 class="font-display text-2xl text-red-200">{{ t("danger.title") }}</h2>
          <p class="mt-4 max-w-2xl leading-relaxed text-parchment-muted">{{ t("danger.description") }}</p>
          <p class="mt-3 text-sm text-parchment-muted">{{ t("danger.note") }}</p>
          <button class="mt-6 rounded-sm border border-red-400/50 bg-red-500/10 px-5 py-3 text-sm text-red-200 hover:bg-red-500/20" @click="openDeleteDialog">{{ account.deletion_pending ? t('danger.resume') : t('danger.delete') }}</button>
        </section>
        <dialog ref="deleteDialog" aria-labelledby="delete-title" aria-describedby="delete-description" class="account-dialog" @cancel="deleting && $event.preventDefault()">
          <form @submit.prevent="deleteAccount">
            <h2 id="delete-title" class="font-display text-2xl text-red-200">{{ t("danger.dialogTitle") }}</h2>
            <p id="delete-description" class="mt-4 leading-relaxed text-parchment-muted">{{ t("danger.dialogDescription", { name: account.display_name }) }}</p>
            <label for="delete-confirmation" class="mt-6 block text-sm text-parchment">{{ t("danger.confirmBefore") }} <strong>DELETE</strong> {{ t("danger.confirmAfter") }}</label>
            <input id="delete-confirmation" v-model="deletionConfirmation" autofocus autocomplete="off" :disabled="deleting" class="mt-3 w-full rounded-sm border border-red-400/40 bg-black/30 px-4 py-3 text-parchment focus:outline-red-300" />
            <p v-if="deletionError" role="alert" class="mt-4 text-sm text-red-200">{{ deletionError }}</p>
            <p v-if="deleting" role="status" class="mt-4 text-sm text-parchment-muted">{{ t("danger.inProgress") }}</p>
            <div class="mt-7 flex flex-wrap justify-end gap-3">
              <button type="button" :disabled="deleting" class="px-4 py-3 text-sm text-parchment-muted disabled:opacity-50" @click="deleteDialog?.close()">{{ t("danger.cancel") }}</button>
              <button type="submit" :disabled="deleting || deletionConfirmation !== 'DELETE'" class="rounded-sm border border-red-400/50 bg-red-500/15 px-5 py-3 text-sm text-red-200 disabled:opacity-40">{{ deleting ? t('danger.deleting') : t('danger.confirm') }}</button>
            </div>
          </form>
        </dialog>
      </template>
    </div>
  </section>
</template>

<style scoped>
.account-dialog { width: min(36rem, calc(100% - 2rem)); max-height: calc(100dvh - 2rem); overflow-y: auto; margin: auto; padding: 1.75rem; border: 1px solid rgba(248,113,113,0.35); border-radius: 3px; background: #100e0c; }
.account-dialog::backdrop { background: rgba(0,0,0,0.8); }
.account-page { background: radial-gradient(ellipse at 50% 5%, rgba(231,186,90,0.06), transparent 65%); }
.supporter-slot { margin-left: auto; padding: 0.4rem 1rem 0.4rem 0.5rem; border-left: 1px solid rgba(231,186,90,0.18); }
@media (max-width: 640px) { .supporter-slot { margin-left: 0; border-left: 0; padding-left: 0; } }
.account-panel { padding: clamp(1rem, 3vw, 1.75rem); border: 1px solid rgba(231,186,90,0.18); background: rgba(15,12,10,0.8); border-radius: 3px; }
</style>
