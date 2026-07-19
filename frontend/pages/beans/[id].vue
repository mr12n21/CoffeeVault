<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const route = useRoute();
const router = useRouter();
const { getBean, updateBean, deleteBean } = useBeans();

const id = route.params.id as string;
const { data: bean, error } = await useAsyncData(`bean-${id}`, () => getBean(id));

async function handleSubmit(payload: Parameters<ReturnType<typeof useBeans>["updateBean"]>[1]) {
  await updateBean(id, payload);
  await router.push("/beans");
}

async function onDelete() {
  if (!confirm("Delete this bean?")) return;
  await deleteBean(id);
  await router.push("/beans");
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <p v-if="error" class="text-red-600">Bean not found.</p>
    <template v-else-if="bean">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-espresso">Edit {{ bean.name }}</h1>
        <button class="text-sm text-red-600 underline" @click="onDelete">Delete</button>
      </div>
      <div class="mt-6">
        <BeanForm :initial="bean" submit-label="Save changes" :handle-submit="handleSubmit" />
      </div>
    </template>
  </div>
</template>
