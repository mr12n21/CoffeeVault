<script setup lang="ts">
definePageMeta({ layout: false });

const { login } = useAuth();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function onSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await login(email.value, password.value);
    await navigateTo("/");
  } catch (e) {
    error.value = "Invalid email or password.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 via-stone-50 to-white px-4">
    <form class="w-full max-w-sm space-y-5 rounded-xl border border-stone-200 bg-white p-8 shadow-sm" @submit.prevent="onSubmit">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-espresso">Coffee Vault</h1>
        <p class="mt-1 text-sm text-stone-500">Sign in to your vault.</p>
      </div>

      <div class="space-y-1">
        <label class="field-label" for="email">Email</label>
        <input id="email" v-model="email" type="email" required class="field-input" />
      </div>

      <div class="space-y-1">
        <label class="field-label" for="password">Password</label>
        <input id="password" v-model="password" type="password" required class="field-input" />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button type="submit" :disabled="loading" class="btn-primary w-full">
        {{ loading ? "Signing in..." : "Sign in" }}
      </button>
    </form>
  </div>
</template>
