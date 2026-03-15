<script setup lang="ts">
defineProps<{
  metrics: Array<{
    label: string;
    value: string | number;
  }>;
}>();
</script>

<template>
  <div class="grid gap-3 md:grid-cols-4">
    <div v-for="metric in metrics" :key="metric.label" class="panel px-4 py-3">
      <div class="mono text-xs uppercase tracking-[0.24em] text-[var(--color-copy-dim)]">
        {{ metric.label }}
      </div>
      <div class="mt-2 text-2xl font-semibold">{{ metric.value }}</div>
    </div>
  </div>
</template>
