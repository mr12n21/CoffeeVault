<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { createRecipe } = useRecipes();
const router = useRouter();
const { t } = useI18n();

async function handleSubmit(payload: Parameters<ReturnType<typeof useRecipes>["createRecipe"]>[0]) {
  await createRecipe(payload);
  await router.push("/recipes");
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <h1 class="page-title">{{ t("recipes.new.title") }}</h1>
    <div class="mt-6">
      <RecipeForm :submit-label="t('recipes.form.save')" :handle-submit="handleSubmit" />
    </div>
  </div>
</template>
