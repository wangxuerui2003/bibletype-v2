<script setup lang="ts">
definePageMeta({
  middleware: "admin",
});

const { data } = await useFetch("/api/admin/dashboard");
</script>

<template>
  <div class="space-y-6">
    <MetricStrip
      :metrics="[
        { label: 'users', value: data?.stats.users ?? 0 },
        { label: 'feedback', value: data?.stats.feedback ?? 0 },
        { label: 'attempts', value: data?.stats.attempts ?? 0 },
        { label: 'races', value: data?.stats.races ?? 0 },
      ]"
    />

    <div class="grid gap-6 xl:grid-cols-2">
      <section class="panel p-6">
        <h2 class="text-xl font-semibold">Manage data</h2>
        <div class="mt-4 flex flex-wrap gap-3">
          <NuxtLink to="/admin/users" class="rounded-full border border-white/10 px-4 py-2">Users</NuxtLink>
          <NuxtLink to="/admin/feedback" class="rounded-full border border-white/10 px-4 py-2">Feedback</NuxtLink>
          <NuxtLink to="/admin/places" class="rounded-full border border-white/10 px-4 py-2">Places</NuxtLink>
          <NuxtLink to="/admin/races" class="rounded-full border border-white/10 px-4 py-2">Races</NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
