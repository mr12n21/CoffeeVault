<script setup lang="ts">
import type { CoffeeBean, FreezerCycle } from "~/composables/types";

definePageMeta({ middleware: "auth" });

const { listBeans } = useBeans();
const { listFreezerCycles } = useFreezerCycles();

const { data: activeBeans } = await useAsyncData("cal-beans-active", () => listBeans({ archived: false }));
const { data: archivedBeans } = await useAsyncData("cal-beans-archived", () => listBeans({ archived: true }));
const { data: cycles } = await useAsyncData("cal-cycles", () => listFreezerCycles());

const allBeans = computed<CoffeeBean[]>(() => [...(activeBeans.value ?? []), ...(archivedBeans.value ?? [])]);
const allCycles = computed<FreezerCycle[]>(() => cycles.value ?? []);

interface DayEvents {
  roasts: CoffeeBean[];
  frozen: FreezerCycle[];
  thawed: FreezerCycle[];
}

const eventsByDate = computed(() => {
  const map = new Map<string, DayEvents>();
  const ensure = (key: string): DayEvents => {
    let e = map.get(key);
    if (!e) {
      e = { roasts: [], frozen: [], thawed: [] };
      map.set(key, e);
    }
    return e;
  };

  for (const bean of allBeans.value) {
    if (bean.roast_date) ensure(dateKey(new Date(bean.roast_date))).roasts.push(bean);
  }
  for (const cycle of allCycles.value) {
    ensure(dateKey(new Date(cycle.frozen_at))).frozen.push(cycle);
    if (cycle.thawed_at) ensure(dateKey(new Date(cycle.thawed_at))).thawed.push(cycle);
  }
  return map;
});

const today = new Date();
const viewYear = ref(today.getFullYear());
const viewMonth = ref(today.getMonth());

const weeks = computed(() => buildMonthGrid(viewYear.value, viewMonth.value));
const monthLabel = computed(() => new Date(viewYear.value, viewMonth.value, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" }));
const todayKey = dateKey(today);

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value--;
  } else {
    viewMonth.value--;
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value++;
  } else {
    viewMonth.value++;
  }
}

function goToday() {
  viewYear.value = today.getFullYear();
  viewMonth.value = today.getMonth();
}

const beanStatuses = computed(() =>
  (activeBeans.value ?? [])
    .map((bean) => ({ bean, status: computeRoastStatus(bean, allCycles.value) }))
    .filter((entry): entry is { bean: CoffeeBean; status: NonNullable<ReturnType<typeof computeRoastStatus>> } => entry.status !== null)
    .sort((a, b) => a.status.trueAgeDays - b.status.trueAgeDays),
);

const statusStyles: Record<string, string> = {
  peak: "text-crema",
  resting: "text-stone-400",
  declining: "text-amber-300",
  past_peak: "text-red-400",
  frozen: "text-stone-500",
};

function eventTitle(events: DayEvents): string {
  const parts: string[] = [];
  if (events.roasts.length) parts.push(`Roasted: ${events.roasts.map((b) => b.name).join(", ")}`);
  if (events.frozen.length) parts.push(`Frozen: ${events.frozen.length} vial(s)`);
  if (events.thawed.length) parts.push(`Thawed: ${events.thawed.length} vial(s)`);
  return parts.join("\n");
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="page-title">Calendar</h1>
      <div class="flex items-center gap-3">
        <button class="btn-secondary px-3 py-1.5 text-xs" @click="prevMonth">←</button>
        <button class="link text-sm" @click="goToday">{{ monthLabel }}</button>
        <button class="btn-secondary px-3 py-1.5 text-xs" @click="nextMonth">→</button>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-4 text-xs text-stone-400">
      <span class="flex items-center gap-1.5"><span class="flex h-4 w-4 items-center justify-center rounded-full bg-crema text-[9px] font-bold text-espresso">R</span>Roasted</span>
      <span class="flex items-center gap-1.5"><span class="flex h-4 w-4 items-center justify-center rounded-full border border-white/30 text-[9px] font-bold text-stone-200">F</span>Frozen</span>
      <span class="flex items-center gap-1.5"><span class="flex h-4 w-4 items-center justify-center rounded-full border border-white/15 text-[9px] font-bold text-stone-500">T</span>Thawed</span>
    </div>

    <div class="card mt-4 overflow-x-auto">
      <div class="grid min-w-[560px] grid-cols-7 gap-1 text-center text-xs text-stone-500">
        <div v-for="d in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="d" class="pb-2 font-medium">{{ d }}</div>
      </div>
      <div class="grid min-w-[560px] grid-cols-7 gap-1">
        <template v-for="week in weeks" :key="week[0].toISOString()">
          <div
            v-for="day in week"
            :key="day.toISOString()"
            class="min-h-[4.5rem] rounded-md border border-white/5 p-1.5"
            :class="[
              day.getMonth() === viewMonth ? 'bg-white/[0.02]' : 'opacity-40',
              dateKey(day) === todayKey ? 'ring-1 ring-crema/50' : '',
            ]"
            :title="eventsByDate.get(dateKey(day)) ? eventTitle(eventsByDate.get(dateKey(day))!) : ''"
          >
            <p class="text-xs text-stone-500">{{ day.getDate() }}</p>
            <div v-if="eventsByDate.get(dateKey(day))" class="mt-1 flex flex-wrap gap-0.5">
              <span
                v-if="eventsByDate.get(dateKey(day))!.roasts.length"
                class="flex h-4 w-4 items-center justify-center rounded-full bg-crema text-[9px] font-bold text-espresso"
              >
                R
              </span>
              <span
                v-if="eventsByDate.get(dateKey(day))!.frozen.length"
                class="flex h-4 w-4 items-center justify-center rounded-full border border-white/30 text-[9px] font-bold text-stone-200"
              >
                F
              </span>
              <span
                v-if="eventsByDate.get(dateKey(day))!.thawed.length"
                class="flex h-4 w-4 items-center justify-center rounded-full border border-white/15 text-[9px] font-bold text-stone-500"
              >
                T
              </span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-sm font-medium text-stone-300">Coffee status</h2>
      <p class="mt-1 text-xs text-stone-500">
        True age = days since roast, minus time spent frozen. Peak window is a rule-of-thumb estimate (7–21 days), not a
        hard rule — trust your taste buds too.
      </p>

      <p v-if="!beanStatuses.length" class="mt-4 text-sm text-stone-500">No roast dates logged yet.</p>

      <div v-else class="mt-4 divide-y divide-white/5 rounded-xl border border-white/10 bg-surface">
        <div v-for="entry in beanStatuses" :key="entry.bean.id" class="flex items-center justify-between gap-3 p-4">
          <div class="min-w-0">
            <NuxtLink :to="`/beans/${entry.bean.id}`" class="truncate font-medium text-crema hover:underline">{{ entry.bean.name }}</NuxtLink>
            <p class="truncate text-xs text-stone-500">{{ entry.bean.roaster }}</p>
          </div>
          <span class="shrink-0 text-sm font-medium" :class="statusStyles[entry.status.kind]">{{ entry.status.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
