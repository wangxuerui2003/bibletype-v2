<script setup lang="ts">
const router = useRouter();
const form = reactive({
  name: "",
  email: "",
  password: "",
});
const error = ref("");
const loading = ref(false);

async function handleSubmit() {
  loading.value = true;
  error.value = "";

  try {
    await $fetch("/api/auth/sign-up/email", {
      method: "POST",
      body: form,
      credentials: "include",
    });

    await router.push("/");
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : "Unable to sign up";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-[calc(100vh-10.5rem)] max-w-4xl items-center justify-center py-6">
    <section class="panel w-full max-w-xl p-8 md:p-10">
      <h1 class="text-4xl font-semibold tracking-tight">Create your account</h1>
      <p class="mt-4 text-base leading-8 text-[var(--color-copy-dim)]">
        Start saving progress, racing friends, and building a full typing history around each verse.
      </p>
      <form class="mt-8 space-y-4" @submit.prevent="handleSubmit">
        <input
          id="sign-up-name"
          v-model="form.name"
          name="name"
          autocomplete="name"
          class="w-full rounded-2xl border border-white/8 bg-white/5 px-5 py-4 text-base placeholder:text-[var(--color-copy-dim)]"
          placeholder="Display name"
        />
        <input
          id="sign-up-email"
          v-model="form.email"
          name="email"
          autocomplete="email"
          class="w-full rounded-2xl border border-white/8 bg-white/5 px-5 py-4 text-base placeholder:text-[var(--color-copy-dim)]"
          placeholder="Email"
        />
        <input
          id="sign-up-password"
          v-model="form.password"
          name="password"
          type="password"
          autocomplete="new-password"
          class="w-full rounded-2xl border border-white/8 bg-white/5 px-5 py-4 text-base placeholder:text-[var(--color-copy-dim)]"
          placeholder="Password"
        />
        <button class="w-full rounded-2xl bg-[var(--color-accent)] px-5 py-4 text-base font-semibold text-black" :disabled="loading" @click="handleSubmit">
          {{ loading ? "Creating..." : "Create account" }}
        </button>
        <p v-if="error" class="text-sm text-[var(--color-danger)]">{{ error }}</p>
      </form>
    </section>
  </div>
</template>
