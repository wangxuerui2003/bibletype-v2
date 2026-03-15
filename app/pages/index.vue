<script setup lang="ts">
import { useTypingSession } from "../../composables/useTypingSession";

definePageMeta({
  middleware: "auth",
});

const { data, refresh } = await useFetch("/api/typing/current");
const { data: profileData } = await useFetch("/api/profile");
const typing = useTypingSession(computed(() => data.value?.verse.textNormalized ?? ""));
const completing = ref(false);
const savingPreference = ref(false);
const completionSummary = ref<null | {
  reference: string;
  wpm: string;
  accuracy: string;
  elapsedMs: number;
}>(null);
const autoContinueAfterVerse = computed(
  () => profileData.value?.profile?.autoContinueAfterVerse ?? false,
);

const metrics = computed(() => [
  { label: "reference", value: data.value?.verse.reference ?? "--" },
  { label: "wpm", value: typing.wpm.value.toFixed(1) },
  { label: "accuracy", value: `${typing.accuracy.value.toFixed(1)}%` },
  { label: "chars", value: `${typing.completedChars.value}/${typing.totalChars.value}` },
]);

async function toggleAutoContinue() {
  if (savingPreference.value) {
    return;
  }

  savingPreference.value = true;

  const result = await $fetch("/api/profile/preferences", {
    method: "PATCH",
    body: {
      autoContinueAfterVerse: !autoContinueAfterVerse.value,
    },
  });

  if (profileData.value) {
    profileData.value = {
      ...profileData.value,
      profile: result.profile,
    };
  }

  savingPreference.value = false;
}

async function handleKeydown(event: KeyboardEvent) {
  if (!data.value?.verse) {
    return;
  }

  if (completionSummary.value) {
    if (event.key === "Enter") {
      event.preventDefault();
      dismissCompletionSummary();
    }
    return;
  }

  if (completing.value) {
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
    const snapshot = typing.snapshot();
    completing.value = true;
    if (!autoContinueAfterVerse.value) {
      completionSummary.value = {
        reference: data.value.verse.reference,
        wpm: snapshot.wpm.toFixed(1),
        accuracy: snapshot.accuracy.toFixed(1),
        elapsedMs: snapshot.elapsedMs,
      };
    }

    const nextPayload = await $fetch("/api/typing/complete", {
      method: "POST",
      body: {
        verseId: data.value.verse.id,
        elapsedMs: Math.max(snapshot.elapsedMs, 1),
        accuracy: snapshot.accuracy,
        wpm: snapshot.wpm,
        typedChars: typing.typed.value.length,
        correctChars: snapshot.correctChars,
      },
    });

    data.value = nextPayload;
    typing.reset();
    completing.value = false;
  }
}

onMounted(() => window.addEventListener("keydown", handleKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", handleKeydown));

function dismissCompletionSummary() {
  completionSummary.value = null;
}
</script>

<template>
  <div class="space-y-10">
    <div
      v-if="completionSummary"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
      @click.self="dismissCompletionSummary"
    >
      <div class="panel w-full max-w-xl px-8 py-8 text-center">
        <p class="mono text-xs uppercase tracking-[0.28em] text-[var(--color-copy-dim)]">verse complete</p>
        <h2 class="mt-4 text-3xl font-semibold">{{ completionSummary.reference }}</h2>
        <div class="mt-6 grid gap-3 md:grid-cols-3">
          <div class="rounded-3xl bg-white/5 px-4 py-4">
            <div class="mono text-xs uppercase tracking-[0.2em] text-[var(--color-copy-dim)]">wpm</div>
            <div class="mt-2 text-2xl font-semibold">{{ completionSummary.wpm }}</div>
          </div>
          <div class="rounded-3xl bg-white/5 px-4 py-4">
            <div class="mono text-xs uppercase tracking-[0.2em] text-[var(--color-copy-dim)]">accuracy</div>
            <div class="mt-2 text-2xl font-semibold">{{ completionSummary.accuracy }}%</div>
          </div>
          <div class="rounded-3xl bg-white/5 px-4 py-4">
            <div class="mono text-xs uppercase tracking-[0.2em] text-[var(--color-copy-dim)]">time</div>
            <div class="mt-2 text-2xl font-semibold">{{ Math.max(Math.round(completionSummary.elapsedMs / 1000), 1) }}s</div>
          </div>
        </div>
        <p class="mt-6 text-sm text-[var(--color-copy-dim)]">The next verse is already loaded behind this panel.</p>
        <button class="mt-6 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-black" @click="dismissCompletionSummary">
          Continue
        </button>
      </div>
    </div>

    <section class="space-y-6">
      <div class="mx-auto flex w-full max-w-[980px] justify-end">
        <button
          class="inline-flex items-center gap-3 rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm text-[var(--color-copy-dim)] transition-smooth hover:border-white/16 hover:text-[var(--color-copy)]"
          :disabled="savingPreference"
          @click="toggleAutoContinue"
        >
          <span class="mono text-[0.72rem] uppercase tracking-[0.2em]">auto continue</span>
          <span
            class="relative h-6 w-11 rounded-full transition-smooth"
            :class="autoContinueAfterVerse ? 'bg-[var(--color-accent)]' : 'bg-white/10'"
          >
            <span
              class="absolute top-1 h-4 w-4 rounded-full bg-[var(--color-bg)] transition-smooth"
              :class="autoContinueAfterVerse ? 'left-6' : 'left-1'"
            />
          </span>
        </button>
      </div>
      <MetricStrip :metrics="metrics" />
      <TypingStage :text="data?.verse.textNormalized ?? ''" :typed="typing.typed.value" />
      <div class="mx-auto max-w-[980px] rounded-full border border-white/6 bg-white/5 px-6 py-3 text-center text-sm text-[var(--color-copy-dim)]">
        Press keys directly on the keyboard. When the verse is completed, progress and stats are saved automatically.
      </div>
    </section>

    <section class="mx-auto grid w-full max-w-[1280px] gap-6 xl:grid-cols-[1.15fr_0.85fr]">
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
