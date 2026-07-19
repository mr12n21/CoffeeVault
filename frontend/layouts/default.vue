<script setup lang="ts">
const { user, logout } = useAuth();
const route = useRoute();

const navLinks = [
  { to: "/beans", label: "Beans" },
  { to: "/freezer", label: "Freezer" },
  { to: "/recipes", label: "Recipes" },
];

async function onLogout() {
  logout();
  await navigateTo("/login");
}
</script>

<template>
  <div class="min-h-screen bg-stone-50 text-stone-900">
    <header class="border-b border-stone-200 bg-gradient-to-b from-white to-stone-50/60">
      <div class="mx-auto max-w-5xl px-4 py-3">
        <div class="flex items-center justify-between gap-3">
          <NuxtLink to="/" class="text-base font-semibold tracking-tight text-espresso sm:text-lg">Coffee Vault</NuxtLink>
          <div class="flex items-center gap-3">
            <span class="hidden text-sm text-stone-400 md:inline">{{ user?.email }}</span>
            <button class="text-sm text-stone-500 underline decoration-stone-300 underline-offset-2 transition hover:text-stone-900" @click="onLogout">
              Log out
            </button>
          </div>
        </div>

        <nav class="mt-3 flex gap-5 overflow-x-auto text-sm">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="shrink-0 whitespace-nowrap border-b-2 pb-2 transition"
            :class="route.path.startsWith(link.to) ? 'border-espresso font-semibold text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-900'"
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
