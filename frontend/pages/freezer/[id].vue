<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const route = useRoute();
const router = useRouter();
const { getFreezerCycle, updateFreezerCycle, deleteFreezerCycle } = useFreezerCycles();
const { listBeans } = useBeans();
const { t } = useI18n();

const id = route.params.id as string;
const { data: cycle, error } = await useAsyncData(`freezer-cycle-${id}`, () => getFreezerCycle(id));
const { data: beans } = await useAsyncData("beans-for-freezer-edit", () => listBeans());

const beanName = computed(() => beans.value?.find((b) => b.id === cycle.value?.bean)?.name ?? cycle.value?.bean);

const frozenAt = ref(cycle.value?.frozen_at?.slice(0, 10) ?? "");
const thawedAt = ref(cycle.value?.thawed_at?.slice(0, 10) ?? "");
const vialNumber = ref(cycle.value?.vial_number ?? "");
const weightGrams = ref<number | null>(cycle.value?.weight_grams ?? null);
const notes = ref(cycle.value?.notes ?? "");
const formError = ref("");
const loading = ref(false);

async function onSubmit() {
  formError.value = "";
  loading.value = true;
  try {
    await updateFreezerCycle(id, {
      frozen_at: frozenAt.value || undefined,
      thawed_at: thawedAt.value || undefined,
      vial_number: vialNumber.value || undefined,
      weight_grams: weightGrams.value ?? undefined,
      notes: notes.value || undefined,
    });
    await router.push("/freezer");
  } catch (e) {
    formError.value = t("freezer.form.saveError");
  } finally {
    loading.value = false;
  }
}

async function onDelete() {
  if (!confirm(t("freezer.detail.confirmDelete"))) return;
  await deleteFreezerCycle(id);
  await router.push("/freezer");
}
</script>

<template>
  <div class="mx-auto max-w-lg">
    <p v-if="error" class="text-red-400">{{ t("freezer.detail.notFound") }}</p>
    <template v-else-if="cycle">
      <div class="flex items-center justify-between gap-3">
        <h1 class="page-title">{{ t("freezer.detail.title") }}</h1>
        <button class="btn-danger-link shrink-0" @click="onDelete">{{ t("freezer.index.delete") }}</button>
      </div>
      <p class="mt-1 text-sm text-stone-500">{{ beanName }}</p>

      <form class="card mt-6 space-y-4" @submit.prevent="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="field-label">{{ t("freezer.form.vial") }}</label>
            <input v-model="vialNumber" pattern="\d{2}" maxlength="2" class="field-input" />
          </div>
          <div class="space-y-1">
            <label class="field-label">{{ t("freezer.form.weight") }}</label>
            <input v-model.number="weightGrams" type="number" min="1" max="5000" class="field-input" />
          </div>
        </div>

        <div class="space-y-1">
          <label class="field-label">{{ t("freezer.form.frozenAt") }}</label>
          <input v-model="frozenAt" type="date" class="field-input" />
        </div>

        <div class="space-y-1">
          <label class="field-label">{{ t("freezer.form.thawedAt") }}</label>
          <input v-model="thawedAt" type="date" class="field-input" />
        </div>

        <div class="space-y-1">
          <label class="field-label">{{ t("freezer.form.notes") }}</label>
          <input v-model="notes" class="field-input" />
        </div>

        <p v-if="formError" class="text-sm text-red-400">{{ formError }}</p>

        <div class="flex flex-wrap gap-3">
          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? t("freezer.form.saving") : t("freezer.form.saveChanges") }}
          </button>
          <NuxtLink to="/freezer" class="btn-secondary">{{ t("freezer.form.cancel") }}</NuxtLink>
        </div>
      </form>
    </template>
  </div>
</template>
