<script setup lang="ts">
import { useTypingSession } from "../../composables/useTypingSession";

definePageMeta({
  middleware: "auth",
});

const { data, refresh } = await useFetch("/api/typing/current");
const typing = useTypingSession(computed(() => data.value?.verse.textNormalized ?? ""));

const metrics = computed(() => [
  { label: "reference", value: data.value?.verse.reference ?? "--" },
  { label: "wpm", value: typing.wpm.value.toFixed(1) },
  { label: "accuracy", value: `${typing.accuracy.value.toFixed(1)}%` },
  { label: "chars", value: `${typing.completedChars.value}/${typing.totalChars.value}` },
]);

async function handleKeydown(event: KeyboardEvent) {
  if (!data.value?.verse) {
    return;
  }

  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }

  if (event.key === "Tab") {
    return;
  }

  event.preventDefault();
  typing.pushKey(event.key);

  if (typing.isComplete.value) {
    await $fetch("/api/typing/complete", {
      method: "POST",
      body: {
        verseId: data.value.verse.id,
        elapsedMs: Math.max(typing.elapsedMs.value, 1),
        accuracy: typing.accuracy.value,
        wpm: typing.wpm.value,
        typedChars: typing.typed.value.length,
        correctChars: typing.completedChars.value,
      },
    });

    typing.reset();
    await refresh();
  }
}

onMounted(() => window.addEventListener("keydown", handleKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", handleKeydown));
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
    <section class="space-y-6">
      <MetricStrip :metrics="metrics" />
      <TypingStage :text="data?.verse.textNormalized ?? ''" :typed="typing.typed.value" />
      <div class="panel px-6 py-4 text-sm text-[var(--color-copy-dim)]">
        Press keys directly on the keyboard. When the verse is completed, progress and stats are saved automatically.
      </div>
    </section>

    <section class="space-y-6">
      <MapPanel :places="data?.places ?? []" />
      <div class="panel px-5 py-5">
        <p class="mono text-xs uppercase tracking-[0.24em] text-[var(--color-copy-dim)]">next moves</p>
        <div class="mt-4 flex flex-wrap gap-3">
          <NuxtLink to="/race" class="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-black">
            Start a race
          </NuxtLink>
          <NuxtLink to="/feedback" class="rounded-full border border-white/10 px-4 py-2 text-sm">Leave feedback</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
