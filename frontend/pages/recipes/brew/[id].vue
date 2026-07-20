<script setup lang="ts">
definePageMeta({ middleware: "auth", layout: false });

const route = useRoute();
const { getRecipe } = useRecipes();
const { t } = useI18n();

const id = route.params.id as string;
const { data: recipe, error } = await useAsyncData(`recipe-brew-${id}`, () => getRecipe(id));

const steps = computed(() => recipe.value?.brew_steps ?? []);

const elapsed = ref(0);
const running = ref(false);
const started = ref(false);
const currentIndex = ref(0);
let timer: ReturnType<typeof setInterval> | undefined;

// Only advances forward, one step at a time, and only past the *next* step's own
// threshold — never recomputes the index from scratch. That way manual navigation
// (available only before starting — see template) sticks instead of being overwritten.
watch(elapsed, (val) => {
  if (!running.value) return;
  while (true) {
    const upcoming = steps.value[currentIndex.value + 1];
    if (!upcoming || upcoming.time_seconds == null || val < upcoming.time_seconds) break;
    currentIndex.value++;
  }
});

const totalDuration = computed(() => steps.value[steps.value.length - 1]?.time_seconds ?? 0);
const overallProgress = computed(() => (totalDuration.value ? Math.min(100, (elapsed.value / totalDuration.value) * 100) : 0));

const stepProgress = computed(() => {
  const current = steps.value[currentIndex.value];
  const next = steps.value[currentIndex.value + 1];
  if (!current || current.time_seconds == null || !next || next.time_seconds == null) return null;
  const span = next.time_seconds - current.time_seconds;
  if (span <= 0) return null;
  return Math.max(0, Math.min(100, ((elapsed.value - current.time_seconds) / span) * 100));
});

function start() {
  if (running.value) return;
  running.value = true;
  started.value = true;
  timer = setInterval(() => {
    elapsed.value++;
  }, 1000);
}

function pause() {
  running.value = false;
  if (timer) clearInterval(timer);
}

function reset() {
  pause();
  elapsed.value = 0;
  currentIndex.value = 0;
  started.value = false;
}

function next() {
  if (currentIndex.value < steps.value.length - 1) currentIndex.value++;
}

function prev() {
  if (currentIndex.value > 0) currentIndex.value--;
}

function jumpTo(i: number) {
  if (!started.value) currentIndex.value = i;
}

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-stone-900 via-espresso to-black px-4 py-16 text-crema sm:py-10">
    <p v-if="error" class="text-red-400">{{ t("recipes.brew.notFound") }}</p>
    <template v-else-if="recipe">
      <NuxtLink to="/recipes" class="absolute left-4 top-4 text-sm text-crema/70 underline decoration-crema/30 underline-offset-2 hover:text-crema">
        {{ t("recipes.brew.back") }}
      </NuxtLink>

      <h1 class="text-center text-base font-medium text-crema/60 sm:text-lg">{{ recipe.name }}</h1>
      <p class="mt-2 font-mono text-4xl tabular-nums sm:text-5xl">{{ formatStepTime(elapsed) }}</p>

      <div v-if="totalDuration" class="mt-4 h-1 w-full max-w-md overflow-hidden rounded-full bg-white/10">
        <div class="h-full rounded-full bg-crema transition-[width] duration-700 ease-linear" :style="{ width: `${overallProgress}%` }" />
      </div>

      <div v-if="steps.length" class="mt-8 flex min-h-[9rem] w-full max-w-xl flex-col items-center px-2 text-center sm:mt-10">
        <p class="text-xs uppercase tracking-wide text-crema/50 sm:text-sm">
          {{ t("recipes.brew.step", { current: currentIndex + 1, total: steps.length }) }}
        </p>
        <Transition name="step" mode="out-in">
          <div :key="currentIndex">
            <p class="mt-2 text-2xl font-semibold sm:text-3xl">{{ steps[currentIndex].label }}</p>
            <p v-if="steps[currentIndex].water_to_g != null" class="mt-2 text-lg text-crema/70 sm:text-xl">{{ steps[currentIndex].water_to_g }} g</p>
          </div>
        </Transition>
        <div v-if="stepProgress != null" class="mt-4 h-0.5 w-40 overflow-hidden rounded-full bg-white/10">
          <div class="h-full rounded-full bg-crema/70 transition-[width] duration-700 ease-linear" :style="{ width: `${stepProgress}%` }" />
        </div>
      </div>
      <p v-else class="mt-10 text-crema/70">{{ t("recipes.brew.noSteps") }}</p>

      <div class="mt-8 flex flex-wrap justify-center gap-3 sm:mt-10">
        <button v-if="!started" class="rounded-md border border-crema/30 px-4 py-2 transition hover:border-crema/60" @click="prev">{{ t("recipes.brew.prev") }}</button>
        <button v-if="!running" class="rounded-md bg-crema px-6 py-2 font-medium text-espresso shadow-[0_0_0_0_rgba(250,249,247,0.4)] transition hover:bg-white hover:shadow-[0_0_0_6px_rgba(250,249,247,0.12)]" @click="start">
          {{ started ? t("recipes.brew.resume") : t("recipes.brew.start") }}
        </button>
        <button v-else class="rounded-md bg-crema px-6 py-2 font-medium text-espresso transition hover:bg-white" @click="pause">{{ t("recipes.brew.pause") }}</button>
        <button v-if="!started" class="rounded-md border border-crema/30 px-4 py-2 transition hover:border-crema/60" @click="next">{{ t("recipes.brew.next") }}</button>
        <button v-if="started" class="rounded-md border border-crema/30 px-4 py-2 text-sm transition hover:border-crema/60" @click="reset">{{ t("recipes.brew.reset") }}</button>
      </div>

      <ol class="mt-8 w-full max-w-md space-y-1 text-sm sm:mt-10">
        <li
          v-for="(step, i) in steps"
          :key="i"
          class="flex items-center justify-between gap-3 rounded px-2 py-1.5 transition-colors"
          :class="[
            i === currentIndex ? 'bg-crema/15 font-semibold' : i < currentIndex ? 'text-crema/40 line-through' : 'text-crema/70',
            !started ? 'cursor-pointer hover:bg-white/5' : '',
          ]"
          @click="jumpTo(i)"
        >
          <span class="truncate">{{ step.label }}</span>
          <span v-if="step.time_seconds != null" class="shrink-0 font-mono">{{ formatStepTime(step.time_seconds) }}</span>
        </li>
      </ol>
    </template>
  </div>
</template>

<style scoped>
.step-enter-active,
.step-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.step-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
