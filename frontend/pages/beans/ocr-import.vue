<script setup lang="ts">
import type { CoffeeBean } from "~/composables/types";

definePageMeta({ middleware: "auth" });

const { recognizePhotos } = useOcr();
const { createBean } = useBeans();
const router = useRouter();

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
    error.value = "Couldn't scan these photos. Try clearer, well-lit shots of the bag.";
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
    <h1 class="page-title">Scan Bag Photos</h1>
    <p class="mt-1 text-sm text-stone-500">
      For beans that aren't on Kofio.cz. Add up to {{ MAX_PHOTOS }} photos (front, back, origin label...) — we'll OCR all
      of them and try to spot origin, process, roast level, and variety. Review everything below; OCR isn't perfect.
    </p>

    <div class="mt-6 card">
      <div v-if="photos.length" class="mb-4 grid grid-cols-3 gap-3">
        <div v-for="(src, i) in previews" :key="src" class="relative aspect-square overflow-hidden rounded-md border border-stone-200">
          <img :src="src" class="h-full w-full object-cover" alt="Selected photo" />
          <button
            type="button"
            class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-stone-600 shadow-sm transition hover:text-red-700"
            @click="removePhoto(i)"
          >
            ×
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <label v-if="photos.length < MAX_PHOTOS" class="btn-outline cursor-pointer">
          + Add photo ({{ photos.length }}/{{ MAX_PHOTOS }})
          <input type="file" accept="image/*" capture="environment" class="hidden" @change="onFilesSelected" />
        </label>

        <button type="button" :disabled="!photos.length || scanning" class="btn-primary" @click="onScan">
          {{ scanning ? "Scanning..." : `Scan ${photos.length || ""} photo${photos.length === 1 ? "" : "s"}` }}
        </button>
      </div>

      <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>

      <div v-if="extractedText" class="mt-4">
        <p class="field-label mb-1">Extracted text:</p>
        <pre class="whitespace-pre-wrap rounded-md bg-stone-50 p-3 text-sm text-stone-600">{{ extractedText }}</pre>
      </div>
    </div>

    <div v-if="parsed" class="mt-6">
      <p class="mb-3 text-sm text-stone-500">
        Fields we could guess are pre-filled below — double-check them (packaging varies a lot). The scanned text is kept
        in Notes for reference.
      </p>
      <BeanForm :key="parseCount" :initial="parsed" submit-label="Save bean" :handle-submit="handleSubmit" />
    </div>
  </div>
</template>
