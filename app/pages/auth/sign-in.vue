<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { signIn } from "../../lib/auth-client";

const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const googleLoading = ref(false);
const googleAuthEnabled = computed(() => runtimeConfig.public.googleAuthEnabled);

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
  if (!googleAuthEnabled.value) {
    error.value = "Google sign-in is not configured on this environment.";
    return;
  }

  googleLoading.value = true;
  error.value = "";

  try {
    await signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : "Unable to start Google sign-in";
    googleLoading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-[calc(100vh-10.5rem)] max-w-6xl items-center justify-center py-6">
    <div class="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
      <section class="panel flex flex-col justify-center p-8 md:p-12">
        <p class="mono text-sm uppercase tracking-[0.28em] text-[var(--color-copy-dim)]">return to the text</p>
        <h1 class="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">Sign in and keep typing.</h1>
        <p class="mt-5 max-w-xl text-base leading-8 text-[var(--color-copy-dim)] md:text-lg">
          Jump straight back into your verse flow with email and password, or use Google and land right back in the app.
        </p>
      </section>

      <section class="panel p-8 md:p-10">
        <form class="space-y-4" @submit.prevent="handlePasswordSignIn">
          <input
            id="sign-in-email"
            v-model="email"
            name="email"
            autocomplete="email"
            class="w-full rounded-2xl border border-white/8 bg-white/5 px-5 py-4 text-base placeholder:text-[var(--color-copy-dim)]"
            placeholder="Email"
          />
          <input
            id="sign-in-password"
            v-model="password"
            name="password"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-2xl border border-white/8 bg-white/5 px-5 py-4 text-base placeholder:text-[var(--color-copy-dim)]"
            placeholder="Password"
          />
          <button class="w-full rounded-2xl bg-[var(--color-accent)] px-5 py-4 text-base font-semibold text-black" :disabled="loading" @click="handlePasswordSignIn">
            {{ loading ? "Signing in..." : "Sign in" }}
          </button>
          <button
            v-if="googleAuthEnabled"
            class="transition-smooth flex w-full items-center justify-center gap-3 rounded-2xl border border-black/5 bg-white px-5 py-4 text-base font-semibold text-[#1f1f1f] hover:-translate-y-[1px] hover:bg-[#f7f7f7]"
            :disabled="googleLoading"
            @click="handleGoogleSignIn"
          >
            <Icon icon="logos:google-icon" class="h-5 w-5 shrink-0" />
            <span>{{ googleLoading ? "Redirecting to Google..." : "Continue with Google" }}</span>
          </button>
          <div
            v-else
            class="rounded-2xl border border-dashed border-white/10 px-5 py-4 text-sm leading-7 text-[var(--color-copy-dim)]"
          >
            Google sign-in is unavailable until `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are present.
          </div>
          <p v-if="error" class="text-sm text-[var(--color-danger)]">{{ error }}</p>
        </form>

        <div class="mt-6 flex items-center justify-between text-base text-[var(--color-copy-dim)]">
          <NuxtLink to="/auth/sign-up">Create account</NuxtLink>
          <NuxtLink to="/auth/forgot-password">Forgot password?</NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
