<script setup lang="ts">
import { authClient } from "../../../lib/auth-client";

const email = ref("");
const sent = ref(false);

async function handleSubmit() {
  await $fetch("/api/auth/request-password-reset", {
    method: "POST",
    body: {
      email: email.value,
      redirectTo: `${window.location.origin}/auth/reset-password`,
    },
    credentials: "include",
  });

  sent.value = true;
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <section class="panel p-8">
      <h1 class="text-3xl font-semibold">Reset your password</h1>
      <p class="mt-3 text-sm text-[var(--color-copy-dim)]">Mailpit is available locally on port 8025 for reset links.</p>
      <div class="mt-6 space-y-4">
        <input v-model="email" class="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3" placeholder="Email" />
        <button class="w-full rounded-2xl bg-[var(--color-accent)] px-4 py-3 font-semibold text-black" @click="handleSubmit">
          Send reset link
        </button>
        <p v-if="sent" class="text-sm text-[var(--color-success)]">Reset link sent.</p>
      </div>
    </section>
  </div>
</template>
