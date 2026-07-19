<script setup lang="ts">
const { register } = useAuth();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function onSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await register(email.value, password.value);
    await navigateTo("/");
  } catch (e) {
    error.value = "Registration failed. Email may already be taken, or password is too short (min 8 chars).";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <form class="w-full max-w-sm space-y-4 rounded-xl border border-stone-200 bg-white p-8 shadow-sm" @submit.prevent="onSubmit">
      <h1 class="text-2xl font-semibold text-espresso">☕ Coffee Vault</h1>
      <p class="text-sm text-stone-500">Create your vault account.</p>

      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700" for="email">Email</label>
        <input id="email" v-model="email" type="email" required class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700" for="password">Password</label>
        <input id="password" v-model="password" type="password" required minlength="8" class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button type="submit" :disabled="loading" class="w-full rounded-md bg-espresso px-4 py-2 font-medium text-crema transition hover:opacity-90 disabled:opacity-50">
        {{ loading ? "Creating account..." : "Register" }}
      </button>

      <p class="text-center text-sm text-stone-500">
        Already have an account?
        <NuxtLink to="/login" class="font-medium text-espresso underline">Sign in</NuxtLink>
      </p>
    </form>
  </div>
</template>
