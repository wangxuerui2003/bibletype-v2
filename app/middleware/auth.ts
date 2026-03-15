export default defineNuxtRouteMiddleware(async () => {
  try {
    await $fetch("/api/profile", {
      credentials: "include",
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
    });
  } catch {
    return navigateTo("/auth/sign-in");
  }
});
