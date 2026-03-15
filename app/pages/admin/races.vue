<script setup lang="ts">
definePageMeta({ middleware: "admin" });

const { data } = await useFetch("/api/admin/races");
const items = computed(() => (data.value?.items ?? []).filter((item) => item.type === "snapshot"));
</script>

<template>
  <div class="space-y-4">
    <div v-for="item in items" :key="item.lobbyId" class="panel p-5">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ item.verseReference }}</h2>
        <span class="text-xs uppercase tracking-[0.2em] text-[var(--color-copy-dim)]">{{ item.status }}</span>
      </div>
      <p class="mt-3 text-sm text-[var(--color-copy-dim)]">{{ item.players.length }} / {{ item.totalChars }} chars</p>
    </div>
  </div>
</template>
