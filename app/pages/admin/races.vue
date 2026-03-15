<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const { data } = await useFetch("/api/admin/races");
const items = computed(() => (data.value?.items ?? []).filter((item) => item.type === "snapshot"));
</script>

<template>
  <div class="space-y-6">
    <section>
      <p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Races</p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Lobby snapshots</h1>
      <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
        Review multiplayer state at a glance, including verse payload and current player counts.
      </p>
    </section>

    <section class="space-y-4">
      <article
        v-for="item in items"
        :key="item.lobbyId"
        class="rounded-[30px] border border-slate-200 bg-white px-6 py-6 shadow-sm"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg font-semibold text-slate-950">{{ item.verseReference }}</h2>
          <span class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{{ item.status }}</span>
        </div>
        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <div class="rounded-[22px] bg-slate-50 px-4 py-4">
            <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Players</div>
            <div class="mt-2 text-2xl font-semibold text-slate-950">{{ item.players.length }}</div>
          </div>
          <div class="rounded-[22px] bg-slate-50 px-4 py-4">
            <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Verse chars</div>
            <div class="mt-2 text-2xl font-semibold text-slate-950">{{ item.totalChars }}</div>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>
