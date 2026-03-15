<script setup lang="ts">
definePageMeta({ middleware: "admin" });

const { data } = await useFetch("/api/admin/places");
</script>

<template>
  <div class="space-y-4">
    <div v-for="item in data?.items ?? []" :key="item.id" class="panel p-5">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ item.name }}</h2>
        <span class="text-xs text-[var(--color-copy-dim)]">{{ item.placeType }}</span>
      </div>
    </div>
  </div>
</template>
