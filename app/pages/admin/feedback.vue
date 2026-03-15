<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const { data, refresh } = await useFetch("/api/admin/feedback");

async function setStatus(id: string, status: "open" | "reviewing" | "done" | "dismissed") {
  await $fetch(`/api/admin/feedback/${id}/status`, {
    method: "PATCH",
    body: { status },
  });

  await refresh();
}
</script>

<template>
  <div class="space-y-6">
    <section>
      <p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Feedback</p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Moderation queue</h1>
      <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
        Work through open reports and mark each item with a clear moderation status.
      </p>
    </section>

    <section class="space-y-4">
      <article
        v-for="item in data?.items ?? []"
        :key="item.id"
        class="rounded-[30px] border border-slate-200 bg-white px-6 py-6 shadow-sm"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
            {{ item.type }}
          </span>
          <span class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{{ item.status }}</span>
        </div>
        <p class="mt-4 text-sm leading-7 text-slate-700">{{ item.content }}</p>
        <div class="mt-5 flex flex-wrap gap-2">
          <button class="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600" @click="setStatus(item.id, 'reviewing')">Reviewing</button>
          <button class="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600" @click="setStatus(item.id, 'done')">Done</button>
          <button class="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600" @click="setStatus(item.id, 'dismissed')">Dismiss</button>
        </div>
      </article>
    </section>
  </div>
</template>
