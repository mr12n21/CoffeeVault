<script setup lang="ts">
import type { CoffeeBean } from "~/composables/types";

definePageMeta({ middleware: "auth" });

const { recognizePhotos } = useOcr();
const { createBean } = useBeans();
const router = useRouter();
const { t } = useI18n();

const MAX_PHOTOS = 3;

const photos = ref<File[]>([]);
const previews = computed(() => photos.value.map((f) => URL.createObjectURL(f)));

const extractedText = ref("");
const parsed = ref<Partial<CoffeeBean> | null>(null);
const parseCount = ref(0);
const error = ref("");
const scanning = ref(false);

function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const newFiles = Array.from(input.files ?? []);
  photos.value = [...photos.value, ...newFiles].slice(0, MAX_PHOTOS);
  input.value = "";
}

function removePhoto(index: number) {
  photos.value = photos.value.filter((_, i) => i !== index);
}

async function onScan() {
  if (!photos.value.length) return;
  error.value = "";
  parsed.value = null;
  scanning.value = true;
  try {
    const result = await recognizePhotos(photos.value);
    extractedText.value = result.text;
    parsed.value = { ...result.guess, notes: result.text };
    parseCount.value++;
  } catch (e) {
    error.value = t("beans.ocr.error");
  } finally {
    scanning.value = false;
  }
}

async function handleSubmit(payload: Parameters<ReturnType<typeof useBeans>["createBean"]>[0]) {
  await createBean(payload);
  await router.push("/beans");
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <h1 class="page-title">{{ t("beans.ocr.title") }}</h1>
    <p class="mt-1 text-sm text-stone-400">{{ t("beans.ocr.desc", { max: MAX_PHOTOS }) }}</p>

    <div class="mt-6 card">
      <div v-if="photos.length" class="mb-4 grid grid-cols-3 gap-3">
        <div v-for="(src, i) in previews" :key="src" class="relative aspect-square overflow-hidden rounded-md border border-white/10">
          <img :src="src" class="h-full w-full object-cover" alt="Selected photo" />
          <button
            type="button"
            class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-stone-300 shadow-sm transition hover:text-red-400"
            @click="removePhoto(i)"
          >
            ×
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <label v-if="photos.length < MAX_PHOTOS" class="btn-outline cursor-pointer">
          {{ t("beans.ocr.addPhoto") }} ({{ photos.length }}/{{ MAX_PHOTOS }})
          <input type="file" accept="image/*" capture="environment" class="hidden" @change="onFilesSelected" />
        </label>

        <button type="button" :disabled="!photos.length || scanning" class="btn-primary" @click="onScan">
          {{ scanning ? t("beans.ocr.scanning") : t("beans.ocr.scan", { count: photos.length || "", plural: photos.length === 1 ? "" : "s" }) }}
        </button>
      </div>

      <p v-if="error" class="mt-3 text-sm text-red-400">{{ error }}</p>

      <div v-if="extractedText" class="mt-4">
        <p class="field-label mb-1">{{ t("beans.ocr.extractedText") }}</p>
        <pre class="whitespace-pre-wrap rounded-md bg-white/5 p-3 text-sm text-stone-300">{{ extractedText }}</pre>
      </div>
    </div>

    <div v-if="parsed" class="mt-6">
      <p class="mb-3 text-sm text-stone-400">{{ t("beans.ocr.guessNote") }}</p>
      <BeanForm :key="parseCount" :initial="parsed" :submit-label="t('beans.form.save')" :handle-submit="handleSubmit" />
    </div>
  </div>
</template>
