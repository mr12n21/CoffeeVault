<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { listBeans, updateBean, deleteBean } = useBeans();
const { t } = useI18n();

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
  if (!confirm(t("beans.index.confirmDelete"))) return;
  await deleteBean(id);
  await refresh();
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="page-title">{{ t("beans.index.title") }}</h1>
      <div class="flex flex-wrap gap-2">
        <NuxtLink to="/beans/ocr-import" class="btn-outline">{{ t("beans.index.scanPhoto") }}</NuxtLink>
        <NuxtLink to="/beans/import" class="btn-outline">{{ t("beans.index.importKofio") }}</NuxtLink>
        <NuxtLink to="/beans/new" class="btn-primary">{{ t("beans.index.addBean") }}</NuxtLink>
      </div>
    </div>

    <div class="mt-5 flex gap-4 border-b border-white/10 text-sm">
      <button
        type="button"
        class="-mb-px border-b-2 px-1 pb-2"
        :class="!showArchived ? 'border-crema font-semibold text-crema' : 'border-transparent text-stone-500'"
        @click="showArchived = false"
      >
        {{ t("beans.index.active") }}
      </button>
      <button
        type="button"
        class="-mb-px border-b-2 px-1 pb-2"
        :class="showArchived ? 'border-crema font-semibold text-crema' : 'border-transparent text-stone-500'"
        @click="showArchived = true"
      >
        {{ t("beans.index.archived") }}
      </button>
    </div>

    <p v-if="pending" class="mt-6 text-stone-400">{{ t("beans.index.loading") }}</p>
    <p v-else-if="error" class="mt-6 text-red-400">{{ t("beans.index.failedLoad") }}</p>
    <p v-else-if="!beans?.length" class="mt-6 text-stone-400">
      {{ showArchived ? t("beans.index.emptyArchived") : t("beans.index.emptyActive") }}
    </p>

    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2">
      <div v-for="bean in beans" :key="bean.id" class="card">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-semibold text-crema">{{ bean.name }}</h2>
            <p class="text-sm text-stone-400">{{ bean.roaster }} · {{ bean.origin_country }}</p>
          </div>
          <span v-if="bean.roast_level" class="shrink-0 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-stone-300">
            {{ bean.roast_level }}
          </span>
        </div>

        <div v-if="bean.tasting_notes?.length" class="mt-3 flex flex-wrap gap-1">
          <span v-for="note in bean.tasting_notes" :key="note" class="tag-pill">{{ note }}</span>
        </div>

        <div class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <NuxtLink :to="`/beans/${bean.id}`" class="link">{{ t("beans.index.edit") }}</NuxtLink>
          <button v-if="!bean.archived" class="link-muted" @click="onArchive(bean.id, true)">{{ t("beans.index.archive") }}</button>
          <button v-else class="link-muted" @click="onArchive(bean.id, false)">{{ t("beans.index.restore") }}</button>
          <button class="btn-danger-link" @click="onDelete(bean.id)">{{ t("beans.index.delete") }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
