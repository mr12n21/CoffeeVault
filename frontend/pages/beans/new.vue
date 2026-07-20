<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { createBean } = useBeans();
const router = useRouter();
const { t } = useI18n();

async function handleSubmit(payload: Parameters<ReturnType<typeof useBeans>["createBean"]>[0]) {
  await createBean(payload);
  await router.push("/beans");
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="page-title">{{ t("beans.new.title") }}</h1>
      <NuxtLink to="/beans/import" class="link text-sm">{{ t("beans.new.importInstead") }}</NuxtLink>
    </div>
    <div class="mt-6">
      <BeanForm :submit-label="t('beans.form.save')" :handle-submit="handleSubmit" />
    </div>
  </div>
</template>
