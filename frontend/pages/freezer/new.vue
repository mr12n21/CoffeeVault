<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const router = useRouter();
const { createFreezerCycle } = useFreezerCycles();
const { listBeans } = useBeans();

const { data: beans } = await useAsyncData("beans-for-freezer-new", () => listBeans());

const bean = ref("");
const frozenAt = ref(new Date().toISOString().slice(0, 10));
const notes = ref("");
const error = ref("");
const loading = ref(false);

async function onSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await createFreezerCycle({
      bean: bean.value,
      frozen_at: frozenAt.value,
      notes: notes.value || undefined,
    });
    await router.push("/freezer");
  } catch (e) {
    error.value = "Failed to log freezer cycle.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg">
    <h1 class="text-2xl font-semibold text-espresso">Log Freeze</h1>

    <form class="mt-6 space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm" @submit.prevent="onSubmit">
      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Bean *</label>
        <select v-model="bean" required class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso">
          <option value="" disabled>Select a bean</option>
          <option v-for="b in beans" :key="b.id" :value="b.id">{{ b.name }} ({{ b.roaster }})</option>
        </select>
        <p v-if="beans && beans.length === 0" class="text-xs text-stone-500">
          No beans yet — <NuxtLink to="/beans/new" class="underline">add one first</NuxtLink>.
        </p>
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Frozen at *</label>
        <input v-model="frozenAt" type="date" required class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Notes</label>
        <input v-model="notes" class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="flex gap-3">
        <button type="submit" :disabled="loading" class="rounded-md bg-espresso px-4 py-2 font-medium text-crema hover:opacity-90 disabled:opacity-50">
          {{ loading ? "Saving..." : "Save" }}
        </button>
        <NuxtLink to="/freezer" class="rounded-md border border-stone-300 px-4 py-2 font-medium text-stone-600">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>
