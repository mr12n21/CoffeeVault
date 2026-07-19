<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { createBean } = useBeans();
const router = useRouter();

async function handleSubmit(payload: Parameters<ReturnType<typeof useBeans>["createBean"]>[0]) {
  await createBean(payload);
  await router.push("/beans");
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <h1 class="text-2xl font-semibold text-espresso">Add Coffee Bean</h1>
    <div class="mt-6">
      <BeanForm submit-label="Save bean" :handle-submit="handleSubmit" />
    </div>
  </div>
</template>
