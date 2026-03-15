<script setup lang="ts">
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
  <div class="mx-auto flex min-h-[calc(100vh-10.5rem)] max-w-4xl items-center justify-center py-6">
    <section class="panel w-full max-w-xl p-8 md:p-10">
      <h1 class="text-4xl font-semibold tracking-tight">Reset your password</h1>
      <p class="mt-4 text-base leading-8 text-[var(--color-copy-dim)]">Enter your email and we will send you a password reset link.</p>
      <form class="mt-8 space-y-4" @submit.prevent="handleSubmit">
        <input
          id="forgot-password-email"
          v-model="email"
          name="email"
          autocomplete="email"
          class="w-full rounded-2xl border border-white/8 bg-white/5 px-5 py-4 text-base placeholder:text-[var(--color-copy-dim)]"
          placeholder="Email"
        />
        <button class="w-full rounded-2xl bg-[var(--color-accent)] px-5 py-4 text-base font-semibold text-black" @click="handleSubmit">
          Send reset link
        </button>
        <p v-if="sent" class="text-sm text-[var(--color-success)]">Reset link sent.</p>
      </form>
    </section>
  </div>
</template>
