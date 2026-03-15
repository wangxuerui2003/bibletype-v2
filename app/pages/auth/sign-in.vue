<script setup lang="ts">
import { authClient } from "../../../lib/auth-client";

const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handlePasswordSignIn() {
  loading.value = true;
  error.value = "";

  try {
    await $fetch("/api/auth/sign-in/email", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
      credentials: "include",
    });

    await router.push("/");
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : "Unable to sign in";
  } finally {
    loading.value = false;
  }
}

async function handleGoogleSignIn() {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/",
  });
}
</script>

<template>
  <div class="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
    <section class="panel p-8 md:p-10">
      <p class="mono text-xs uppercase tracking-[0.28em] text-[var(--color-copy-dim)]">return to the text</p>
      <h1 class="mt-4 text-4xl font-semibold tracking-tight">Sign in and keep typing.</h1>
      <p class="mt-4 max-w-xl text-sm leading-7 text-[var(--color-copy-dim)]">
        Email/password is ready now. Google OAuth wiring is implemented too; live Google sign-in will start working
        after the Cloud Console credentials are configured.
      </p>
    </section>

    <section class="panel p-8">
      <div class="space-y-4">
        <input v-model="email" class="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3" placeholder="Email" />
        <input
          v-model="password"
          type="password"
          class="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
          placeholder="Password"
        />
        <button class="w-full rounded-2xl bg-[var(--color-accent)] px-4 py-3 font-semibold text-black" :disabled="loading" @click="handlePasswordSignIn">
          {{ loading ? "Signing in..." : "Sign in" }}
        </button>
        <button class="w-full rounded-2xl border border-white/10 px-4 py-3" @click="handleGoogleSignIn">Continue with Google</button>
        <p v-if="error" class="text-sm text-[var(--color-danger)]">{{ error }}</p>
      </div>

      <div class="mt-6 flex items-center justify-between text-sm text-[var(--color-copy-dim)]">
        <NuxtLink to="/auth/sign-up">Create account</NuxtLink>
        <NuxtLink to="/auth/forgot-password">Forgot password?</NuxtLink>
      </div>
    </section>
  </div>
</template>
