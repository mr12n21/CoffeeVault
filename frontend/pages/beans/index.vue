<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { listBeans, updateBean, deleteBean } = useBeans();

const showArchived = ref(false);
const {
  data: beans,
  refresh,
  pending,
  error,
} = await useAsyncData("beans", () => listBeans({ archived: showArchived.value }), { watch: [showArchived] });

async function onArchive(id: string, archived: boolean) {
  await updateBean(id, { archived });
  await refresh();
}

async function onDelete(id: string) {
  if (!confirm("Delete this bean? This can't be undone.")) return;
  await deleteBean(id);
  await refresh();
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="page-title">Coffee Beans</h1>
      <div class="flex flex-wrap gap-2">
        <NuxtLink to="/beans/ocr-import" class="btn-outline">Scan a photo</NuxtLink>
        <NuxtLink to="/beans/import" class="btn-outline">Import from Kofio.cz</NuxtLink>
        <NuxtLink to="/beans/new" class="btn-primary">Add bean</NuxtLink>
      </div>
    </div>

    <div class="mt-5 flex gap-4 border-b border-stone-200 text-sm">
      <button
        type="button"
        class="-mb-px border-b-2 px-1 pb-2"
        :class="!showArchived ? 'border-espresso font-semibold text-stone-900' : 'border-transparent text-stone-500'"
        @click="showArchived = false"
      >
        Active
      </button>
      <button
        type="button"
        class="-mb-px border-b-2 px-1 pb-2"
        :class="showArchived ? 'border-espresso font-semibold text-stone-900' : 'border-transparent text-stone-500'"
        @click="showArchived = true"
      >
        Archived
      </button>
    </div>

    <p v-if="pending" class="mt-6 text-stone-500">Loading...</p>
    <p v-else-if="error" class="mt-6 text-red-600">Failed to load beans.</p>
    <p v-else-if="!beans?.length" class="mt-6 text-stone-500">
      {{ showArchived ? "No archived beans." : "No beans yet. Add your first one." }}
    </p>

    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2">
      <div v-for="bean in beans" :key="bean.id" class="card">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-semibold text-stone-900">{{ bean.name }}</h2>
            <p class="text-sm text-stone-500">{{ bean.roaster }} · {{ bean.origin_country }}</p>
          </div>
          <span v-if="bean.roast_level" class="shrink-0 rounded-full border border-stone-300 bg-stone-50 px-2.5 py-0.5 text-xs font-medium text-stone-600">
            {{ bean.roast_level }}
          </span>
        </div>

        <div v-if="bean.tasting_notes?.length" class="mt-3 flex flex-wrap gap-1">
          <span v-for="note in bean.tasting_notes" :key="note" class="tag-pill">{{ note }}</span>
        </div>

        <div class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <NuxtLink :to="`/beans/${bean.id}`" class="link">Edit</NuxtLink>
          <button v-if="!bean.archived" class="link-muted" @click="onArchive(bean.id, true)">Archive</button>
          <button v-else class="link-muted" @click="onArchive(bean.id, false)">Restore</button>
          <button class="btn-danger-link" @click="onDelete(bean.id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>
