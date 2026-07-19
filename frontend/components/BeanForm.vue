<script setup lang="ts">
import type { CoffeeBean, CoffeeBeanInput } from "~/composables/types";

const props = defineProps<{
  initial?: Partial<CoffeeBean>;
  submitLabel: string;
  handleSubmit: (payload: Partial<CoffeeBeanInput>) => Promise<void>;
}>();

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
    error.value = "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form class="card space-y-4" @submit.prevent="onFormSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1">
        <label class="field-label">Name *</label>
        <input v-model="form.name" required class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">Roaster *</label>
        <input v-model="form.roaster" required class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">Origin country *</label>
        <input v-model="form.origin_country" required class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">Roast level</label>
        <input v-model="form.roast_level" placeholder="Light, Medium, Dark..." class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">Variety</label>
        <input v-model="form.variety" placeholder="Castillo, SL28 Peaberry..." class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">Process</label>
        <input v-model="form.process" placeholder="Washed, Anaerobic..." class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">Roast date</label>
        <input v-model="form.roast_date" type="date" class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">Purchase date</label>
        <input v-model="form.purchase_date" type="date" class="field-input" />
      </div>
    </div>

    <div class="space-y-1">
      <label class="field-label">Tasting notes (comma separated)</label>
      <input v-model="form.tasting_notes" placeholder="cherry, cacao, jasmine" class="field-input" />
    </div>

    <div class="space-y-1">
      <label class="field-label">Recommended methods (comma separated)</label>
      <input v-model="form.recommended_methods" placeholder="V60, AeroPress" class="field-input" />
    </div>

    <div class="space-y-1">
      <label class="field-label">Notes</label>
      <textarea v-model="form.notes" rows="3" placeholder="Anything else worth remembering about this bean" class="field-input" />
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="flex flex-wrap gap-3">
      <button type="submit" :disabled="loading" class="btn-primary">
        {{ loading ? "Saving..." : submitLabel }}
      </button>
      <NuxtLink to="/beans" class="btn-secondary">Cancel</NuxtLink>
    </div>
  </form>
</template>
