<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { listRecipes, deleteRecipe } = useRecipes();
const { data: recipes, refresh, pending, error } = await useAsyncData("recipes", () => listRecipes());

async function onDelete(id: string) {
  if (!confirm("Delete this recipe?")) return;
  await deleteRecipe(id);
  await refresh();
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-espresso">Recipes</h1>
      <NuxtLink to="/recipes/new" class="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-crema hover:opacity-90">
        + New recipe
      </NuxtLink>
    </div>

    <p v-if="pending" class="mt-6 text-stone-500">Loading...</p>
    <p v-else-if="error" class="mt-6 text-red-600">Failed to load recipes.</p>
    <p v-else-if="!recipes?.length" class="mt-6 text-stone-500">No recipes yet. Prototype your first one.</p>

    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2">
      <div v-for="recipe in recipes" :key="recipe.id" class="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 class="font-semibold text-espresso">{{ recipe.name }}</h2>
        <p class="text-sm text-stone-500">{{ recipe.dripper || "No dripper set" }}</p>

        <ol v-if="recipe.brew_steps?.length" class="mt-3 list-decimal space-y-1 pl-4 text-sm text-stone-600">
          <li v-for="(step, i) in recipe.brew_steps" :key="i">{{ step }}</li>
        </ol>

        <div class="mt-4 flex gap-3 text-sm">
          <NuxtLink :to="`/recipes/${recipe.id}`" class="font-medium text-espresso underline">Edit</NuxtLink>
          <button class="text-red-600 underline" @click="onDelete(recipe.id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>
