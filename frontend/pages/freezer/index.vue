<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { listFreezerCycles, updateFreezerCycle, deleteFreezerCycle } = useFreezerCycles();
const { listBeans } = useBeans();

const { data: cycles, refresh, pending, error } = await useAsyncData("freezer-cycles", () => listFreezerCycles());
const { data: beans } = await useAsyncData("beans-for-freezer", () => listBeans());

const beanName = (beanId: string) => beans.value?.find((b) => b.id === beanId)?.name ?? beanId;

async function markThawed(id: string) {
  await updateFreezerCycle(id, { thawed_at: new Date().toISOString() });
  await refresh();
}

async function onDelete(id: string) {
  if (!confirm("Delete this freezer cycle?")) return;
  await deleteFreezerCycle(id);
  await refresh();
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString() : "—";
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-espresso">Freezer Tracking</h1>
      <NuxtLink to="/freezer/new" class="rounded-md bg-espresso px-4 py-2 text-sm font-medium text-crema hover:opacity-90">
        + Log freeze
      </NuxtLink>
    </div>

    <p v-if="pending" class="mt-6 text-stone-500">Loading...</p>
    <p v-else-if="error" class="mt-6 text-red-600">Failed to load freezer cycles.</p>
    <p v-else-if="!cycles?.length" class="mt-6 text-stone-500">No freezer cycles logged yet.</p>

    <div v-else class="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-stone-200 text-stone-500">
          <tr>
            <th class="px-4 py-3 font-medium">Bean</th>
            <th class="px-4 py-3 font-medium">Frozen at</th>
            <th class="px-4 py-3 font-medium">Thawed at</th>
            <th class="px-4 py-3 font-medium">Notes</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cycle in cycles" :key="cycle.id" class="border-b border-stone-100 last:border-0">
            <td class="px-4 py-3">{{ beanName(cycle.bean) }}</td>
            <td class="px-4 py-3">{{ formatDate(cycle.frozen_at) }}</td>
            <td class="px-4 py-3">
              <span v-if="cycle.thawed_at">{{ formatDate(cycle.thawed_at) }}</span>
              <button v-else class="text-espresso underline" @click="markThawed(cycle.id)">Mark thawed</button>
            </td>
            <td class="px-4 py-3 text-stone-500">{{ cycle.notes || "—" }}</td>
            <td class="px-4 py-3 text-right">
              <button class="text-red-600 underline" @click="onDelete(cycle.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
