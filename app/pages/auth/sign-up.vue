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
  <div class="mx-auto max-w-xl">
    <section class="panel p-8">
      <h1 class="text-3xl font-semibold">Create your account</h1>
      <div class="mt-6 space-y-4">
        <input v-model="form.name" class="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3" placeholder="Display name" />
        <input v-model="form.email" class="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3" placeholder="Email" />
        <input
          v-model="form.password"
          type="password"
          class="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
          placeholder="Password"
        />
        <button class="w-full rounded-2xl bg-[var(--color-accent)] px-4 py-3 font-semibold text-black" :disabled="loading" @click="handleSubmit">
          {{ loading ? "Creating..." : "Create account" }}
        </button>
        <p v-if="error" class="text-sm text-[var(--color-danger)]">{{ error }}</p>
      </div>
    </section>
  </div>
</template>
