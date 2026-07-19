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
    });
  } catch (e) {
    error.value = "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form class="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm" @submit.prevent="onFormSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Name *</label>
        <input v-model="form.name" required class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Roaster *</label>
        <input v-model="form.roaster" required class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Origin country *</label>
        <input v-model="form.origin_country" required class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Roast level</label>
        <input v-model="form.roast_level" placeholder="Light, Medium, Dark..." class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Variety</label>
        <input v-model="form.variety" placeholder="Castillo, SL28 Peaberry..." class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Process</label>
        <input v-model="form.process" placeholder="Washed, Anaerobic..." class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Roast date</label>
        <input v-model="form.roast_date" type="date" class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Purchase date</label>
        <input v-model="form.purchase_date" type="date" class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>
    </div>

    <div class="space-y-1">
      <label class="text-sm font-medium text-stone-700">Tasting notes (comma separated)</label>
      <input v-model="form.tasting_notes" placeholder="cherry, cacao, jasmine" class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
    </div>

    <div class="space-y-1">
      <label class="text-sm font-medium text-stone-700">Recommended methods (comma separated)</label>
      <input v-model="form.recommended_methods" placeholder="V60, AeroPress" class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="flex gap-3">
      <button type="submit" :disabled="loading" class="rounded-md bg-espresso px-4 py-2 font-medium text-crema hover:opacity-90 disabled:opacity-50">
        {{ loading ? "Saving..." : submitLabel }}
      </button>
      <NuxtLink to="/beans" class="rounded-md border border-stone-300 px-4 py-2 font-medium text-stone-600">Cancel</NuxtLink>
    </div>
  </form>
</template>
