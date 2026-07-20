<script setup lang="ts">
const { user, logout } = useAuth();
const route = useRoute();
const { t, locale, locales, setLocale } = useI18n();

const navLinks = computed(() => [
  { to: "/beans", label: t("nav.beans") },
  { to: "/freezer", label: t("nav.freezer") },
  { to: "/recipes", label: t("nav.recipes") },
  { to: "/calendar", label: t("nav.calendar") },
]);

async function onLogout() {
  logout();
  await navigateTo("/login");
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-espresso via-espresso to-black text-crema">
    <header class="border-b border-white/10 bg-white/[0.02] backdrop-blur">
      <div class="mx-auto max-w-5xl px-4 py-3">
        <div class="flex items-center justify-between gap-3">
          <NuxtLink to="/" class="text-base font-semibold tracking-tight text-crema sm:text-lg">{{ t("nav.brand") }}</NuxtLink>
          <div class="flex items-center gap-3">
            <select
              :value="locale"
              class="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-stone-300 outline-none"
              :aria-label="t('language.label')"
              @change="setLocale(($event.target as HTMLSelectElement).value as 'en' | 'cs')"
            >
              <option v-for="l in locales" :key="l.code" :value="l.code">{{ l.code.toUpperCase() }}</option>
            </select>
            <span class="hidden text-sm text-stone-500 md:inline">{{ user?.email }}</span>
            <button class="text-sm text-stone-400 underline decoration-stone-600 underline-offset-2 transition hover:text-crema" @click="onLogout">
              {{ t("nav.logout") }}
            </button>
          </div>
        </div>

        <nav class="mt-3 flex gap-5 overflow-x-auto text-sm">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="shrink-0 whitespace-nowrap border-b-2 pb-2 transition"
            :class="route.path.startsWith(link.to) ? 'border-crema font-semibold text-crema' : 'border-transparent text-stone-500 hover:text-stone-200'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <slot />
    </main>
  </div>
</template>
