<script setup lang="ts">
// Adds or changes the verified email on an Elegon account. The feedback site
// matches people by this address, so it also links any feedback posted there.
const props = defineProps<{ disabled?: boolean }>();
const emit = defineEmits<{ verified: [email: string] }>();
const current = ref<string | null>(null);
const pending = ref<string | null>(null);
const loaded = ref(false);
const loadError = ref("");
const editing = ref(false);
const email = ref("");
const code = ref("");
const busy = ref(false);
const message = ref("");
const error = ref("");

function failure(caught: any, fallback: string) {
  return caught?.data?.statusMessage || caught?.statusMessage || fallback;
}
async function load() {
  loadError.value = "";
  try {
    const result = await $fetch<{ email: string | null; pending_email: string | null }>("/api/account/email");
    current.value = result.email;
    pending.value = result.pending_email;
    editing.value = !result.email;
  } catch { loadError.value = "Your email could not be loaded. Please refresh and try again."; }
  finally { loaded.value = true; }
}
onMounted(load);
async function sendCode() {
  busy.value = true; error.value = ""; message.value = "";
  try {
    const result = await $fetch<{ pending_email: string }>("/api/account/email/start", { method: "POST", body: { email: email.value } });
    pending.value = result.pending_email; code.value = "";
    message.value = `We sent a 6-digit code to ${result.pending_email}. It expires in 15 minutes.`;
  } catch (caught) { error.value = failure(caught, "The code could not be sent. Please try again."); }
  finally { busy.value = false; }
}
async function verify() {
  busy.value = true; error.value = ""; message.value = "";
  try {
    const result = await $fetch<{ email: string }>("/api/account/email/verify", { method: "POST", body: { code: code.value } });
    current.value = result.email; pending.value = null; editing.value = false; code.value = "";
    message.value = "Your email is verified. Feedback you posted with this address is now linked to your Elegon account.";
    emit("verified", result.email);
  } catch (caught) { error.value = failure(caught, "That code could not be checked. Please try again."); }
  finally { busy.value = false; }
}
function change() { editing.value = true; email.value = ""; message.value = ""; error.value = ""; pending.value = null; }
</script>

<template>
  <div>
    <p v-if="!loaded" role="status" class="text-sm text-parchment-muted">Loading your email…</p>
    <p v-else-if="loadError" role="alert" class="text-sm text-gold-300">{{ loadError }}</p>
    <template v-else>
      <div v-if="current && !editing" class="flex flex-wrap items-center gap-4">
        <p class="flex min-w-0 items-center gap-2 break-all text-parchment"><UIcon name="i-lucide-badge-check" class="size-4 shrink-0 text-green-300" /> {{ current }}</p>
        <button class="text-sm text-gold-300 hover:text-gold-200 disabled:opacity-50" :disabled="props.disabled || busy" @click="change">Change email</button>
      </div>
      <form v-else-if="!pending" class="flex flex-wrap gap-3" @submit.prevent="sendCode">
        <label for="account-email" class="sr-only">Email address</label>
        <input id="account-email" v-model="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com" :disabled="props.disabled || busy" class="min-w-0 flex-1 rounded-sm border border-gold-500/30 bg-black/30 px-4 py-3 text-parchment focus:outline-gold-300" />
        <GameButton type="submit" variant="secondary" :disabled="props.disabled || busy || !email.trim()">{{ busy ? 'Sending…' : 'Send code' }}</GameButton>
        <button v-if="current" type="button" class="px-2 text-sm text-parchment-muted" :disabled="busy" @click="editing = false">Cancel</button>
      </form>
      <form v-else class="flex flex-wrap gap-3" @submit.prevent="verify">
        <label for="account-email-code" class="w-full text-sm text-parchment-muted">Enter the code we sent to <span class="text-parchment">{{ pending }}</span></label>
        <input id="account-email-code" v-model="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9 ]{6,7}" maxlength="7" required placeholder="123456" :disabled="props.disabled || busy" class="w-40 rounded-sm border border-gold-500/30 bg-black/30 px-4 py-3 tracking-[0.3em] text-parchment focus:outline-gold-300" />
        <GameButton type="submit" variant="secondary" :disabled="props.disabled || busy || code.replace(/\s/g, '').length !== 6">{{ busy ? 'Checking…' : 'Verify' }}</GameButton>
        <button type="button" class="px-2 text-sm text-gold-300 disabled:opacity-50" :disabled="busy" @click="pending = null">Use a different email</button>
      </form>
      <p v-if="message" role="status" class="mt-4 text-sm text-gold-200">{{ message }}</p>
      <p v-if="error" role="alert" class="mt-4 text-sm text-red-200">{{ error }}</p>
    </template>
  </div>
</template>
