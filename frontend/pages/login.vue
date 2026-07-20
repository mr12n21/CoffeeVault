<script setup lang="ts">
definePageMeta({ layout: false });

const { login } = useAuth();
const { t } = useI18n();

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
    error.value = t("login.error");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-b from-stone-900 via-espresso to-black px-4 text-crema">
    <form class="card w-full max-w-sm space-y-5" @submit.prevent="onSubmit">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-crema">{{ t("login.title") }}</h1>
        <p class="mt-1 text-sm text-stone-400">{{ t("login.subtitle") }}</p>
      </div>

      <div class="space-y-1">
        <label class="field-label" for="email">{{ t("login.email") }}</label>
        <input id="email" v-model="email" type="email" required class="field-input" />
      </div>

      <div class="space-y-1">
        <label class="field-label" for="password">{{ t("login.password") }}</label>
        <input id="password" v-model="password" type="password" required class="field-input" />
      </div>

      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

      <button type="submit" :disabled="loading" class="btn-primary w-full">
        {{ loading ? t("login.signingIn") : t("login.signIn") }}
      </button>
    </form>
  </div>
</template>
