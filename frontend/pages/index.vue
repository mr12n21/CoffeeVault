<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { user } = useAuth();

const sections = [
  { to: "/beans", title: "Coffee Beans", description: "Your vault of fresh and frozen beans.", icon: "☕" },
  { to: "/freezer", title: "Freezer Tracking", description: "Log freeze cycles and true resting age.", icon: "❄️" },
  { to: "/recipes", title: "Recipes", description: "Prototype and refine your brew recipes.", icon: "🧪" },
];
</script>

<template>
  <div>
    <h1 class="text-3xl font-semibold text-espresso">Welcome back{{ user?.email ? `, ${user.email}` : "" }}</h1>
    <p class="mt-2 text-stone-600">What would you like to work on?</p>

    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      <NuxtLink
        v-for="section in sections"
        :key="section.to"
        :to="section.to"
        class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-espresso"
      >
        <div class="text-2xl">{{ section.icon }}</div>
        <h2 class="mt-2 font-semibold text-espresso">{{ section.title }}</h2>
        <p class="mt-1 text-sm text-stone-500">{{ section.description }}</p>
      </NuxtLink>
    </div>
  </div>
</template>
