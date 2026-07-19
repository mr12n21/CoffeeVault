<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const route = useRoute();
const router = useRouter();
const { getBean, updateBean, deleteBean, uploadBeanPhoto, deleteBeanPhoto, photoUrl } = useBeans();

const id = route.params.id as string;
const { data: bean, error } = await useAsyncData(`bean-${id}`, () => getBean(id));

const uploading = ref(false);
const photoError = ref("");

async function handleSubmit(payload: Parameters<ReturnType<typeof useBeans>["updateBean"]>[1]) {
  await updateBean(id, payload);
  await router.push("/beans");
}

async function onDelete() {
  if (!confirm("Delete this bean?")) return;
  await deleteBean(id);
  await router.push("/beans");
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  photoError.value = "";
  uploading.value = true;
  try {
    bean.value = await uploadBeanPhoto(id, file);
  } catch (e) {
    photoError.value = "Failed to upload photo.";
  } finally {
    uploading.value = false;
    input.value = "";
  }
}

async function onDeletePhoto(filename: string) {
  if (!confirm("Remove this photo?")) return;
  bean.value = await deleteBeanPhoto(id, filename);
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <p v-if="error" class="text-red-600">Bean not found.</p>
    <template v-else-if="bean">
      <div class="flex items-center justify-between gap-3">
        <h1 class="page-title truncate">Edit {{ bean.name }}</h1>
        <button class="btn-danger-link shrink-0" @click="onDelete">Delete</button>
      </div>

      <div class="mt-6 card">
        <h2 class="field-label">Photos</h2>

        <div v-if="bean.photos.length" class="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          <div v-for="filename in bean.photos" :key="filename" class="group relative aspect-square overflow-hidden rounded-md border border-stone-200">
            <img :src="photoUrl(bean.id, filename)" class="h-full w-full object-cover" alt="Bean photo" />
            <button
              type="button"
              class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-stone-600 opacity-80 shadow-sm transition hover:text-red-700 sm:opacity-0 sm:group-hover:opacity-100"
              @click="onDeletePhoto(filename)"
            >
              ×
            </button>
          </div>
        </div>

        <label class="link mt-3 inline-block cursor-pointer text-sm">
          {{ uploading ? "Uploading..." : "+ Add photo" }}
          <input type="file" accept="image/*" capture="environment" class="hidden" :disabled="uploading" @change="onFileSelected" />
        </label>
        <p v-if="photoError" class="mt-1 text-sm text-red-600">{{ photoError }}</p>
      </div>

      <div class="mt-6">
        <BeanForm :initial="bean" submit-label="Save changes" :handle-submit="handleSubmit" />
      </div>
    </template>
  </div>
</template>
