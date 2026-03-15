<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const router = useRouter();
const targetPlayers = ref(2);
const quickStatus = ref("");

async function quickMatch() {
  const result = await $fetch("/api/race/quick-match", {
    method: "POST",
    body: { targetPlayers: targetPlayers.value },
  });

  if ("matched" in result && result.matched && result.lobby) {
    await router.push(`/race/${result.lobby.id}`);
    return;
  }

  quickStatus.value = "Queued. Ask another player to join with the same target size.";
}

async function createPrivate() {
  const result = await $fetch("/api/race/private", {
    method: "POST",
    body: { targetPlayers: targetPlayers.value },
  });

  await router.push(`/race/${result.lobby.id}`);
}
</script>

<template>
  <div class="mx-auto max-w-4xl grid gap-6 md:grid-cols-2">
    <section class="panel p-8">
      <p class="mono text-xs uppercase tracking-[0.24em] text-[var(--color-copy-dim)]">quick match</p>
      <h1 class="mt-3 text-3xl font-semibold">Find live opponents</h1>
      <select v-model="targetPlayers" class="mt-6 w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
        <option :value="2">2 players</option>
        <option :value="3">3 players</option>
        <option :value="4">4 players</option>
      </select>
      <button class="mt-4 rounded-2xl bg-[var(--color-accent)] px-4 py-3 font-semibold text-black" @click="quickMatch">Queue for match</button>
      <p v-if="quickStatus" class="mt-3 text-sm text-[var(--color-copy-dim)]">{{ quickStatus }}</p>
    </section>

    <section class="panel p-8">
      <p class="mono text-xs uppercase tracking-[0.24em] text-[var(--color-copy-dim)]">private room</p>
      <h2 class="mt-3 text-3xl font-semibold">Race with friends</h2>
      <p class="mt-4 text-sm leading-7 text-[var(--color-copy-dim)]">
        Create an invite room, share the room code, and start once everyone is ready.
      </p>
      <button class="mt-6 rounded-2xl border border-white/10 px-4 py-3" @click="createPrivate">Create private room</button>
    </section>
  </div>
</template>
