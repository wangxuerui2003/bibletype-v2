<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const { data, refresh } = await useFetch("/api/profile");
const form = reactive({
  name: "",
  image: "",
});

watchEffect(() => {
  form.name = data.value?.user.name ?? "";
  form.image = data.value?.user.image ?? "";
});

async function save() {
  await $fetch("/api/profile", {
    method: "PATCH",
    body: form,
  });

  await refresh();
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <section class="panel p-8">
      <h1 class="text-3xl font-semibold">Settings</h1>
      <div class="mt-6 space-y-4">
        <input v-model="form.name" class="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3" placeholder="Display name" />
        <input v-model="form.image" class="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3" placeholder="Avatar image URL" />
        <button class="rounded-2xl bg-[var(--color-accent)] px-4 py-3 font-semibold text-black" @click="save">Save changes</button>
      </div>
    </section>
  </div>
</template>
