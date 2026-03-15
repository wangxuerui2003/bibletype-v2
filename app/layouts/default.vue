<script setup lang="ts">
import { signOut, useSession } from "../lib/auth-client";

const session = useSession();

async function handleSignOut() {
  await signOut();
  await navigateTo("/auth/sign-in");
}
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-[1560px] flex-col px-4 py-5 md:px-8">
    <header class="mb-10 flex items-center justify-between gap-6">
      <NuxtLink to="/" class="transition-smooth flex items-center gap-3 text-[2rem] font-semibold tracking-tight hover:opacity-80">
        BibleType
      </NuxtLink>

      <div class="flex items-center gap-5 md:gap-7">
        <nav class="mono flex items-center gap-4 text-base text-[var(--color-copy-dim)] md:gap-6">
          <NuxtLink to="/" class="transition-smooth hover:text-copy">type</NuxtLink>
          <NuxtLink to="/race" class="transition-smooth hover:text-copy">race</NuxtLink>
          <NuxtLink to="/feedback" class="transition-smooth hover:text-copy">feedback</NuxtLink>
          <NuxtLink to="/faq" class="transition-smooth hover:text-copy">faq</NuxtLink>
          <NuxtLink v-if="session.data?.user.role === 'admin'" to="/admin" class="transition-smooth hover:text-copy">
            admin
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-3">
          <NuxtLink
            v-if="session.data"
            to="/settings"
            class="transition-smooth rounded-full border border-white/8 px-4 py-2 text-base text-[var(--color-copy-dim)] hover:text-copy"
          >
            settings
          </NuxtLink>
          <button
            v-if="session.data"
            class="transition-smooth rounded-full border border-white/8 px-4 py-2 text-base text-[var(--color-copy-dim)] hover:text-copy"
            @click="handleSignOut"
          >
            sign out
          </button>
          <NuxtLink
            v-if="!session.data"
            to="/auth/sign-in"
            class="rounded-full bg-[var(--color-accent)] px-4 py-2 text-base font-semibold text-black"
          >
            sign in
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
