<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const route = useRoute();
const router = useRouter();
const { getRecipe, updateRecipe, deleteRecipe } = useRecipes();
const { t } = useI18n();

const id = route.params.id as string;
const { data: recipe, error } = await useAsyncData(`recipe-${id}`, () => getRecipe(id));

async function handleSubmit(payload: Parameters<ReturnType<typeof useRecipes>["updateRecipe"]>[1]) {
  await updateRecipe(id, payload);
  await router.push("/recipes");
}

async function onDelete() {
  if (!confirm(t("recipes.detail.confirmDelete"))) return;
  await deleteRecipe(id);
  await router.push("/recipes");
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <p v-if="error" class="text-red-400">{{ t("recipes.detail.notFound") }}</p>
    <template v-else-if="recipe">
      <div class="flex items-center justify-between gap-3">
        <h1 class="page-title truncate">{{ t("recipes.detail.editTitle", { name: recipe.name }) }}</h1>
        <button class="btn-danger-link shrink-0" @click="onDelete">{{ t("recipes.detail.delete") }}</button>
      </div>
      <div class="mt-6">
        <RecipeForm :initial="recipe" :submit-label="t('recipes.form.saveChanges')" :handle-submit="handleSubmit" />
      </div>
    </template>
  </div>
</template>
