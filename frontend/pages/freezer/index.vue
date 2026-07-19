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
      <h1 class="page-title">Freezer Tracking</h1>
      <NuxtLink to="/freezer/new" class="btn-primary">Log freeze</NuxtLink>
    </div>

    <p v-if="pending" class="mt-6 text-stone-500">Loading...</p>
    <p v-else-if="error" class="mt-6 text-red-600">Failed to load freezer cycles.</p>
    <p v-else-if="!cycles?.length" class="mt-6 text-stone-500">No freezer cycles logged yet.</p>

    <template v-else>
      <!-- Mobile: card list -->
      <div class="mt-6 divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white shadow-sm sm:hidden">
        <div v-for="cycle in cycles" :key="cycle.id" class="p-4">
          <div class="flex items-center gap-3">
            <span
              v-if="cycle.vial_number"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-stone-800 to-espresso text-xs font-semibold text-crema"
            >
              {{ cycle.vial_number }}
            </span>
            <div class="min-w-0">
              <p class="truncate font-medium text-stone-900">{{ beanName(cycle.bean) }}</p>
              <p class="text-xs text-stone-500">
                {{ formatDate(cycle.frozen_at) }}<span v-if="cycle.weight_grams"> · {{ cycle.weight_grams }} g</span>
              </p>
            </div>
          </div>

          <p v-if="cycle.notes" class="mt-2 text-sm text-stone-500">{{ cycle.notes }}</p>

          <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span v-if="cycle.thawed_at" class="text-stone-500">Thawed {{ formatDate(cycle.thawed_at) }}</span>
            <button v-else class="link" @click="markThawed(cycle.id)">Mark thawed</button>
            <NuxtLink :to="`/freezer/${cycle.id}`" class="link">Edit</NuxtLink>
            <button class="btn-danger-link" @click="onDelete(cycle.id)">Delete</button>
          </div>
        </div>
      </div>

      <!-- Desktop: table -->
      <div class="mt-6 hidden overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm sm:block">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-stone-200 text-stone-500">
            <tr>
              <th class="px-4 py-3 font-medium">Vial</th>
              <th class="px-4 py-3 font-medium">Bean</th>
              <th class="px-4 py-3 font-medium">Weight</th>
              <th class="px-4 py-3 font-medium">Frozen at</th>
              <th class="px-4 py-3 font-medium">Thawed at</th>
              <th class="px-4 py-3 font-medium">Notes</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cycle in cycles" :key="cycle.id" class="border-b border-stone-100 last:border-0">
              <td class="px-4 py-3">
                <span
                  v-if="cycle.vial_number"
                  class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-stone-800 to-espresso text-xs font-semibold text-crema"
                >
                  {{ cycle.vial_number }}
                </span>
                <span v-else class="text-stone-300">—</span>
              </td>
              <td class="px-4 py-3">{{ beanName(cycle.bean) }}</td>
              <td class="px-4 py-3">{{ cycle.weight_grams ? `${cycle.weight_grams} g` : "—" }}</td>
              <td class="px-4 py-3">{{ formatDate(cycle.frozen_at) }}</td>
              <td class="px-4 py-3">
                <span v-if="cycle.thawed_at">{{ formatDate(cycle.thawed_at) }}</span>
                <button v-else class="link" @click="markThawed(cycle.id)">Mark thawed</button>
              </td>
              <td class="px-4 py-3 text-stone-500">{{ cycle.notes || "—" }}</td>
              <td class="px-4 py-3 text-right">
                <NuxtLink :to="`/freezer/${cycle.id}`" class="link mr-3">Edit</NuxtLink>
                <button class="btn-danger-link" @click="onDelete(cycle.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
