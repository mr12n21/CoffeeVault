<script setup lang="ts">
import type { ParsedKofioBean } from "~/composables/types";

definePageMeta({ middleware: "auth" });

const { parseKofio } = useKofio();
const { createBean } = useBeans();
const router = useRouter();

const mode = ref<"url" | "html">("url");
const url = ref("");
const html = ref("");
const parsed = ref<ParsedKofioBean | null>(null);
const parseCount = ref(0);
const error = ref("");
const parsing = ref(false);

async function onParse() {
  error.value = "";
  parsed.value = null;
  parsing.value = true;
  try {
    parsed.value = await parseKofio(mode.value === "url" ? { url: url.value } : { html: html.value });
    parseCount.value++;
  } catch (e) {
    error.value = "Couldn't parse this page. Double-check the URL, or paste the page's HTML source instead.";
  } finally {
    parsing.value = false;
  }
}

async function handleSubmit(payload: Parameters<ReturnType<typeof useBeans>["createBean"]>[0]) {
  await createBean(payload);
  await router.push("/beans");
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <h1 class="page-title">Import from Kofio.cz</h1>
    <p class="mt-1 text-sm text-stone-500">Paste a product link and we'll pull out roaster, origin, process, tasting notes, and more.</p>
    <p class="mt-1 text-sm text-stone-500">
      Not on Kofio? <NuxtLink to="/beans/ocr-import" class="link">Scan a bag photo instead</NuxtLink>.
    </p>

    <div class="mt-6 card">
      <div class="flex gap-4 text-sm">
        <button type="button" :class="mode === 'url' ? 'font-semibold text-stone-900' : 'text-stone-500'" @click="mode = 'url'">
          From URL
        </button>
        <button type="button" :class="mode === 'html' ? 'font-semibold text-stone-900' : 'text-stone-500'" @click="mode = 'html'">
          Paste page HTML
        </button>
      </div>

      <form class="mt-4 space-y-3" @submit.prevent="onParse">
        <input v-if="mode === 'url'" v-model="url" type="url" required placeholder="https://www.kofio.cz/kava/..." class="field-input" />
        <textarea v-else v-model="html" required rows="6" placeholder="Paste the page's HTML source here" class="field-input" />

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <button type="submit" :disabled="parsing" class="btn-primary">
          {{ parsing ? "Parsing..." : "Fetch & Parse" }}
        </button>
      </form>
    </div>

    <div v-if="parsed" class="mt-6">
      <p class="mb-3 text-sm text-stone-500">Review and adjust before saving:</p>
      <BeanForm :key="parseCount" :initial="parsed" submit-label="Save bean" :handle-submit="handleSubmit" />
    </div>
  </div>
</template>
