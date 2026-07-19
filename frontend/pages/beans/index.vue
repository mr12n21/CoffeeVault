<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { listBeans, deleteBean } = useBeans();
const { data: beans, refresh, pending, error } = await useAsyncData("beans", () => listBeans());

async function onDelete(id: string) {
  if (!confirm("Delete this bean?")) return;
  await deleteBean(id);
  await refresh();
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-espresso">Coffee Beans</h1>
      <NuxtLink to="/beans/new" class="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-crema hover:opacity-90">
        + Add bean
      </NuxtLink>
    </div>

    <p v-if="pending" class="mt-6 text-stone-500">Loading...</p>
    <p v-else-if="error" class="mt-6 text-red-600">Failed to load beans.</p>
    <p v-else-if="!beans?.length" class="mt-6 text-stone-500">No beans yet. Add your first one.</p>

    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2">
      <div v-for="bean in beans" :key="bean.id" class="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-semibold text-espresso">{{ bean.name }}</h2>
            <p class="text-sm text-stone-500">{{ bean.roaster }} · {{ bean.origin_country }}</p>
          </div>
          <span v-if="bean.roast_level" class="shrink-0 rounded-full bg-crema px-2 py-0.5 text-xs font-medium text-espresso">
            {{ bean.roast_level }}
          </span>
        </div>

        <div v-if="bean.tasting_notes?.length" class="mt-3 flex flex-wrap gap-1">
          <span v-for="note in bean.tasting_notes" :key="note" class="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
            {{ note }}
          </span>
        </div>

        <div class="mt-4 flex gap-3 text-sm">
          <NuxtLink :to="`/beans/${bean.id}`" class="font-medium text-espresso underline">Edit</NuxtLink>
          <button class="text-red-600 underline" @click="onDelete(bean.id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>
