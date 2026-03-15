<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const { data, refresh } = await useFetch("/api/admin/users");

async function setRole(userId: string, role: "user" | "admin") {
  await $fetch(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    body: { role },
  });

  await refresh();
}
</script>

<template>
  <div class="space-y-6">
    <section>
      <p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Users</p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Account management</h1>
      <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
        Promote trusted accounts to admin and review the current role distribution.
      </p>
    </section>

    <section class="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
      <div class="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] gap-4 border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        <div>User</div>
        <div>Role</div>
        <div>Actions</div>
      </div>

      <div
        v-for="item in data?.users ?? []"
        :key="item.id"
        class="grid grid-cols-1 gap-4 border-b border-slate-100 px-6 py-5 last:border-b-0 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] md:items-center"
      >
        <div>
          <div class="text-sm font-semibold text-slate-950">{{ item.name }}</div>
          <div class="mt-1 text-sm text-slate-500">{{ item.email }}</div>
        </div>
        <div>
          <span class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
            {{ item.role }}
          </span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            @click="setRole(item.id, 'user')"
          >
            Set user
          </button>
          <button
            class="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            @click="setRole(item.id, 'admin')"
          >
            Set admin
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
