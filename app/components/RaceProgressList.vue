<script setup lang="ts">
defineProps<{
  totalChars: number;
  players: Array<{
    userId: string;
    name: string;
    ready: boolean;
    connected: boolean;
    completedChars: number;
    placement?: number;
  }>;
}>();
</script>

<template>
  <div class="panel px-5 py-4">
    <div class="mono mb-4 text-xs uppercase tracking-[0.24em] text-[var(--color-copy-dim)]">
      live progress
    </div>

    <div class="space-y-3">
      <div v-for="player in players" :key="player.userId" class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span>{{ player.name }}</span>
          <span class="text-[var(--color-copy-dim)]">
            {{ player.placement ? `#${player.placement}` : `${Math.round((player.completedChars / Math.max(totalChars, 1)) * 100)}%` }}
          </span>
        </div>
        <div class="h-2 rounded-full bg-white/5">
          <div
            class="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
            :style="{ width: `${Math.min((player.completedChars / Math.max(totalChars, 1)) * 100, 100)}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
