<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { listRecipes, deleteRecipe } = useRecipes();
const { t } = useI18n();
const { data: recipes, refresh, pending, error } = await useAsyncData("recipes", () => listRecipes());

async function onDelete(id: string) {
  if (!confirm(t("recipes.index.confirmDelete"))) return;
  await deleteRecipe(id);
  await refresh();
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="page-title">{{ t("recipes.index.title") }}</h1>
      <NuxtLink to="/recipes/new" class="btn-primary">{{ t("recipes.index.newRecipe") }}</NuxtLink>
    </div>

    <p v-if="pending" class="mt-6 text-stone-400">{{ t("recipes.index.loading") }}</p>
    <p v-else-if="error" class="mt-6 text-red-400">{{ t("recipes.index.failedLoad") }}</p>
    <p v-else-if="!recipes?.length" class="mt-6 text-stone-400">{{ t("recipes.index.empty") }}</p>

    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2">
      <div v-for="recipe in recipes" :key="recipe.id" class="card">
        <h2 class="font-semibold text-crema">{{ recipe.name }}</h2>
        <p class="text-sm text-stone-400">{{ recipe.dripper || t("recipes.index.noDripper") }}</p>

        <ol v-if="recipe.brew_steps?.length" class="mt-3 list-decimal space-y-1 pl-4 text-sm text-stone-300">
          <li v-for="(step, i) in recipe.brew_steps" :key="i">
            <span v-if="step.time_seconds != null" class="font-mono text-stone-400">{{ formatStepTime(step.time_seconds) }}</span>
            {{ step.label }}
          </li>
        </ol>

        <div class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <NuxtLink :to="`/recipes/brew/${recipe.id}`" class="link">{{ t("recipes.index.brew") }}</NuxtLink>
          <NuxtLink :to="`/recipes/${recipe.id}`" class="link">{{ t("recipes.index.edit") }}</NuxtLink>
          <button class="btn-danger-link" @click="onDelete(recipe.id)">{{ t("recipes.index.delete") }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
