<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

import type { RaceBroadcast } from "../../../lib/race";

const route = useRoute();
const { data, refresh } = await useFetch<RaceBroadcast>(`/api/race/${route.params.id}`);
const typed = ref("");
let refreshInterval: ReturnType<typeof setInterval> | null = null;

const progress = computed(() => {
  const total = Math.max(data.value?.type === "snapshot" ? data.value.totalChars : 1, 1);
  let completed = 0;

  for (let index = 0; index < typed.value.length; index += 1) {
    completed += 1;
  }

  return {
    completed,
    total,
  };
});

async function setReady(ready: boolean) {
  await $fetch(`/api/race/${route.params.id}/ready`, {
    method: "POST",
    body: { ready },
  });
  await refresh();
}

async function handleKeydown(event: KeyboardEvent) {
  if (!data.value || data.value.type !== "snapshot" || data.value.status === "finished") {
    return;
  }

  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }

  event.preventDefault();

  if (event.key === "Backspace") {
    typed.value = typed.value.slice(0, -1);
  } else if (event.key.length === 1) {
    typed.value += event.key;
  }

  await $fetch(`/api/race/${route.params.id}/progress`, {
    method: "POST",
    body: {
      completedChars: progress.value.completed,
    },
  });

  await refresh();
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  refreshInterval = setInterval(() => refresh(), 1000);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
    <section class="space-y-6">
      <div class="panel px-6 py-5">
        <p class="mono text-xs uppercase tracking-[0.24em] text-[var(--color-copy-dim)]">race room</p>
        <h1 class="mt-3 text-3xl font-semibold">{{ data?.type === "snapshot" ? data.verseReference : "Loading..." }}</h1>
        <div class="mt-5 flex gap-3">
          <button class="rounded-full bg-[var(--color-accent)] px-4 py-2 text-black" @click="setReady(true)">Ready</button>
          <button class="rounded-full border border-white/10 px-4 py-2" @click="setReady(false)">Unready</button>
        </div>
      </div>

      <TypingStage :text="data?.type === 'snapshot' ? data.raceText : ''" :typed="typed" />
    </section>

    <section class="space-y-6">
      <RaceProgressList :total-chars="data?.type === 'snapshot' ? data.totalChars : 1" :players="data?.type === 'snapshot' ? data.players : []" />
      <div class="panel px-5 py-4 text-sm text-[var(--color-copy-dim)]">
        Room code: <span class="mono text-copy">{{ data?.type === "snapshot" ? data.lobbyId : route.params.id }}</span>
      </div>
    </section>
  </div>
</template>
