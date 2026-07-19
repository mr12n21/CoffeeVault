<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { createRecipe } = useRecipes();
const router = useRouter();

async function handleSubmit(payload: Parameters<ReturnType<typeof useRecipes>["createRecipe"]>[0]) {
  await createRecipe(payload);
  await router.push("/recipes");
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <h1 class="text-2xl font-semibold text-espresso">New Recipe</h1>
    <div class="mt-6">
      <RecipeForm submit-label="Save recipe" :handle-submit="handleSubmit" />
    </div>
  </div>
</template>
