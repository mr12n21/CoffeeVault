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
  brew_steps: props.initial?.brew_steps?.join("\n") ?? "",
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
      brew_steps: form.brew_steps
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
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
        <label class="text-sm font-medium text-stone-700">Bean</label>
        <select v-model="form.bean" class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso">
          <option value="">None</option>
          <option v-for="b in beans" :key="b.id" :value="b.id">{{ b.name }} ({{ b.roaster }})</option>
        </select>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Dripper</label>
        <input v-model="form.dripper" placeholder="Orea V4, Mazelab Solo + HiFlux..." class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Grind setting</label>
        <input v-model="form.grind_setting" placeholder="1Zpresso ZP6 @ 3.2" class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Water temp profile</label>
        <input v-model="form.water_temp_profile" placeholder="95°C bloom, drop to 86°C" class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-stone-700">Filter type</label>
        <input v-model="form.filter_type" placeholder="Sibarist flat, wave..." class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso" />
      </div>
    </div>

    <div class="space-y-1">
      <label class="text-sm font-medium text-stone-700">Brew steps (one per line)</label>
      <textarea
        v-model="form.brew_steps"
        rows="5"
        placeholder="Bloom 40g @95C for 45s&#10;Main pour to 250g @86C&#10;Drawdown"
        class="w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-espresso"
      />
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="flex gap-3">
      <button type="submit" :disabled="loading" class="rounded-md bg-espresso px-4 py-2 font-medium text-crema hover:opacity-90 disabled:opacity-50">
        {{ loading ? "Saving..." : submitLabel }}
      </button>
      <NuxtLink to="/recipes" class="rounded-md border border-stone-300 px-4 py-2 font-medium text-stone-600">Cancel</NuxtLink>
    </div>
  </form>
</template>
