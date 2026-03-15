import { computed, ref } from "vue";
import { splitVerseWords } from "../lib/text";

export function useTypingSession(text: MaybeRefOrGetter<string>) {
  const typed = ref("");
  const startedAt = ref<number | null>(null);

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

  const elapsedMs = computed(() => {
    if (!startedAt.value) {
      return 0;
    }
    return Date.now() - startedAt.value;
  });

  const accuracy = computed(() => {
    if (!typed.value.length) {
      return 100;
    }
    return Number(((completedChars.value / typed.value.length) * 100).toFixed(1));
  });

  const wpm = computed(() => {
    if (!elapsedMs.value) {
      return 0;
    }

    const minutes = elapsedMs.value / 60000;
    return Number((completedChars.value / 5 / Math.max(minutes, 1 / 60)).toFixed(1));
  });

  const isComplete = computed(
    () => normalizedText.value.length > 0 && typed.value === normalizedText.value,
  );

  function pushKey(key: string) {
    if (!startedAt.value) {
      startedAt.value = Date.now();
    }

    if (key === "Backspace") {
      typed.value = typed.value.slice(0, -1);
      return;
    }

    if (key.length === 1) {
      typed.value += key;
    }
  }

  function reset() {
    typed.value = "";
    startedAt.value = null;
  }

  return {
    typed,
    words,
    typedWords,
    totalChars,
    completedChars,
    elapsedMs,
    accuracy,
    wpm,
    isComplete,
    pushKey,
    reset,
  };
}
