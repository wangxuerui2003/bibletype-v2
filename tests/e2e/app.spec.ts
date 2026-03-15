import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { user } from "../../db/schema";

async function deleteUserByEmail(email: string) {
  await db.delete(user).where(eq(user.email, email));
}

async function authenticateInBrowser(page: Parameters<typeof test>[0]["page"], email: string) {
  await page.goto("/auth/sign-in");
  await page.evaluate(
    async ({ authEmail }) => {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: authEmail,
          password: "password123",
        }),
      });

      if (!response.ok) {
        throw new Error(`Sign in failed with ${response.status}`);
      }
    },
    { authEmail: email },
  );
}

test("sign up and reach typing page", async ({ page }) => {
  const email = `e2e_${Date.now()}@example.com`;
  await deleteUserByEmail(email).catch(() => undefined);

  await page.request.post("http://localhost:3100/api/auth/sign-up/email", {
    data: {
      name: "E2E User",
      email,
      password: "password123",
    },
  });
  await authenticateInBrowser(page, email);
  await page.goto("/");
  await expect(page.getByText("Start a race")).toBeVisible({ timeout: 15000 });
});

test("typing page redirects unauthenticated users", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/");

  await page.waitForURL("**/auth/sign-in");
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
