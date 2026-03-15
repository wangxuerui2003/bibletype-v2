<script setup lang="ts">
definePageMeta({ middleware: "admin" });

const { data } = await useFetch("/api/admin/feedback");
</script>

<template>
  <div class="space-y-4">
    <div v-for="item in data?.items ?? []" :key="item.id" class="panel p-5">
      <div class="flex items-center justify-between">
        <span class="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em]">{{ item.type }}</span>
        <span class="text-xs text-[var(--color-copy-dim)]">{{ item.status }}</span>
      </div>
      <p class="mt-4 text-sm leading-7">{{ item.content }}</p>
    </div>
  </div>
</template>
