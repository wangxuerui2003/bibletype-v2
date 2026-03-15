<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const type = ref<"feedback" | "bug" | "suggestion">("feedback");
const content = ref("");
const { data, refresh } = await useFetch("/api/feedback");

async function submit() {
  await $fetch("/api/feedback", {
    method: "POST",
    body: {
      type: type.value,
      content: content.value,
    },
  });

  content.value = "";
  await refresh();
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
    <section class="panel p-8">
      <h1 class="text-3xl font-semibold">Feedback center</h1>
      <div class="mt-6 space-y-4">
        <select v-model="type" class="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
          <option value="feedback">Feedback</option>
          <option value="bug">Bug</option>
          <option value="suggestion">Suggestion</option>
        </select>
        <textarea
          v-model="content"
          class="min-h-40 w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
          placeholder="What should improve?"
        />
        <button class="rounded-2xl bg-[var(--color-accent)] px-4 py-3 font-semibold text-black" @click="submit">Submit</button>
      </div>
    </section>

    <section class="space-y-4">
      <div v-for="item in data?.items ?? []" :key="item.id" class="panel p-6">
        <div class="flex items-center justify-between">
          <span class="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--color-copy-dim)]">{{ item.type }}</span>
          <span class="text-xs text-[var(--color-copy-dim)]">{{ item.status }}</span>
        </div>
        <p class="mt-4 text-sm leading-7 text-[var(--color-copy)]">{{ item.content }}</p>
      </div>
    </section>
  </div>
</template>
