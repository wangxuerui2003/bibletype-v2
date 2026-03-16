<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  text: string;
  typed: string;
}>();

const tokens = computed(() => {
  const rawTokens = props.text.match(/\S+\s*/g) ?? [];
  let start = 0;

  return rawTokens.map((token, tokenIndex) => {
    const current = {
      id: `${tokenIndex}-${start}`,
      token,
      start,
      chars: [...token].map((char, charIndex) => ({
        id: `${tokenIndex}-${charIndex}-${start + charIndex}`,
        char,
        index: start + charIndex,
      })),
    };

    start += token.length;
    return current;
  });
});
</script>

<template>
  <div class="flex min-h-[280px] flex-col justify-center px-2 py-4 md:min-h-[360px] md:px-4 md:py-6">
    <div class="mono text-center text-xs uppercase tracking-[0.3em] text-[var(--color-copy-dim)]">
      stay centered. type clean.
    </div>

    <div
      class="typing-text mx-auto mt-6 max-w-[1240px] text-center text-[2.2rem] leading-[1.72] text-[var(--color-copy-dim)] md:mt-8 md:text-[3.05rem]"
    >
      <template v-for="token in tokens" :key="token.id">
        <span class="typing-token">
          <span
            v-for="item in token.chars"
            :key="item.id"
            class="typing-char"
            :class="{
              'typing-char-correct': item.index < typed.length && typed[item.index] === item.char,
              'typing-char-incorrect':
                item.index < typed.length && typed[item.index] !== item.char,
              'typing-char-pending': item.index >= typed.length,
            }"
          >
            <span
              v-if="item.index === typed.length"
              class="typing-caret caret-blink"
              aria-hidden="true"
            />
            {{ item.char === " " ? "\u00A0" : item.char }}
          </span>
        </span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.typing-text {
  word-break: normal;
  overflow-wrap: normal;
}

.typing-token {
  display: inline-block;
  white-space: nowrap;
}

.typing-char {
  position: relative;
  display: inline-flex;
  align-items: center;
  line-height: 1.08;
  vertical-align: top;
  color: var(--color-copy);
  transition:
    color 145ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 145ms cubic-bezier(0.16, 1, 0.3, 1),
    text-decoration-color 145ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 145ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: color, opacity, filter;
}

.typing-char-correct {
  color: var(--color-success);
  filter: saturate(1.02);
}

.typing-char-incorrect {
  color: var(--color-danger);
  text-decoration: underline;
  text-decoration-color: var(--color-danger);
  text-underline-offset: 0.14em;
}

.typing-char-pending {
  color: color-mix(in srgb, var(--color-copy-dim) 82%, white 18%);
}

.typing-caret {
  position: absolute;
  left: -0.06em;
  top: 50%;
  width: 0.07em;
  height: 0.86em;
  border-radius: 999px;
  background: var(--color-accent);
  box-shadow: 0 0 14px rgba(226, 183, 20, 0.28);
  transform: translate(-50%, -50%);
}
</style>
