<script setup lang="ts">
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
  <div class="mx-auto flex min-h-[calc(100vh-10.5rem)] max-w-4xl items-center justify-center py-6">
    <section class="panel w-full max-w-xl p-8 md:p-10">
      <h1 class="text-4xl font-semibold tracking-tight">Choose a new password</h1>
      <form class="mt-8 space-y-4" @submit.prevent="handleSubmit">
        <input
          id="reset-password-new-password"
          v-model="password"
          name="password"
          type="password"
          autocomplete="new-password"
          class="w-full rounded-2xl border border-white/8 bg-white/5 px-5 py-4 text-base placeholder:text-[var(--color-copy-dim)]"
          placeholder="New password"
        />
        <button class="w-full rounded-2xl bg-[var(--color-accent)] px-5 py-4 text-base font-semibold text-black" @click="handleSubmit">
          Reset password
        </button>
        <p v-if="done" class="text-sm text-[var(--color-success)]">Password updated. Redirecting...</p>
      </form>
    </section>
  </div>
</template>
