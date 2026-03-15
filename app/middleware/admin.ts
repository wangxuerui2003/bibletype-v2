export default defineNuxtRouteMiddleware(async () => {
  try {
    const response = await $fetch("/api/profile", {
      credentials: "include",
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
    });

    if (response.user.role !== "admin") {
      return navigateTo("/");
    }
  } catch {
    return navigateTo("/auth/sign-in");
  }
});
