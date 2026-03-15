<script setup lang="ts">
import { authClient } from "../../../lib/auth-client";

const router = useRouter();
const route = useRoute();
const password = ref("");
const done = ref(false);

async function handleSubmit() {
  const token = String(route.query.token ?? "");

  await $fetch("/api/auth/reset-password", {
    method: "POST",
    body: {
      newPassword: password.value,
      token,
    },
    credentials: "include",
  });

  done.value = true;
  setTimeout(() => router.push("/auth/sign-in"), 1000);
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <section class="panel p-8">
      <h1 class="text-3xl font-semibold">Choose a new password</h1>
      <div class="mt-6 space-y-4">
        <input
          v-model="password"
          type="password"
          class="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
          placeholder="New password"
        />
        <button class="w-full rounded-2xl bg-[var(--color-accent)] px-4 py-3 font-semibold text-black" @click="handleSubmit">
          Reset password
        </button>
        <p v-if="done" class="text-sm text-[var(--color-success)]">Password updated. Redirecting...</p>
      </div>
    </section>
  </div>
</template>
