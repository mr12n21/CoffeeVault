<script setup lang="ts">
import type { CoffeeBean, CoffeeBeanInput } from "~/composables/types";

const props = defineProps<{
  initial?: Partial<CoffeeBean>;
  submitLabel: string;
  handleSubmit: (payload: Partial<CoffeeBeanInput>) => Promise<void>;
}>();

const { t } = useI18n();

const form = reactive({
  name: props.initial?.name ?? "",
  roaster: props.initial?.roaster ?? "",
  origin_country: props.initial?.origin_country ?? "",
  variety: props.initial?.variety ?? "",
  process: props.initial?.process ?? "",
  roast_date: props.initial?.roast_date?.slice(0, 10) ?? "",
  purchase_date: props.initial?.purchase_date?.slice(0, 10) ?? "",
  roast_level: props.initial?.roast_level ?? "",
  tasting_notes: props.initial?.tasting_notes?.join(", ") ?? "",
  recommended_methods: props.initial?.recommended_methods?.join(", ") ?? "",
  notes: props.initial?.notes ?? "",
});

const error = ref("");
const loading = ref(false);

function toList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function onFormSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await props.handleSubmit({
      name: form.name,
      roaster: form.roaster,
      origin_country: form.origin_country,
      variety: form.variety || undefined,
      process: form.process || undefined,
      roast_date: form.roast_date || undefined,
      purchase_date: form.purchase_date || undefined,
      roast_level: form.roast_level || undefined,
      tasting_notes: toList(form.tasting_notes),
      recommended_methods: toList(form.recommended_methods),
      notes: form.notes || undefined,
    });
  } catch (e) {
    error.value = t("beans.form.error");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form class="card space-y-4" @submit.prevent="onFormSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1">
        <label class="field-label">{{ t("beans.form.name") }}</label>
        <input v-model="form.name" required class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">{{ t("beans.form.roaster") }}</label>
        <input v-model="form.roaster" required class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">{{ t("beans.form.origin") }}</label>
        <input v-model="form.origin_country" required class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">{{ t("beans.form.roastLevel") }}</label>
        <input v-model="form.roast_level" :placeholder="t('beans.form.roastLevelPlaceholder')" class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">{{ t("beans.form.variety") }}</label>
        <input v-model="form.variety" :placeholder="t('beans.form.varietyPlaceholder')" class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">{{ t("beans.form.process") }}</label>
        <input v-model="form.process" :placeholder="t('beans.form.processPlaceholder')" class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">{{ t("beans.form.roastDate") }}</label>
        <input v-model="form.roast_date" type="date" class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">{{ t("beans.form.purchaseDate") }}</label>
        <input v-model="form.purchase_date" type="date" class="field-input" />
      </div>
    </div>

    <div class="space-y-1">
      <label class="field-label">{{ t("beans.form.tastingNotes") }}</label>
      <input v-model="form.tasting_notes" :placeholder="t('beans.form.tastingNotesPlaceholder')" class="field-input" />
    </div>

    <div class="space-y-1">
      <label class="field-label">{{ t("beans.form.methods") }}</label>
      <input v-model="form.recommended_methods" :placeholder="t('beans.form.methodsPlaceholder')" class="field-input" />
    </div>

    <div class="space-y-1">
      <label class="field-label">{{ t("beans.form.notes") }}</label>
      <textarea v-model="form.notes" rows="3" :placeholder="t('beans.form.notesPlaceholder')" class="field-input" />
    </div>

    <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

    <div class="flex flex-wrap gap-3">
      <button type="submit" :disabled="loading" class="btn-primary">
        {{ loading ? t("beans.form.saving") : submitLabel }}
      </button>
      <NuxtLink to="/beans" class="btn-secondary">{{ t("beans.form.cancel") }}</NuxtLink>
    </div>
  </form>
</template>
