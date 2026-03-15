import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { user } from "../../db/schema";

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

test("admin user can open dashboard", async ({ page }) => {
  const email = `admin_${Date.now()}@example.com`;

  await page.request.post("http://localhost:3100/api/auth/sign-up/email", {
    data: {
      name: "Admin User",
      email,
      password: "password123",
    },
  });

  await db.update(user).set({ role: "admin" }).where(eq(user.email, email));
  await authenticateInBrowser(page, email);

  await page.goto("/admin");
  await expect(page.getByText("Manage data")).toBeVisible({ timeout: 15000 });
});
