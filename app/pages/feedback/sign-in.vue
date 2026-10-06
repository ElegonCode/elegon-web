<script setup lang="ts">
// Elegon Feedback sends players here for "Sign in with Elegon". The request id
// names a sign-in the auth service is holding; approving it sends the player
// back to the feedback site signed in as their Elegon account.
useSeoMeta({ title: "Sign in to Elegon Feedback", robots: "noindex, nofollow" });
const route = useRoute();
const request = computed(() => (typeof route.query.request === "string" && /^[a-f0-9]{64}$/.test(route.query.request) ? route.query.request : ""));
const { data, pending, error, refresh, status } = useAccount();
const account = computed(() => data.value?.account);
const live = ref<boolean | null>(null);
const hasEmail = ref<boolean | null>(null);
const busy = ref(false);
const failure = ref("");
const steamUrl = computed(() => `/auth/steam/start?return=${encodeURIComponent(`/feedback/sign-in?request=${request.value}`)}`);

onMounted(async () => {
  if (!request.value) { live.value = false; return; }
  try { live.value = (await $fetch<{ live: boolean }>("/api/feedback/request", { query: { request: request.value } })).live; }
  catch { live.value = null; failure.value = "Sign-in is unavailable right now. Please try again in a moment."; }
});
watch(() => account.value?.id, async id => {
  hasEmail.value = null;
  if (!id) return;
  try { hasEmail.value = !!(await $fetch<{ email: string | null }>("/api/account/email")).email; }
  catch { failure.value = "Your account could not be loaded. Please refresh and try again."; }
}, { immediate: true });

async function finish(action: "approve" | "deny") {
  busy.value = true; failure.value = "";
  try {
    const result = await $fetch<{ redirect: string }>(`/api/feedback/${action}`, { method: "POST", body: { request: request.value } });
    window.location.assign(result.redirect);
  } catch (caught: any) {
    const code = caught?.data?.data?.error;
    if (code === "request_expired") live.value = false;
    else if (code === "email_required") hasEmail.value = false;
    else failure.value = caught?.data?.statusMessage || "Sign-in could not be completed. Please try again.";
    busy.value = false;
  }
}
</script>

<template>
  <section class="feedback-page min-h-[80vh] px-4 pb-24 pt-36 sm:px-6">
    <div class="mx-auto max-w-xl">
      <p class="mb-4 text-xs uppercase tracking-[0.3em] text-gold-400">Elegon Feedback</p>
      <h1 class="font-display text-4xl text-parchment">Sign in with Elegon</h1>
      <p class="mt-4 leading-relaxed text-parchment-muted">Use your Elegon account to post ideas, report bugs and vote on the feedback site.</p>

      <p v-if="failure" role="alert" class="mt-8 rounded border border-gold-500/30 bg-gold-500/5 p-4 text-parchment">{{ failure }}</p>

      <div v-if="live === false" class="feedback-panel mt-10">
        <h2 class="font-display text-2xl text-parchment">This sign-in link has expired</h2>
        <p class="mt-3 leading-relaxed text-parchment-muted">Go back to Elegon Feedback and choose “Sign in with Elegon” again.</p>
        <GameButton class="mt-6" variant="secondary" to="https://feedback.elegon.app">Back to Elegon Feedback</GameButton>
      </div>
      <p v-else-if="live === null && !failure || pending || status === 'idle'" role="status" class="mt-12 text-parchment-muted">Loading…</p>
      <div v-else-if="error" role="alert" class="feedback-panel mt-10">
        <p class="text-parchment-muted">Your account could not be loaded. Please try again.</p>
        <GameButton class="mt-6" variant="secondary" @click="refresh()">Try again</GameButton>
      </div>
      <div v-else-if="!account" class="feedback-panel mt-10">
        <UIcon name="i-simple-icons-steam" class="mb-5 size-9 text-gold-300" />
        <h2 class="font-display text-2xl text-parchment">Sign in to continue</h2>
        <p class="mt-3 leading-relaxed text-parchment-muted">Sign in with the Steam account you play Elegon on. You will come straight back here.</p>
        <a v-if="data?.enabled" :href="steamUrl" class="mt-7 inline-flex items-center gap-3 rounded-sm border border-gold-400/40 bg-gold-400/10 px-6 py-3 font-display text-sm text-gold-200 transition hover:bg-gold-400/20">
          <UIcon name="i-simple-icons-steam" class="size-5" /> Sign in with Steam
        </a>
        <p v-else class="mt-7 text-sm text-gold-300">Website sign-in is coming soon.</p>
        <button class="mt-6 block text-sm text-parchment-muted hover:text-parchment disabled:opacity-50" :disabled="busy" @click="finish('deny')">Cancel</button>
      </div>
      <div v-else-if="account.deletion_pending" class="feedback-panel mt-10">
        <p class="text-parchment-muted">Your account is being deleted, so it cannot be used to sign in.</p>
      </div>
      <div v-else-if="hasEmail === null" role="status" class="mt-12 text-parchment-muted">Loading…</div>
      <div v-else class="feedback-panel mt-10">
        <div class="flex min-w-0 items-center gap-4">
          <img v-if="account.avatar_url" :src="account.avatar_url" alt="" referrerpolicy="no-referrer" class="size-12 rounded-sm border border-gold-500/30" />
          <div class="min-w-0">
            <p class="text-xs uppercase tracking-widest text-parchment-muted">Signed in as</p>
            <p class="break-words font-display text-xl text-parchment">{{ account.display_name || 'Adventurer' }}</p>
          </div>
        </div>
        <template v-if="!hasEmail">
          <h2 class="mt-8 font-display text-xl text-parchment">Add your email</h2>
          <p class="mt-2 mb-5 text-sm leading-relaxed text-parchment-muted">Elegon Feedback needs a verified email so it can tell you when someone replies. If you posted feedback before, use the same email and your old posts and votes will be yours again.</p>
          <AccountEmail @verified="hasEmail = true" />
        </template>
        <div class="mt-8 flex flex-wrap items-center gap-5">
          <GameButton v-if="hasEmail" :disabled="busy" @click="finish('approve')">{{ busy ? 'Signing in…' : 'Continue to Elegon Feedback' }}</GameButton>
          <button class="text-sm text-parchment-muted hover:text-parchment disabled:opacity-50" :disabled="busy" @click="finish('deny')">Cancel</button>
        </div>
        <p class="mt-6 text-xs leading-relaxed text-parchment-muted">Elegon Feedback receives your Elegon username, avatar and verified email. Not you? <NuxtLink to="/account" class="text-gold-300 hover:text-gold-200">Manage your account</NuxtLink>.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feedback-page { background: radial-gradient(ellipse at 50% 5%, rgba(231,186,90,0.06), transparent 65%); }
.feedback-panel { padding: clamp(1rem, 3vw, 1.75rem); border: 1px solid rgba(231,186,90,0.18); background: rgba(15,12,10,0.8); border-radius: 3px; }
</style>
