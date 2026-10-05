<script setup lang="ts">
import type { CharacterCard } from "../../server/utils/accountCharacters";
import { summarizeAccountRealms, formatAccountDate, formatAccountAge } from "~/utils/accountStats";

type Realm = { name: string; available: boolean; characters: CharacterCard[]; error: string | null };
useSeoMeta({ title: "Your account", robots: "noindex, nofollow" });
useHead({ htmlAttrs: { lang: "en" } });
const route = useRoute();
const { data, pending, error, refresh, status } = useAccount();
const account = computed(() => data.value?.account);
const accountAge = computed(() => formatAccountAge(account.value?.created_at));
const realms = ref<Realm[]>([]);
const loadingCharacters = ref(false);
const characterError = ref("");
const signingOut = ref(false);
const stats = computed(() => summarizeAccountRealms(realms.value));
const loginMessage = computed(() => {
  if (!route.query.login) return "";
  return route.query.login === "unavailable"
    ? "Website sign-in is being prepared. Please check back soon."
    : "Steam sign-in could not be completed. Please try again.";
});
const className = (selection: number) => ({ 1: "Knight", 2: "Mage", 3: "Cleric" }[selection] ?? "Adventurer");
async function loadCharacters() {
  loadingCharacters.value = true;
  characterError.value = "";
  try { realms.value = (await $fetch<{ realms: Realm[] }>("/api/account/characters")).realms; }
  catch { characterError.value = "Your characters could not be loaded. Please refresh and try again."; }
  finally { loadingCharacters.value = false; }
}
watch(() => account.value?.id, (id) => {
  realms.value = [];
  if (id) loadCharacters();
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
</script>

<template>
  <section class="account-page min-h-[80vh] px-4 pb-24 pt-36 sm:px-6">
    <div class="mx-auto max-w-5xl">
      <p class="mb-4 text-xs uppercase tracking-[0.3em] text-gold-400">Your place in Elegon</p>
      <h1 class="font-display text-4xl text-parchment sm:text-5xl">Your account</h1>
      <p class="mt-4 max-w-xl leading-relaxed text-parchment-muted">{{ account ? 'Your adventurers, across every realm. Your journey continues here.' : 'Your adventurers, across every realm. Sign in with the Steam account you use to play.' }}</p>

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
              <p class="mt-2 flex items-center gap-2 text-sm text-parchment-muted"><UIcon name="i-simple-icons-steam" class="size-4" /> Steam connected</p>
              <p class="mt-1 break-all text-xs text-parchment-muted">Steam ID {{ account.steam_id }}</p>
            </div>
          </div>
          <GameButton variant="ghost" :disabled="signingOut" @click="signOut">{{ signingOut ? 'Signing out…' : 'Sign out' }}</GameButton>
        </div>
        <dl class="account-panel mt-6 grid gap-6 sm:grid-cols-3">
          <div>
            <dt class="text-xs uppercase tracking-widest text-parchment-muted">Account created</dt>
            <dd class="mt-2 text-parchment"><time v-if="account.created_at" :datetime="account.created_at">{{ formatAccountDate(account.created_at) }}</time><span v-else>Not recorded</span></dd>
            <p v-if="accountAge" class="mt-2 text-xs text-parchment-muted">{{ accountAge }}</p>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-widest text-parchment-muted">First character</dt>
            <dd class="mt-2 text-parchment">{{ loadingCharacters ? 'Loading…' : stats.available ? formatAccountDate(stats.firstCharacter) : 'Unavailable' }}</dd>
            <p v-if="stats.firstCharacter && account.created_at && stats.firstCharacter < account.created_at" class="mt-2 text-xs leading-relaxed text-parchment-muted">Your adventures began before this account record.</p>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-widest text-parchment-muted">This sign-in</dt>
            <dd class="mt-2 text-parchment">{{ formatAccountDate(account.signed_in_at) }}</dd>
            <a :href="`https://steamcommunity.com/profiles/${account.steam_id}`" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex items-center gap-1 text-xs text-gold-300 hover:text-gold-200">Steam profile <UIcon name="i-lucide-arrow-up-right" class="size-3" /></a>
          </div>
        </dl>
        <dl class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div class="account-panel">
            <dt class="text-xs uppercase tracking-widest text-parchment-muted">Characters</dt>
            <dd class="mt-3 font-display text-3xl text-gold-200">{{ loadingCharacters || !stats.available ? '—' : stats.characters }}</dd>
          </div>
          <div class="account-panel">
            <dt class="text-xs uppercase tracking-widest text-parchment-muted">Highest level</dt>
            <dd class="mt-3 font-display text-3xl text-gold-200">{{ loadingCharacters || !stats.available ? '—' : stats.highestLevel ?? '—' }}</dd>
          </div>
          <div class="account-panel">
            <dt class="text-xs uppercase tracking-widest text-parchment-muted">Realms explored</dt>
            <dd class="mt-3 font-display text-3xl text-gold-200">{{ loadingCharacters || !stats.available ? '—' : stats.realms }}</dd>
          </div>
          <div class="account-panel">
            <dt class="text-xs uppercase tracking-widest text-parchment-muted">Last played</dt>
            <dd class="mt-3 font-display text-lg text-gold-200">{{ loadingCharacters || !stats.available ? '—' : formatAccountDate(stats.lastPlayed) }}</dd>
          </div>
        </dl>
        <p v-if="!loadingCharacters && stats.partial" role="status" class="mt-4 text-sm text-parchment-muted">{{ stats.available ? 'Stats reflect available realms only. Refresh to try the others again.' : 'Character stats are unavailable while the realms cannot be reached.' }}</p>
        <div class="mb-6 mt-12 flex items-center justify-between gap-4">
          <h2 class="font-display text-2xl text-parchment">Your characters</h2>
          <button class="flex items-center gap-2 text-sm text-gold-300 disabled:opacity-50" :disabled="loadingCharacters" @click="loadCharacters">
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
      </template>
    </div>
  </section>
</template>

<style scoped>
.account-page { background: radial-gradient(ellipse at 50% 5%, rgba(231,186,90,0.06), transparent 65%); }
.account-panel { padding: clamp(1rem, 3vw, 1.75rem); border: 1px solid rgba(231,186,90,0.18); background: rgba(15,12,10,0.8); border-radius: 3px; }
</style>
