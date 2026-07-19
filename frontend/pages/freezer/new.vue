<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const router = useRouter();
const { createFreezerCycle, listFreezerCycles } = useFreezerCycles();
const { listBeans } = useBeans();

const { data: beans } = await useAsyncData("beans-for-freezer-new", () => listBeans());
const { data: existingCycles } = await useAsyncData("cycles-for-freezer-new", () => listFreezerCycles());

function nextVialNumber(): string {
  const used = (existingCycles.value ?? [])
    .map((c) => Number.parseInt(c.vial_number ?? "", 10))
    .filter((n) => !Number.isNaN(n));
  const next = used.length ? Math.max(...used) + 1 : 1;
  return String(next).padStart(2, "0");
}

const bean = ref("");
const frozenAt = ref(new Date().toISOString().slice(0, 10));
const vialNumber = ref(nextVialNumber());
const weightGrams = ref<number | null>(null);
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
      vial_number: vialNumber.value || undefined,
      weight_grams: weightGrams.value ?? undefined,
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
    <h1 class="page-title">Log Freeze</h1>

    <form class="card mt-6 space-y-4" @submit.prevent="onSubmit">
      <div class="space-y-1">
        <label class="field-label">Bean *</label>
        <select v-model="bean" required class="field-input">
          <option value="" disabled>Select a bean</option>
          <option v-for="b in beans" :key="b.id" :value="b.id">{{ b.name }} ({{ b.roaster }})</option>
        </select>
        <p v-if="beans && beans.length === 0" class="text-xs text-stone-500">
          No beans yet — <NuxtLink to="/beans/new" class="link">add one first</NuxtLink>.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="field-label">Vial #</label>
          <input v-model="vialNumber" pattern="\d{2}" maxlength="2" placeholder="01" class="field-input" />
        </div>
        <div class="space-y-1">
          <label class="field-label">Weight (g)</label>
          <input v-model.number="weightGrams" type="number" min="1" max="5000" placeholder="250" class="field-input" />
        </div>
      </div>

      <div class="space-y-1">
        <label class="field-label">Frozen at *</label>
        <input v-model="frozenAt" type="date" required class="field-input" />
      </div>

      <div class="space-y-1">
        <label class="field-label">Notes</label>
        <input v-model="notes" class="field-input" />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="flex flex-wrap gap-3">
        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? "Saving..." : "Save" }}
        </button>
        <NuxtLink to="/freezer" class="btn-secondary">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>
