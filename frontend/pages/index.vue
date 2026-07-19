<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { user } = useAuth();

const sections = [
  { to: "/beans", index: "01", title: "Coffee Beans", description: "Your vault of fresh and frozen beans." },
  { to: "/freezer", index: "02", title: "Freezer Tracking", description: "Log freeze cycles and true resting age." },
  { to: "/recipes", index: "03", title: "Recipes", description: "Prototype, refine, and brew your recipes." },
];
</script>

<template>
  <div>
    <h1 class="page-title">Welcome back{{ user?.email ? `, ${user.email}` : "" }}</h1>
    <p class="mt-2 text-stone-500">What would you like to work on?</p>

    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      <NuxtLink
        v-for="section in sections"
        :key="section.to"
        :to="section.to"
        class="group card transition hover:border-espresso/30 hover:shadow-md"
      >
        <span class="text-xs font-medium tracking-widest text-stone-400">{{ section.index }}</span>
        <h2 class="mt-2 font-semibold text-stone-900">{{ section.title }}</h2>
        <p class="mt-1 text-sm text-stone-500">{{ section.description }}</p>
        <span class="mt-4 inline-block text-sm text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-espresso">→</span>
      </NuxtLink>
    </div>
  </div>
</template>
