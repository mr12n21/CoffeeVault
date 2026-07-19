<script setup lang="ts">
import type { CoffeeBean } from "~/composables/types";
import type { Recipe, RecipeInput } from "~/composables/types";

const props = defineProps<{
  initial?: Partial<Recipe>;
  submitLabel: string;
  handleSubmit: (payload: Partial<RecipeInput>) => Promise<void>;
}>();

const { listBeans } = useBeans();
const { data: beans } = await useAsyncData<CoffeeBean[]>("beans-for-recipe-form", () => listBeans());

const form = reactive({
  name: props.initial?.name ?? "",
  bean: props.initial?.bean ?? "",
  dripper: props.initial?.dripper ?? "",
  grind_setting: props.initial?.grind_setting ?? "",
  water_temp_profile: props.initial?.water_temp_profile ?? "",
  filter_type: props.initial?.filter_type ?? "",
  brew_steps: formatStepsToText(props.initial?.brew_steps ?? []),
});

const error = ref("");
const loading = ref(false);

async function onFormSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await props.handleSubmit({
      name: form.name,
      bean: form.bean || undefined,
      dripper: form.dripper || undefined,
      grind_setting: form.grind_setting || undefined,
      water_temp_profile: form.water_temp_profile || undefined,
      filter_type: form.filter_type || undefined,
      brew_steps: parseStepsFromText(form.brew_steps),
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
        <label class="field-label">Bean</label>
        <select v-model="form.bean" class="field-input">
          <option value="">None</option>
          <option v-for="b in beans" :key="b.id" :value="b.id">{{ b.name }} ({{ b.roaster }})</option>
        </select>
      </div>
      <div class="space-y-1">
        <label class="field-label">Dripper</label>
        <input v-model="form.dripper" placeholder="Orea V4, Mazelab Solo + HiFlux..." class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">Grind setting</label>
        <input v-model="form.grind_setting" placeholder="1Zpresso ZP6 @ 3.2" class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">Water temp profile</label>
        <input v-model="form.water_temp_profile" placeholder="95°C bloom, drop to 86°C" class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">Filter type</label>
        <input v-model="form.filter_type" placeholder="Sibarist flat, wave..." class="field-input" />
      </div>
    </div>

    <div class="space-y-1">
      <label class="field-label">Brew steps (one per line)</label>
      <p class="text-xs text-stone-500">
        Optionally start a line with <code>MM:SS</code> to drive the brew-mode timer — this is also the format an AI can
        generate directly.
      </p>
      <textarea
        v-model="form.brew_steps"
        rows="6"
        placeholder="00:00 Bloom with 40g water, swirl&#10;00:45 Pour to 150g&#10;01:30 Pour to 250g&#10;02:30 Drawdown complete"
        class="field-input font-mono text-sm"
      />
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="flex flex-wrap gap-3">
      <button type="submit" :disabled="loading" class="btn-primary">
        {{ loading ? "Saving..." : submitLabel }}
      </button>
      <NuxtLink to="/recipes" class="btn-secondary">Cancel</NuxtLink>
    </div>
  </form>
</template>
