<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const { data } = await useFetch("/api/admin/places");
</script>

<template>
  <div class="space-y-6">
    <section>
      <p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Places</p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Geography index</h1>
      <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
        Inspect imported biblical places and spot anomalies in place typing metadata.
      </p>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <article
        v-for="item in data?.items ?? []"
        :key="item.id"
        class="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm"
      >
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-lg font-semibold text-slate-950">{{ item.name }}</h2>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
            {{ item.placeType }}
          </span>
        </div>
      </article>
    </section>
  </div>
</template>
