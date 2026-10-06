<script setup lang="ts">
import type { PatreonSupport } from "../../server/utils/patreonSupport";
import { patreonSupportDuration, patreonSupportMonths } from "~/utils/patreonStats";
import type { CharacterCard } from "../../server/utils/accountCharacters";
import { formatAccountDate, formatAccountAge } from "~/utils/accountStats";

type Realm = { name: string; available: boolean; characters: CharacterCard[]; error: string | null };
useSeoMeta({ title: "Your account", robots: "noindex, nofollow" });
useHead({ htmlAttrs: { lang: "en" } });
const route = useRoute();
const { data, pending, error, refresh, status } = useAccount();
const account = computed(() => data.value?.account);
const tabs: { id: string; label: string; disabled?: boolean }[] = [{ id: 'details', label: 'Details' }, { id: 'subscription', label: 'Manage subscription', disabled: true }, { id: 'connections', label: 'Connections' }, { id: 'characters', label: 'Characters' }, { id: 'danger', label: 'Danger zone' }];
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
  const enabledTabs = tabs.filter(tab => !tab.disabled);
  index = enabledTabs.findIndex(tab => tab.id === tabs[index]?.id);
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
    await refresh(); usernameMessage.value = 'Your Elegon username has been updated.';
  } catch { usernameError.value = 'Your username could not be saved. Use 2–32 letters, numbers, spaces, dots, underscores or hyphens.'; }
  finally { savingUsername.value = false; }
}
function openDeleteDialog() { deletionConfirmation.value = ''; deletionError.value = ''; deleteDialog.value?.showModal(); }
async function deleteAccount() {
  if (!account.value || deletionConfirmation.value !== 'DELETE') return;
  deleting.value = true; deletionError.value = '';
  try {
    await $fetch('/api/account/delete', { method: 'POST', body: { account_id: account.value.id, confirmation: deletionConfirmation.value }, timeout: 90_000, retry: 0 });
    deleteDialog.value?.close(); realms.value = []; deleted.value = true; await refresh();
  } catch { deletionError.value = 'Deletion could not finish. Please try again to resume cleanup. Your account is locked while deletion is in progress.'; await refresh(); }
  finally { deleting.value = false; }
}
const accountAge = computed(() => formatAccountAge(account.value?.created_at));
const realms = ref<Realm[]>([]);
const loadingCharacters = ref(false);
const characterError = ref("");
const signingOut = ref(false);
const connectingDiscord = ref(false);
const disconnectingDiscord = ref(false);
const connectionError = ref("");
const connectionMessage = ref("");
const discordConnection = computed(() => account.value?.connections?.find(connection => connection.provider === "discord"));
const connectionNotice = computed(() => connectionMessage.value || ({
  "discord-linked": "Discord connected to your Elegon account.",
  "discord-cancelled": "Discord connection cancelled. Your connections have not changed.",
  "discord-expired": "This connection attempt expired. Sign in and try connecting Discord again.",
  "discord-in-use": "That Discord account is connected to another Elegon account. Disconnect it there first.",
  "discord-already-linked": "Your Elegon account already has a Discord connection. Refresh to see it.",
  "discord-failed": "Discord could not be connected. Please try again.",
  "patreon-linked": "Patreon connected to your Elegon account.",
  "patreon-cancelled": "Patreon connection cancelled. Your connections have not changed.",
  "patreon-expired": "This connection attempt expired. Sign in and try connecting Patreon again.",
  "patreon-in-use": "That Patreon account is connected to another Elegon account. Disconnect it there first.",
  "patreon-already-linked": "Your Elegon account already has a Patreon connection. Refresh to see it.",
  "patreon-failed": "Patreon could not be connected. Please try again.",
} as Record<string, string>)[String(route.query.connection ?? "")] || "");
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
  } catch { if (request === supportRequest) patreonError.value = "Support details are temporarily unavailable. Please try again."; }
  finally { if (request === supportRequest) patreonLoading.value = false; }
}
watch(() => `${account.value?.id ?? ''}:${patreonConnection.value?.provider_subject ?? ''}`, loadPatreonSupport, { immediate: true });
const patreonStatus = computed(() => ({ active: "Supporting Elegon", declined: "Payment needs attention", former: "Former supporter", free: "Free member", none: "No Elegon membership" } as Record<string, string>)[patreonSupport.value?.status ?? ""]);
const patreonDuration = computed(() => patreonSupportDuration(patreonSupport.value?.since));
// The profile card's medal: only while the player is an active supporter.
const supporterMonths = computed(() => patreonSupport.value?.status === "active" ? patreonSupportMonths(patreonSupport.value.since) ?? 0 : null);
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
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
async function connectPatreon() {
  connectingPatreon.value = true;
  connectionError.value = "";
  try {
    const result = await $fetch<{ url: string }>("/api/account/connections/patreon/start", { method: "POST" });
    window.location.assign(result.url);
  } catch { connectionError.value = "Patreon could not be connected. Refresh your account and try again."; connectingPatreon.value = false; }
}
async function disconnectPatreon() {
  const id = patreonConnection.value?.provider_subject;
  if (!id) return;
  disconnectingPatreon.value = true;
  connectionError.value = "";
  try {
    await $fetch("/api/account/connections/patreon", { method: "DELETE", body: { patreon_id: id } });
    await refresh();
    connectionMessage.value = "Patreon disconnected from your Elegon account.";
  } catch { connectionError.value = "Patreon could not be disconnected. Refresh your account and try again."; }
  finally { disconnectingPatreon.value = false; }
}
const loginMessage = computed(() => {
  if (!route.query.login) return "";
  return route.query.login === "unavailable"
    ? "Website sign-in is being prepared. Please check back soon."
    : "Steam sign-in could not be completed. Please try again.";
});
const className = (selection: number) => ({ 1: "Knight", 2: "Mage", 3: "Cleric" }[selection] ?? "Adventurer");
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
  catch { if (request === rosterRequest) characterError.value = "Your characters could not be loaded. Please refresh and try again."; }
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
  } catch { characterError.value = "Sign-out could not be completed. Please try again."; }
  finally { signingOut.value = false; }
}
async function connectDiscord() {
  connectingDiscord.value = true;
  connectionError.value = "";
  try {
    const result = await $fetch<{ url: string }>("/api/account/connections/discord/start", { method: "POST" });
    window.location.assign(result.url);
  } catch {
    connectionError.value = "Discord could not be connected. Refresh your account and try again.";
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
    connectionMessage.value = "Discord disconnected from your Elegon account.";
  } catch { connectionError.value = "Discord could not be disconnected. Refresh your account and try again."; }
  finally { disconnectingDiscord.value = false; }
}
</script>

<template>
  <section class="account-page min-h-[80vh] px-4 pb-24 pt-36 sm:px-6">
    <div class="mx-auto max-w-5xl">
      <p class="mb-4 text-xs uppercase tracking-[0.3em] text-gold-400">Your place in Elegon</p>
      <h1 class="font-display text-4xl text-parchment sm:text-5xl">Your account</h1>
      <p class="mt-4 max-w-xl leading-relaxed text-parchment-muted">{{ account ? 'Your adventurers, across every realm. Your journey continues here.' : 'Your adventurers, across every realm. Sign in with the Steam account you use to play.' }}</p>

      <p v-if="deleted" role="status" class="account-panel mt-8 text-parchment">Your Elegon account and characters have been deleted. You are signed out.</p>
      <p v-if="loginMessage" role="alert" class="mt-8 rounded border border-gold-500/30 bg-gold-500/5 p-4 text-parchment">{{ loginMessage }}</p>
      <p v-if="pending || status === 'idle'" role="status" class="mt-12 text-parchment-muted">Loading your account…</p>
      <div v-else-if="error" role="alert" class="account-panel mt-10">
        <p class="text-parchment-muted">Your account could not be loaded. Please try again.</p>
        <GameButton class="mt-6" variant="secondary" @click="refresh()">Try again</GameButton>
      </div>
      <div v-else-if="!account" class="account-panel mt-10 max-w-xl">
        <UIcon name="i-simple-icons-steam" class="mb-5 size-9 text-gold-300" />
        <h2 class="font-display text-2xl text-parchment">Continue your journey</h2>
        <p class="mt-3 leading-relaxed text-parchment-muted">Steam securely signs you into your existing Elegon account. Your characters stay linked to the account you already play on.</p>
        <a v-if="data?.enabled" href="/auth/steam/start" class="mt-7 inline-flex items-center gap-3 rounded-sm border border-gold-400/40 bg-gold-400/10 px-6 py-3 font-display text-sm text-gold-200 transition hover:bg-gold-400/20">
          <UIcon name="i-simple-icons-steam" class="size-5" /> Sign in with Steam
        </a>
        <p v-else class="mt-7 text-sm text-gold-300">Website sign-in is coming soon.</p>
      </div>
      <template v-else>
        <div class="account-panel mt-10 flex flex-wrap items-center justify-between gap-6">
          <div class="flex min-w-0 items-center gap-4">
            <img v-if="account.avatar_url" :src="account.avatar_url" alt="" referrerpolicy="no-referrer" class="size-16 rounded-sm border border-gold-500/30" />
            <div class="min-w-0">
              <h2 class="break-words font-display text-2xl text-parchment">{{ account.display_name || 'Adventurer' }}</h2>
              <p class="mt-2 text-sm text-parchment-muted">Account Created <time v-if="accountAge" :datetime="account.created_at">{{ formatAccountDate(account.created_at) }}</time><span v-else>Not recorded</span><span v-if="accountAge"> ({{ accountAge }})</span></p>
              <p v-if="feedbackStats" class="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-parchment-muted">
                <UIcon name="i-lucide-message-square-heart" class="size-4 text-gold-300" />
                <a href="https://feedback.elegon.app" target="_blank" rel="noopener" class="hover:text-gold-200">{{ plural(feedbackStats.posts, 'feedback post') }} · {{ plural(feedbackStats.comments, 'comment') }} · {{ plural(feedbackStats.votes, 'vote') }}</a>
              </p>
              <p v-else-if="feedbackLinked === false" class="mt-1 text-sm text-parchment-muted">
                <button class="text-gold-300 hover:text-gold-200" @click="activeTab = 'details'">Add an email</button> to see your feedback here.
              </p>
            </div>
          </div>
          <SupporterBadge v-if="supporterMonths !== null" :months="supporterMonths" class="supporter-slot" />
          <GameButton variant="ghost" :disabled="signingOut || connectingDiscord || disconnectingDiscord || connectingPatreon || disconnectingPatreon" @click="signOut">{{ signingOut ? 'Signing out…' : 'Sign out' }}</GameButton>
        </div>
        <div role="tablist" aria-label="Account sections" class="mt-8 flex flex-wrap gap-2 border-b border-gold-500/20 pb-3">
          <button v-for="(tab, index) in tabs" :id="`account-tab-${tab.id}`" :key="tab.id" role="tab" :disabled="tab.disabled" :aria-disabled="tab.disabled || undefined" :aria-selected="activeTab === tab.id" :aria-controls="tab.disabled ? undefined : `account-panel-${tab.id}`" :tabindex="!tab.disabled && activeTab === tab.id ? 0 : -1" class="inline-flex items-center gap-2 rounded-sm px-4 py-3 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-300 disabled:cursor-not-allowed disabled:opacity-40" :class="activeTab === tab.id ? 'bg-gold-400/10 text-gold-200' : tab.disabled ? 'text-parchment-muted' : 'text-parchment-muted hover:text-parchment'" @click="activeTab = tab.id" @keydown="tabKey($event, index)">
            {{ tab.label }}
            <span v-if="tab.id === 'connections'" class="rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums" :class="connectedProviders === 3 ? 'border-green-400/40 bg-green-400/10 text-green-300' : 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300'" :aria-label="`${connectedProviders} of 3 accounts connected`">{{ connectedProviders }}/3</span>
            <span v-if="tab.id === 'characters'" class="rounded-full border border-gold-400/30 bg-gold-400/10 px-2 py-0.5 text-xs font-medium tabular-nums text-gold-200" :aria-label="totalCharacters === null ? (loadingCharacters ? 'Loading character count' : 'Character count unavailable') : `${totalCharacters} total characters`">{{ loadingCharacters ? '…' : totalCharacters ?? '—' }}</span>
          </button>
        </div>
        <p v-if="account.deletion_pending" role="alert" class="mt-6 rounded border border-red-400/40 p-4 text-sm text-red-200">Your account is being deleted. Resume deletion in Danger zone to finish removing data from both realms.</p>
        <section v-show="activeTab === 'connections'" id="account-panel-connections" role="tabpanel" aria-labelledby="account-tab-connections" tabindex="0" class="mt-10">
          <h2 id="connections-heading" class="font-display text-2xl text-parchment">Connections</h2>
          <p class="mt-3 text-sm leading-relaxed text-parchment-muted">The accounts connected to your Elegon profile.</p>
          <p v-if="connectionNotice" role="status" class="mt-5 rounded border border-gold-500/25 bg-gold-500/5 p-4 text-sm text-parchment">{{ connectionNotice }}</p>
          <p v-if="connectionError" role="alert" class="mt-5 text-sm text-gold-300">{{ connectionError }}</p>
          <div class="mt-6 grid gap-6 md:grid-cols-2">
            <div class="account-panel flex flex-col gap-5">
              <div class="flex items-center gap-3">
                <UIcon name="i-simple-icons-steam" class="size-7 shrink-0 text-gold-300" />
                <h3 class="font-display text-xl text-parchment">Steam</h3>
                <span class="ml-auto flex items-center gap-1.5 text-xs text-parchment-muted"><UIcon name="i-lucide-lock-keyhole" class="size-3.5" /> Required</span>
              </div>
              <div class="flex min-w-0 items-center gap-3">
                <img v-if="account.avatar_url" :src="account.avatar_url" alt="" referrerpolicy="no-referrer" class="size-10 shrink-0 rounded-sm" />
                <div class="min-w-0">
                  <p class="break-words text-parchment">{{ steamConnection?.display_name || 'Adventurer' }}</p>
                  <p class="mt-1 break-all text-xs text-parchment-muted">Steam ID {{ account.steam_id }}</p>
                </div>
              </div>
              <p class="text-sm leading-relaxed text-parchment-muted">Steam is your primary sign-in and stays connected to your Elegon account.</p>
              <a :href="`https://steamcommunity.com/profiles/${account.steam_id}`" target="_blank" rel="noopener noreferrer" class="mt-auto inline-flex items-center gap-1 text-sm text-gold-300 hover:text-gold-200">Steam profile <UIcon name="i-lucide-arrow-up-right" class="size-3" /></a>
            </div>
            <div class="account-panel flex flex-col gap-5">
              <div class="flex items-center gap-3">
                <UIcon name="i-simple-icons-discord" class="size-7 shrink-0 text-indigo-300" />
                <h3 class="font-display text-xl text-parchment">Discord</h3>
                <span class="ml-auto text-xs text-parchment-muted">{{ discordConnection ? 'Connected' : 'Not connected' }}</span>
              </div>
              <div v-if="discordConnection" class="flex min-w-0 items-center gap-3">
                <img v-if="discordConnection.avatar_url" :src="discordConnection.avatar_url" alt="" referrerpolicy="no-referrer" class="size-10 shrink-0 rounded-sm" />
                <div class="min-w-0">
                  <p class="break-words text-parchment">{{ discordConnection.display_name }}</p>
                  <p class="mt-1 break-all text-xs text-parchment-muted">Discord ID {{ discordConnection.provider_subject }}</p>
                  <p class="mt-1 text-xs text-parchment-muted">Connected {{ formatAccountDate(discordConnection.linked_at) }}</p>
                </div>
              </div>
              <p v-else class="text-sm leading-relaxed text-parchment-muted">Connect your Discord account to your Elegon profile.</p>
              <div class="mt-auto">
                <GameButton v-if="discordConnection" variant="secondary" :disabled="account.deletion_pending || disconnectingDiscord || signingOut" @click="disconnectDiscord">{{ disconnectingDiscord ? 'Disconnecting…' : 'Disconnect Discord' }}</GameButton>
                <GameButton v-else-if="data?.discord_enabled" variant="secondary" :disabled="account.deletion_pending || connectingDiscord || signingOut" @click="connectDiscord">{{ connectingDiscord ? 'Connecting…' : 'Connect Discord' }}</GameButton>
                <p v-else class="text-sm text-parchment-muted">Discord connections are being prepared.</p>
              </div>
            </div>
            <div class="account-panel flex flex-col gap-5 md:col-span-2">
              <div class="flex items-center gap-3">
                <UIcon name="i-simple-icons-patreon" class="size-7 shrink-0 text-orange-300" />
                <h3 class="font-display text-xl text-parchment">Patreon</h3>
                <span class="ml-auto text-xs text-parchment-muted">{{ patreonConnection ? 'Connected' : 'Not connected' }}</span>
              </div>
              <div v-if="patreonConnection" class="flex min-w-0 items-center gap-3">
                <img v-if="patreonConnection.avatar_url" :src="patreonConnection.avatar_url" alt="" referrerpolicy="no-referrer" class="size-10 shrink-0 rounded-sm" />
                <div class="min-w-0">
                  <p class="break-words text-parchment">{{ patreonConnection.display_name }}</p>
                  <p class="mt-1 break-all text-xs text-parchment-muted">Patreon ID {{ patreonConnection.provider_subject }}</p>
                  <p class="mt-1 text-xs text-parchment-muted">Connected {{ formatAccountDate(patreonConnection.linked_at) }}</p>
                </div>
              </div>
              <template v-if="patreonConnection">
                <p v-if="patreonLoading" role="status" class="text-sm text-parchment-muted">Checking your Elegon support…</p>
                <p v-else-if="patreonError" role="status" class="text-sm text-parchment-muted">{{ patreonError }}</p>
                <div v-else-if="patreonSupport" class="grid gap-5 border-t border-gold-500/15 pt-5 sm:grid-cols-2">
                  <div>
                    <p class="text-xs uppercase tracking-widest text-parchment-muted">Elegon support</p>
                    <p class="mt-2 text-parchment">{{ patreonStatus }}</p>
                    <p v-if="patreonSupport.tiers.length" class="mt-2 text-sm text-gold-300">{{ patreonSupport.tiers.join(' · ') }}</p>
                  </div>
                  <div v-if="patreonSupport.since">
                    <p class="text-xs uppercase tracking-widest text-parchment-muted">Supporting since</p>
                    <p class="mt-2 text-parchment">{{ formatAccountDate(patreonSupport.since) }}</p>
                    <p class="mt-2 text-xs text-parchment-muted">{{ patreonDuration }}</p>
                  </div>
                </div>
                <p class="text-xs leading-relaxed text-parchment-muted">Support details can take up to five minutes to update. Disconnecting here does not cancel your Patreon membership.</p>
              </template>
              <p v-else class="text-sm leading-relaxed text-parchment-muted">Connect your Patreon account to see your Elegon supporter tier and support history.</p>
              <div class="mt-auto flex flex-wrap items-center gap-5">
                <GameButton v-if="patreonConnection" variant="secondary" :disabled="account.deletion_pending || disconnectingPatreon || signingOut" @click="disconnectPatreon">{{ disconnectingPatreon ? 'Disconnecting…' : 'Disconnect Patreon' }}</GameButton>
                <GameButton v-else-if="data?.patreon_enabled" variant="secondary" :disabled="account.deletion_pending || connectingPatreon || signingOut" @click="connectPatreon">{{ connectingPatreon ? 'Connecting…' : 'Connect Patreon' }}</GameButton>
                <p v-else class="text-sm text-parchment-muted">Patreon connections are being prepared.</p>
                <button v-if="patreonConnection" class="text-sm text-gold-300 disabled:opacity-50" :disabled="patreonLoading || disconnectingPatreon || signingOut" @click="loadPatreonSupport">Refresh support</button>
              </div>
            </div>
          </div>
        </section>
        <section v-show="activeTab === 'details'" id="account-panel-details" role="tabpanel" aria-labelledby="account-tab-details" tabindex="0">
        <form class="account-panel mt-6" @submit.prevent="saveUsername">
          <label for="account-username" class="font-display text-xl text-parchment">Elegon username</label>
          <p id="username-help" class="mt-2 text-sm text-parchment-muted">Choose the name for your Elegon account. Your character names and Steam profile stay the same.</p>
          <div class="mt-5 flex flex-wrap gap-3">
            <input id="account-username" v-model="username" autocomplete="nickname" minlength="2" maxlength="64" required aria-describedby="username-help" :disabled="savingUsername || account.deletion_pending" class="min-w-0 flex-1 rounded-sm border border-gold-500/30 bg-black/30 px-4 py-3 text-parchment focus:outline-gold-300" />
            <GameButton type="submit" variant="secondary" :disabled="savingUsername || account.deletion_pending || username.trim() === account.display_name">{{ savingUsername ? 'Saving…' : 'Save username' }}</GameButton>
          </div>
          <p v-if="usernameMessage" role="status" class="mt-4 text-sm text-gold-200">{{ usernameMessage }}</p>
          <p v-if="usernameError" role="alert" class="mt-4 text-sm text-red-200">{{ usernameError }}</p>
        </form>
        <div class="account-panel mt-6">
          <h3 class="font-display text-xl text-parchment">Email</h3>
          <p class="mt-2 mb-5 max-w-2xl text-sm leading-relaxed text-parchment-muted">Used to sign in to <a href="https://feedback.elegon.app" target="_blank" rel="noopener" class="text-gold-300 hover:text-gold-200">Elegon Feedback</a> and to send feedback from the game. If you posted feedback before, use the same email to claim it.</p>
          <AccountEmail :disabled="account.deletion_pending" />
        </div>
        </section>
        <section v-show="activeTab === 'characters'" id="account-panel-characters" role="tabpanel" aria-labelledby="account-tab-characters" tabindex="0">
        <div class="mb-6 mt-8 flex items-center justify-between gap-4">
          <h2 class="font-display text-2xl text-parchment">Your characters</h2>
          <button class="flex items-center gap-2 text-sm text-gold-300 disabled:opacity-50" :disabled="loadingCharacters || account.deletion_pending" @click="loadCharacters">
            <UIcon name="i-lucide-refresh-cw" class="size-4" /> Refresh
          </button>
        </div>
        <p v-if="characterError" role="alert" class="mb-6 text-gold-300">{{ characterError }}</p>
        <p v-if="loadingCharacters" role="status" class="mb-6 text-parchment-muted">Loading characters…</p>
        <div class="grid gap-6 md:grid-cols-2">
          <section v-for="realm in realms" :key="realm.name" class="account-panel">
            <h3 class="mb-5 flex items-center gap-3 font-display text-lg text-gold-200"><UIcon name="i-lucide-globe" class="size-5 text-gold-400" /> {{ realm.name }} realm</h3>
            <p v-if="!realm.available" role="status" class="text-sm leading-relaxed text-parchment-muted">{{ realm.error }}</p>
            <p v-else-if="!realm.characters.length" class="text-sm text-parchment-muted">No active characters on this realm yet.</p>
            <ul v-else class="space-y-4">
              <li v-for="character in realm.characters" :key="character.id" class="border-t border-gold-500/15 pt-4">
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0">
                    <p class="break-words font-display text-lg text-parchment">{{ character.name }}</p>
                    <p class="mt-1 text-sm text-parchment-muted">{{ className(character.classSelection) }} · {{ character.zone }}</p>
                    <p v-if="character.lastPlayed" class="mt-1 text-xs text-parchment-muted">Last played {{ formatAccountDate(character.lastPlayed) }}</p>
                  </div>
                  <span class="shrink-0 rounded-sm border border-gold-500/20 px-2 py-1 text-xs text-gold-200">Level {{ character.level }}</span>
                </div>
              </li>
            </ul>
          </section>
        </div>
        <p v-if="account.has_legacy_link && realms.some(realm => realm.available && !realm.characters.length)" class="mt-6 max-w-2xl text-sm leading-relaxed text-parchment-muted">Characters from the previous sign-in system remain linked. If an expected character is missing, sign in to its realm in the game once to complete the existing account migration, then refresh here.</p>
        </section>
        <section v-show="activeTab === 'danger'" id="account-panel-danger" role="tabpanel" aria-labelledby="account-tab-danger" tabindex="0" class="account-panel mt-8 border-red-400/30">
          <h2 class="font-display text-2xl text-red-200">Delete your Elegon account</h2>
          <p class="mt-4 max-w-2xl leading-relaxed text-parchment-muted">Permanently delete every character on both realms, including their inventory, progression and related data. All account connections will be removed and you will be signed out. This cannot be undone.</p>
          <p class="mt-3 text-sm text-parchment-muted">Deleting your Elegon account does not delete your Steam, Discord or Patreon accounts, or cancel a Patreon membership.</p>
          <button class="mt-6 rounded-sm border border-red-400/50 bg-red-500/10 px-5 py-3 text-sm text-red-200 hover:bg-red-500/20" @click="openDeleteDialog">{{ account.deletion_pending ? 'Resume account deletion' : 'Delete account…' }}</button>
        </section>
        <dialog ref="deleteDialog" aria-labelledby="delete-title" aria-describedby="delete-description" class="account-dialog" @cancel="deleting && $event.preventDefault()">
          <form @submit.prevent="deleteAccount">
            <h2 id="delete-title" class="font-display text-2xl text-red-200">Permanently delete your account?</h2>
            <p id="delete-description" class="mt-4 leading-relaxed text-parchment-muted">You are deleting {{ account.display_name }}. Every character and its related data on EU and US will be removed, and all connections will be unlinked. You cannot recover this account.</p>
            <label for="delete-confirmation" class="mt-6 block text-sm text-parchment">Type <strong>DELETE</strong> to confirm</label>
            <input id="delete-confirmation" v-model="deletionConfirmation" autofocus autocomplete="off" :disabled="deleting" class="mt-3 w-full rounded-sm border border-red-400/40 bg-black/30 px-4 py-3 text-parchment focus:outline-red-300" />
            <p v-if="deletionError" role="alert" class="mt-4 text-sm text-red-200">{{ deletionError }}</p>
            <p v-if="deleting" role="status" class="mt-4 text-sm text-parchment-muted">Removing your account from both realms. Please keep this page open.</p>
            <div class="mt-7 flex flex-wrap justify-end gap-3">
              <button type="button" :disabled="deleting" class="px-4 py-3 text-sm text-parchment-muted disabled:opacity-50" @click="deleteDialog?.close()">Cancel</button>
              <button type="submit" :disabled="deleting || deletionConfirmation !== 'DELETE'" class="rounded-sm border border-red-400/50 bg-red-500/15 px-5 py-3 text-sm text-red-200 disabled:opacity-40">{{ deleting ? 'Deleting…' : 'Delete permanently' }}</button>
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
