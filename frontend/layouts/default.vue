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
    <header class="border-b border-stone-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NuxtLink to="/" class="text-lg font-semibold text-espresso">☕ Coffee Vault</NuxtLink>
        <nav class="flex items-center gap-4 text-sm">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-stone-600 hover:text-espresso"
            :class="{ 'font-semibold text-espresso': route.path.startsWith(link.to) }"
          >
            {{ link.label }}
          </NuxtLink>
          <span class="hidden text-stone-400 sm:inline">{{ user?.email }}</span>
          <button class="text-stone-500 underline" @click="onLogout">Log out</button>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
