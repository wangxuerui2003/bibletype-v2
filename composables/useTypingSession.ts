import { computed, onScopeDispose, ref, watch } from "vue";
import { splitVerseWords } from "../lib/text";

export function useTypingSession(text: MaybeRefOrGetter<string>) {
  const typed = ref("");
  const startedAt = ref<number | null>(null);
  const nowMs = ref(Date.now());
  const totalKeypresses = ref(0);
  const incorrectKeypresses = ref(0);
  let timer: ReturnType<typeof setInterval> | null = null;

  const normalizedText = computed(() => toValue(text));
  const words = computed(() => splitVerseWords(normalizedText.value));
  const typedWords = computed(() => typed.value.split(" "));
  const totalChars = computed(() => normalizedText.value.length);
  const completedChars = computed(() => {
    let index = 0;
    for (let i = 0; i < normalizedText.value.length && i < typed.value.length; i += 1) {
      if (normalizedText.value[i] !== typed.value[i]) {
        break;
      }
      index += 1;
    }
    return index;
  });

  const correctChars = computed(() => {
    let count = 0;
    for (let i = 0; i < typed.value.length && i < normalizedText.value.length; i += 1) {
      if (typed.value[i] === normalizedText.value[i]) {
        count += 1;
      }
    }
    return count;
  });

  const accuracy = computed(() => {
    if (!totalKeypresses.value) {
      return 100;
    }
    return Number((((totalKeypresses.value - incorrectKeypresses.value) / totalKeypresses.value) * 100).toFixed(1));
  });

  const elapsedMs = computed(() => getElapsedMs(nowMs.value));

  const wpm = computed(() => {
    return calculateWpm(correctChars.value, elapsedMs.value);
  });

  const isComplete = computed(
    () => normalizedText.value.length > 0 && typed.value === normalizedText.value,
  );

  function pushKey(key: string) {
    if (!startedAt.value) {
      startedAt.value = Date.now();
      nowMs.value = startedAt.value;
      ensureTimer();
    }

    if (key === "Backspace") {
      typed.value = typed.value.slice(0, -1);
      return;
    }

    if (key.length === 1) {
      const expectedChar = normalizedText.value[typed.value.length];

      totalKeypresses.value += 1;
      if (key !== expectedChar) {
        incorrectKeypresses.value += 1;
      }

      typed.value += key;
    }
  }

  function reset() {
    typed.value = "";
    startedAt.value = null;
    nowMs.value = Date.now();
    totalKeypresses.value = 0;
    incorrectKeypresses.value = 0;
    stopTimer();
  }

  function snapshot() {
    const elapsed = getElapsedMs(Date.now());

    return {
      elapsedMs: elapsed,
      correctChars: correctChars.value,
      accuracy: totalKeypresses.value
        ? Number((((totalKeypresses.value - incorrectKeypresses.value) / totalKeypresses.value) * 100).toFixed(1))
        : 100,
      wpm: calculateWpm(correctChars.value, elapsed),
    };
  }

  function ensureTimer() {
    if (timer) {
      return;
    }

    timer = setInterval(() => {
      nowMs.value = Date.now();
    }, 100);
  }

  function stopTimer() {
    if (!timer) {
      return;
    }

    clearInterval(timer);
    timer = null;
  }

  function getElapsedMs(currentTime: number) {
    if (!startedAt.value) {
      return 0;
    }

    return Math.max(currentTime - startedAt.value, 0);
  }

  watch(
    normalizedText,
    () => {
      reset();
    },
    { flush: "sync" },
  );

  onScopeDispose(() => {
    stopTimer();
  });

  return {
    typed,
    words,
    typedWords,
    totalChars,
    completedChars,
    correctChars,
    elapsedMs,
    accuracy,
    wpm,
    isComplete,
    pushKey,
    reset,
    snapshot,
  };
}

function calculateWpm(correctChars: number, elapsedMs: number) {
  if (!correctChars || elapsedMs <= 0) {
    return 0;
  }

  const minutes = elapsedMs / 60000;
  return Number((correctChars / 5 / minutes).toFixed(1));
}
