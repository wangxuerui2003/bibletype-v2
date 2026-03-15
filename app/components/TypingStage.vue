<script setup lang="ts">
defineProps<{
  text: string;
  typed: string;
}>();
</script>

<template>
  <div class="panel min-h-[260px] px-6 py-8 md:px-10">
    <div class="mono text-xs uppercase tracking-[0.3em] text-[var(--color-copy-dim)]">
      stay centered. type clean.
    </div>

    <div class="mt-6 text-2xl leading-relaxed md:text-4xl">
      <template v-for="(char, index) in text" :key="`${char}-${index}`">
        <span
          v-if="index === typed.length"
          class="mr-[1px] inline-block h-8 w-[3px] translate-y-1 rounded-full bg-[var(--color-accent)] align-middle"
        />
        <span
          class="transition-smooth"
          :class="{
            'text-[var(--color-success)]': index < typed.length && typed[index] === char,
            'text-[var(--color-danger)] underline decoration-[var(--color-danger)] underline-offset-4':
              index < typed.length && typed[index] !== char,
            'text-copy': index >= typed.length,
          }"
        >
          {{ char }}
        </span>
      </template>
    </div>
  </div>
</template>
