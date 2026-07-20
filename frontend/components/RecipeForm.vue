<script setup lang="ts">
import type { CoffeeBean } from "~/composables/types";
import type { Recipe, RecipeInput } from "~/composables/types";

const props = defineProps<{
  initial?: Partial<Recipe>;
  submitLabel: string;
  handleSubmit: (payload: Partial<RecipeInput>) => Promise<void>;
}>();

const { listBeans } = useBeans();
const { t } = useI18n();
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
    error.value = t("recipes.form.error");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form class="card space-y-4" @submit.prevent="onFormSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1">
        <label class="field-label">{{ t("recipes.form.name") }}</label>
        <input v-model="form.name" required class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">{{ t("recipes.form.bean") }}</label>
        <select v-model="form.bean" class="field-input">
          <option value="">{{ t("recipes.form.none") }}</option>
          <option v-for="b in beans" :key="b.id" :value="b.id">{{ b.name }} ({{ b.roaster }})</option>
        </select>
      </div>
      <div class="space-y-1">
        <label class="field-label">{{ t("recipes.form.dripper") }}</label>
        <input v-model="form.dripper" :placeholder="t('recipes.form.dripperPlaceholder')" class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">{{ t("recipes.form.grindSetting") }}</label>
        <input v-model="form.grind_setting" :placeholder="t('recipes.form.grindPlaceholder')" class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">{{ t("recipes.form.waterTemp") }}</label>
        <input v-model="form.water_temp_profile" :placeholder="t('recipes.form.waterTempPlaceholder')" class="field-input" />
      </div>
      <div class="space-y-1">
        <label class="field-label">{{ t("recipes.form.filterType") }}</label>
        <input v-model="form.filter_type" :placeholder="t('recipes.form.filterPlaceholder')" class="field-input" />
      </div>
    </div>

    <div class="space-y-1">
      <label class="field-label">{{ t("recipes.form.steps") }}</label>
      <p class="text-xs text-stone-500">
        <i18n-t keypath="recipes.form.stepsHint" tag="span">
          <template #mmss><code>MM:SS</code></template>
        </i18n-t>
      </p>
      <textarea
        v-model="form.brew_steps"
        rows="6"
        placeholder="00:00 Bloom with 40g water, swirl&#10;00:45 Pour to 150g&#10;01:30 Pour to 250g&#10;02:30 Drawdown complete"
        class="field-input font-mono text-sm"
      />
    </div>

    <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

    <div class="flex flex-wrap gap-3">
      <button type="submit" :disabled="loading" class="btn-primary">
        {{ loading ? t("recipes.form.saving") : submitLabel }}
      </button>
      <NuxtLink to="/recipes" class="btn-secondary">{{ t("recipes.form.cancel") }}</NuxtLink>
    </div>
  </form>
</template>
