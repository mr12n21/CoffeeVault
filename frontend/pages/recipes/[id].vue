<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const route = useRoute();
const router = useRouter();
const { getRecipe, updateRecipe, deleteRecipe } = useRecipes();

const id = route.params.id as string;
const { data: recipe, error } = await useAsyncData(`recipe-${id}`, () => getRecipe(id));

async function handleSubmit(payload: Parameters<ReturnType<typeof useRecipes>["updateRecipe"]>[1]) {
  await updateRecipe(id, payload);
  await router.push("/recipes");
}

async function onDelete() {
  if (!confirm("Delete this recipe?")) return;
  await deleteRecipe(id);
  await router.push("/recipes");
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <p v-if="error" class="text-red-600">Recipe not found.</p>
    <template v-else-if="recipe">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-espresso">Edit {{ recipe.name }}</h1>
        <button class="text-sm text-red-600 underline" @click="onDelete">Delete</button>
      </div>
      <div class="mt-6">
        <RecipeForm :initial="recipe" submit-label="Save changes" :handle-submit="handleSubmit" />
      </div>
    </template>
  </div>
</template>
