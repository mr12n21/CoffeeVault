<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { user, logout } = useAuth();

async function onLogout() {
  logout();
  await navigateTo("/login");
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-semibold text-espresso">☕ Coffee Vault</h1>
      <button class="text-sm text-stone-500 underline" @click="onLogout">Log out</button>
    </div>

    <p class="mt-2 text-stone-600">Welcome back{{ user?.email ? `, ${user.email}` : "" }}.</p>

    <div class="mt-8 rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">
      Bean vault, freezer tracking, and recipe prototyper UI are coming soon.
    </div>
  </div>
</template>
