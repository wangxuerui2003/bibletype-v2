<script setup lang="ts">
import { signOut, useSession } from "../lib/auth-client";

const route = useRoute();
const session = useSession();

const navigationItems = [
  { label: "Overview", to: "/admin" },
  { label: "Users", to: "/admin/users" },
  { label: "Feedback", to: "/admin/feedback" },
  { label: "Places", to: "/admin/places" },
  { label: "Races", to: "/admin/races" },
];

async function handleSignOut() {
  await signOut();
  await navigateTo("/auth/sign-in");
}
</script>

<template>
  <div class="min-h-screen bg-[#f4f5f7] text-slate-900">
    <div class="mx-auto flex min-h-screen max-w-[1680px] flex-col px-4 py-4 lg:flex-row lg:gap-6 lg:px-6 lg:py-6">
      <aside class="flex w-full shrink-0 flex-col rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:w-[280px]">
        <div>
          <NuxtLink to="/admin" class="text-xl font-semibold tracking-tight text-slate-950">BibleType Admin</NuxtLink>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            Internal tools for users, content, and operational data.
          </p>
        </div>

        <nav class="mt-8 space-y-2">
          <NuxtLink
            v-for="item in navigationItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors"
            :class="
              route.path === item.to
                ? 'bg-slate-950 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            "
          >
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="mt-auto rounded-3xl bg-slate-50 px-4 py-4">
          <div class="text-sm font-semibold text-slate-900">{{ session.data?.user.name ?? "Admin" }}</div>
          <div class="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
            {{ session.data?.user.role ?? "admin" }}
          </div>
          <div class="mt-1 text-sm text-slate-500">{{ session.data?.user.email }}</div>
          <div class="mt-4 flex flex-wrap gap-2">
            <NuxtLink to="/" class="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
              Back to app
            </NuxtLink>
            <button
              class="rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
              @click="handleSignOut"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div class="mt-4 flex-1 rounded-[32px] border border-slate-200 bg-[#fbfbfc] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] lg:mt-0 lg:p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
