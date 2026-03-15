<script setup lang="ts">
definePageMeta({
  middleware: "admin",
  layout: "admin",
});

const { data } = await useFetch("/api/admin/dashboard");
</script>

<template>
  <div class="space-y-8">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Control room</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Admin overview</h1>
        <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          Monitor key activity and jump directly into user moderation, place curation, and race inspection.
        </p>
      </div>

      <NuxtLink
        to="/"
        class="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
      >
        Open typing app
      </NuxtLink>
    </section>

    <section class="grid gap-4 xl:grid-cols-4">
      <article v-for="metric in [
        { label: 'Users', value: data?.stats.users ?? 0, detail: 'registered accounts' },
        { label: 'Feedback', value: data?.stats.feedback ?? 0, detail: 'items awaiting review' },
        { label: 'Attempts', value: data?.stats.attempts ?? 0, detail: 'saved verse runs' },
        { label: 'Races', value: data?.stats.races ?? 0, detail: 'multiplayer lobbies' },
      ]" :key="metric.label" class="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{{ metric.label }}</div>
        <div class="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{{ metric.value }}</div>
        <div class="mt-3 text-sm text-slate-500">{{ metric.detail }}</div>
      </article>
    </section>

    <section class="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <article class="rounded-[30px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <h2 class="text-xl font-semibold text-slate-950">Work queues</h2>
        <div class="mt-5 grid gap-3 md:grid-cols-2">
          <NuxtLink
            to="/admin/users"
            class="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:bg-slate-100"
          >
            <div class="text-sm font-semibold text-slate-950">Users</div>
            <p class="mt-2 text-sm leading-6 text-slate-500">Adjust roles and inspect account state.</p>
          </NuxtLink>
          <NuxtLink
            to="/admin/feedback"
            class="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:bg-slate-100"
          >
            <div class="text-sm font-semibold text-slate-950">Feedback</div>
            <p class="mt-2 text-sm leading-6 text-slate-500">Triage bug reports and feature requests.</p>
          </NuxtLink>
          <NuxtLink
            to="/admin/places"
            class="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:bg-slate-100"
          >
            <div class="text-sm font-semibold text-slate-950">Places</div>
            <p class="mt-2 text-sm leading-6 text-slate-500">Inspect imported Bible geography records.</p>
          </NuxtLink>
          <NuxtLink
            to="/admin/races"
            class="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:bg-slate-100"
          >
            <div class="text-sm font-semibold text-slate-950">Races</div>
            <p class="mt-2 text-sm leading-6 text-slate-500">Check lobby snapshots and participation.</p>
          </NuxtLink>
        </div>
      </article>

      <article class="rounded-[30px] border border-slate-200 bg-slate-950 px-6 py-6 text-white shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Route access</p>
        <h2 class="mt-4 text-2xl font-semibold tracking-tight">Direct entry works</h2>
        <p class="mt-3 text-sm leading-7 text-slate-300">
          This admin surface is intentionally separate from the public typing UI. You can land here directly at
          <span class="font-semibold text-white">/admin</span> and stay in a utility-first workspace.
        </p>
      </article>
    </section>
  </div>
</template>
