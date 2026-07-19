<script setup lang="ts">
definePageMeta({ middleware: "auth", layout: false });

const route = useRoute();
const { getRecipe } = useRecipes();

const id = route.params.id as string;
const { data: recipe, error } = await useAsyncData(`recipe-brew-${id}`, () => getRecipe(id));

const steps = computed(() => recipe.value?.brew_steps ?? []);

const elapsed = ref(0);
const running = ref(false);
const currentIndex = ref(0);
let timer: ReturnType<typeof setInterval> | undefined;

// Only advances forward, one step at a time, and only past the *next* step's own
// threshold — never recomputes the index from scratch. That way a manual Next/Prev
// click sticks instead of being overwritten by the next timer tick.
watch(elapsed, (val) => {
  if (!running.value) return;
  while (true) {
    const upcoming = steps.value[currentIndex.value + 1];
    if (!upcoming || upcoming.time_seconds == null || val < upcoming.time_seconds) break;
    currentIndex.value++;
  }
});

function start() {
  if (running.value) return;
  running.value = true;
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
}

function next() {
  if (currentIndex.value < steps.value.length - 1) currentIndex.value++;
}

function prev() {
  if (currentIndex.value > 0) currentIndex.value--;
}

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-stone-900 via-espresso to-black px-4 py-16 text-crema sm:py-10">
    <p v-if="error" class="text-red-300">Recipe not found.</p>
    <template v-else-if="recipe">
      <NuxtLink to="/recipes" class="absolute left-4 top-4 text-sm text-crema/70 underline decoration-crema/30 underline-offset-2 hover:text-crema">
        ← Back
      </NuxtLink>

      <h1 class="text-center text-base font-medium text-crema/60 sm:text-lg">{{ recipe.name }}</h1>
      <p class="mt-2 font-mono text-4xl tabular-nums sm:text-5xl">{{ formatStepTime(elapsed) }}</p>

      <div v-if="steps.length" class="mt-8 max-w-xl px-2 text-center sm:mt-10">
        <p class="text-xs uppercase tracking-wide text-crema/50 sm:text-sm">Step {{ currentIndex + 1 }} / {{ steps.length }}</p>
        <p class="mt-2 text-2xl font-semibold sm:text-3xl">{{ steps[currentIndex].label }}</p>
        <p v-if="steps[currentIndex].water_to_g != null" class="mt-2 text-lg text-crema/70 sm:text-xl">{{ steps[currentIndex].water_to_g }} g</p>
      </div>
      <p v-else class="mt-10 text-crema/70">This recipe has no steps yet.</p>

      <div class="mt-8 flex flex-wrap justify-center gap-3 sm:mt-10">
        <button class="rounded-md border border-crema/30 px-4 py-2 transition hover:border-crema/60" @click="prev">Prev</button>
        <button v-if="!running" class="rounded-md bg-crema px-6 py-2 font-medium text-espresso transition hover:bg-white" @click="start">Start</button>
        <button v-else class="rounded-md bg-crema px-6 py-2 font-medium text-espresso transition hover:bg-white" @click="pause">Pause</button>
        <button class="rounded-md border border-crema/30 px-4 py-2 transition hover:border-crema/60" @click="next">Next</button>
        <button class="rounded-md border border-crema/30 px-4 py-2 text-sm transition hover:border-crema/60" @click="reset">Reset</button>
      </div>

      <ol class="mt-8 w-full max-w-md space-y-1 text-sm sm:mt-10">
        <li
          v-for="(step, i) in steps"
          :key="i"
          class="flex items-center justify-between gap-3 rounded px-2 py-1.5"
          :class="i === currentIndex ? 'bg-crema/15 font-semibold' : i < currentIndex ? 'text-crema/40 line-through' : 'text-crema/70'"
        >
          <span class="truncate">{{ step.label }}</span>
          <span v-if="step.time_seconds != null" class="shrink-0 font-mono">{{ formatStepTime(step.time_seconds) }}</span>
        </li>
      </ol>
    </template>
  </div>
</template>
