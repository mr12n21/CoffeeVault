<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { user } = useAuth();
const { t } = useI18n();

const sections = computed(() => [
  { to: "/beans", index: "01", title: t("dashboard.beansTitle"), description: t("dashboard.beansDesc") },
  { to: "/freezer", index: "02", title: t("dashboard.freezerTitle"), description: t("dashboard.freezerDesc") },
  { to: "/recipes", index: "03", title: t("dashboard.recipesTitle"), description: t("dashboard.recipesDesc") },
  { to: "/calendar", index: "04", title: t("dashboard.calendarTitle"), description: t("dashboard.calendarDesc") },
]);
</script>

<template>
  <div>
    <h1 class="page-title">{{ t("dashboard.welcomeBack") }}{{ user?.email ? `, ${user.email}` : "" }}</h1>
    <p class="mt-2 text-stone-400">{{ t("dashboard.prompt") }}</p>

    <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <NuxtLink
        v-for="section in sections"
        :key="section.to"
        :to="section.to"
        class="group card transition hover:border-crema/30 hover:bg-surface-hover"
      >
        <span class="text-xs font-medium tracking-widest text-stone-500">{{ section.index }}</span>
        <h2 class="mt-2 font-semibold text-crema">{{ section.title }}</h2>
        <p class="mt-1 text-sm text-stone-400">{{ section.description }}</p>
        <span class="mt-4 inline-block text-sm text-stone-500 transition group-hover:translate-x-0.5 group-hover:text-crema">→</span>
      </NuxtLink>
    </div>
  </div>
</template>
