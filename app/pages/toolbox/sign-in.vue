<script setup lang="ts">
const route = useRoute();
const pending = ref(false);
const error = ref("");
const callback = computed(() => {
  try {
    const url = new URL(String(route.query.callback ?? ""));
    return url.protocol === "http:" &&
      url.hostname === "127.0.0.1" &&
      url.port &&
      !url.username &&
      !url.password &&
      url.pathname === "/callback" &&
      !url.search &&
      !url.hash
      ? url.href
      : null;
  } catch {
    return null;
  }
});
const state = computed(() => String(route.query.state ?? ""));
const valid = computed(() => callback.value && /^[a-f0-9]{64}$/.test(state.value));
const form = ref<HTMLFormElement>();
const token = ref("");
const displayName = ref("");
useHead({
  title: "Sign in to Elegon Toolbox",
  meta: [{ name: "referrer", content: "no-referrer" }],
});

async function signIn() {
  if (!valid.value) return;
  pending.value = true;
  error.value = "";
  try {
    const session = await $fetch("/api/toolbox/session", { method: "POST" });
    token.value = session.token;
    displayName.value = session.display_name;
    await nextTick();
    form.value?.submit();
  } catch (cause: any) {
    if (cause.statusCode === 401 || cause.response?.status === 401) {
      window.location.assign(`/auth/steam/start?return=${encodeURIComponent(route.fullPath)}`);
      return;
    }
    error.value = "Sign-in failed. Please try again.";
    pending.value = false;
  }
}
</script>

<template>
  <UContainer class="py-24 max-w-lg">
    <UCard>
      <h1 class="text-xl font-semibold mb-3">Sign in to Elegon Toolbox</h1>
      <p class="text-muted mb-6">
        Continue with your Elegon account. Administrative actions require an account on the server's
        admin list.
      </p>
      <UButton v-if="valid" :loading="pending" @click="signIn">Continue with Elegon</UButton>
      <p v-else>Open this page using Sign in in the Toolbox.</p>
      <p v-if="error" role="alert" class="text-error mt-4">{{ error }}</p>
      <form v-if="valid" ref="form" :action="callback!" method="post">
        <input type="hidden" name="state" :value="state" />
        <input type="hidden" name="token" :value="token" />
        <input type="hidden" name="display_name" :value="displayName" />
      </form>
    </UCard>
  </UContainer>
</template>
