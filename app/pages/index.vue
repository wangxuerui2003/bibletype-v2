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
const mapOpen = ref(false);
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
  <div class="relative">
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

    <section class="mx-auto flex min-h-[calc(100vh-7.25rem)] w-full max-w-[1380px] flex-col overflow-hidden py-2 lg:min-h-[calc(100vh-8rem)]">
      <div class="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4">
        <div class="mono text-sm uppercase tracking-[0.24em] text-[var(--color-copy-dim)]">
          press any key to begin
        </div>
        <div class="flex items-center gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm text-[var(--color-copy-dim)] transition-smooth hover:border-white/16 hover:text-[var(--color-copy)]"
            @click="mapOpen = !mapOpen"
          >
            <span class="mono text-[0.72rem] uppercase tracking-[0.2em]">map</span>
            <span class="text-xs">{{ mapOpen ? "hide" : "show" }}</span>
          </button>
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
      </div>

      <div class="relative flex min-h-0 flex-1 items-center justify-center">
        <div class="flex w-full min-h-0 max-w-[1120px] flex-col justify-center gap-6">
          <MetricStrip :metrics="metrics" />
          <TypingStage :text="data?.verse.textNormalized ?? ''" :typed="typing.typed.value" />
          <div class="mx-auto max-w-[920px] text-center text-sm text-[var(--color-copy-dim)]">
            Press keys directly on the keyboard. When the verse is completed, progress and stats are saved automatically.
          </div>
        </div>

        <Transition
          enter-active-class="transition duration-180 ease-out"
          enter-from-class="translate-y-3 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-140 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-3 opacity-0"
        >
          <div v-if="mapOpen" class="absolute bottom-2 right-0 hidden xl:block">
            <MapPanel compact :places="data?.places ?? []" />
          </div>
        </Transition>
      </div>

      <div v-if="mapOpen" class="mx-auto mt-4 w-full max-w-[1120px] xl:hidden">
        <MapPanel compact :places="data?.places ?? []" />
      </div>
    </section>
  </div>
</template>
