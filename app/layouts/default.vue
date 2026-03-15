<script setup lang="ts">
import { useSession } from "../../lib/auth-client";

const session = useSession();
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-5 md:px-8">
    <header class="mb-6 flex items-center justify-between gap-4">
      <NuxtLink to="/" class="transition-smooth text-xl font-semibold tracking-tight hover:opacity-80">
        BibleType
      </NuxtLink>

      <nav class="mono flex items-center gap-3 text-sm text-[var(--color-copy-dim)]">
        <NuxtLink to="/" class="transition-smooth hover:text-copy">type</NuxtLink>
        <NuxtLink to="/race" class="transition-smooth hover:text-copy">race</NuxtLink>
        <NuxtLink to="/feedback" class="transition-smooth hover:text-copy">feedback</NuxtLink>
        <NuxtLink to="/faq" class="transition-smooth hover:text-copy">faq</NuxtLink>
        <NuxtLink v-if="session.data?.user.role === 'admin'" to="/admin" class="transition-smooth hover:text-copy">
          admin
        </NuxtLink>
        <NuxtLink v-if="session.data" to="/settings" class="transition-smooth hover:text-copy">
          settings
        </NuxtLink>
        <NuxtLink v-if="!session.data" to="/auth/sign-in" class="text-[var(--color-accent)]">
          sign in
        </NuxtLink>
      </nav>
    </header>

    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
