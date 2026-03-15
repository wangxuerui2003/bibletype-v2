<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const { data, refresh } = await useFetch("/api/profile");
const form = reactive({
  name: data.value?.user.name ?? "",
  image: data.value?.user.image ?? "",
  bio: data.value?.profile?.bio ?? "",
});
const avatarInput = ref<HTMLInputElement | null>(null);
const avatarFile = ref<File | null>(null);
const uploading = ref(false);
const avatarPreviewUrl = ref("");
const avatarLoadFailed = ref(false);

const avatarPreview = computed(() => {
  if (avatarPreviewUrl.value) {
    return avatarPreviewUrl.value;
  }

  if (avatarLoadFailed.value) {
    return "";
  }

  return form.image;
});

const initials = computed(() =>
  (form.name || "BibleType")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "BT",
);

async function save() {
  const result = await $fetch("/api/profile", {
    method: "PATCH",
    body: form,
  });

  form.name = result.user?.name ?? form.name;
  form.image = result.user?.image ?? form.image;
  form.bio = result.profile?.bio ?? form.bio;
  avatarLoadFailed.value = false;
  await refresh();
}

async function uploadAvatar() {
  const selectedFile = avatarFile.value ?? avatarInput.value?.files?.[0] ?? null;

  if (!selectedFile) {
    return;
  }

  uploading.value = true;

  const body = new FormData();
  body.append("avatar", selectedFile);

  const result = await $fetch<{ image: string }>("/api/profile/avatar", {
    method: "POST",
    body,
  });

  form.image = result.image;
  avatarPreviewUrl.value = result.image;
  avatarLoadFailed.value = false;
  avatarFile.value = null;
  uploading.value = false;
}

function handleAvatarSelection(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;

  avatarFile.value = file;

  if (avatarPreviewUrl.value.startsWith("blob:")) {
    URL.revokeObjectURL(avatarPreviewUrl.value);
  }

  avatarPreviewUrl.value = file ? URL.createObjectURL(file) : "";
}

onBeforeUnmount(() => {
  if (avatarPreviewUrl.value.startsWith("blob:")) {
    URL.revokeObjectURL(avatarPreviewUrl.value);
  }
});
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <section class="panel p-8">
      <h1 class="text-3xl font-semibold">Settings</h1>
      <div class="mt-6 space-y-4">
        <div class="flex flex-col gap-5 rounded-[28px] border border-white/8 bg-white/4 p-5 sm:flex-row sm:items-center">
          <div class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/6">
            <img
              v-if="avatarPreview"
              :src="avatarPreview"
              alt="Avatar preview"
              class="h-full w-full object-cover"
              @error="avatarLoadFailed = true"
            />
            <span v-else class="text-2xl font-semibold text-[var(--color-copy-dim)]">{{ initials }}</span>
          </div>
          <div class="flex-1 space-y-3">
            <div class="text-sm font-semibold">Profile photo</div>
            <p class="text-sm text-[var(--color-copy-dim)]">
              Upload a JPG, PNG, WebP, or GIF. The uploaded image is used automatically across your profile.
            </p>
            <div class="space-y-2">
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                class="block w-full text-sm text-[var(--color-copy-dim)] file:mr-4 file:rounded-2xl file:border file:border-white/10 file:bg-transparent file:px-4 file:py-2 file:text-sm file:text-[var(--color-copy)]"
                @change="handleAvatarSelection"
              />
              <span class="block text-sm text-[var(--color-copy-dim)]">{{ avatarFile?.name ?? "No file selected" }}</span>
            </div>
            <button class="rounded-2xl border border-white/10 px-4 py-2 text-sm" :disabled="uploading" @click="uploadAvatar">
              {{ uploading ? "Uploading..." : "Upload avatar" }}
            </button>
          </div>
        </div>
        <input v-model="form.name" class="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3" placeholder="Display name" />
        <textarea
          v-model="form.bio"
          class="min-h-32 w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
          placeholder="Bio"
        />
        <button class="rounded-2xl bg-[var(--color-accent)] px-4 py-3 font-semibold text-black" @click="save">Save changes</button>
      </div>
    </section>
  </div>
</template>
