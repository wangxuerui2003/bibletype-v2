<script setup lang="ts">
definePageMeta({ middleware: "admin" });

const { data } = await useFetch("/api/admin/users");
</script>

<template>
  <div class="space-y-4">
    <div v-for="item in data?.users ?? []" :key="item.id" class="panel p-5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">{{ item.name }}</h2>
          <p class="text-sm text-[var(--color-copy-dim)]">{{ item.email }}</p>
        </div>
        <div class="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em]">
          {{ item.role }}
        </div>
      </div>
    </div>
  </div>
</template>
