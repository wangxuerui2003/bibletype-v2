import { expect, test } from "@playwright/test";
import { createTestId, execute } from "./support/db";

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

  await execute('UPDATE "user" SET "role" = $1 WHERE "email" = $2', ["admin", email]);
  await authenticateInBrowser(page, email);

  await page.goto("/admin");
  await expect(page.getByText("Admin overview")).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("link", { name: "Users", exact: true })).toBeVisible();
});

test("admin can update feedback status", async ({ page }) => {
  const email = `moderator_${Date.now()}@example.com`;

  await page.request.post("http://localhost:3100/api/auth/sign-up/email", {
    data: {
      name: "Moderator",
      email,
      password: "password123",
    },
  });
  await execute('UPDATE "user" SET "role" = $1 WHERE "email" = $2', ["admin", email]);

  const moderatorResult = await execute('SELECT "id" FROM "user" WHERE "email" = $1 LIMIT 1', [email]);
  const moderator = moderatorResult.rows[0] as { id: string } | undefined;

  if (!moderator?.id) {
    throw new Error("Moderator user not found");
  }

  await execute(
    'INSERT INTO "feedback" ("id", "type", "status", "content", "created_by") VALUES ($1, $2, $3, $4, $5)',
    [createTestId("fb"), "feedback", "open", "Admin moderation test feedback.", moderator.id],
  );

  await authenticateInBrowser(page, email);
  await page.goto("/admin/feedback");
  await page.getByRole("button", { name: "Done" }).first().click();
  await expect(page.getByText("done").first()).toBeVisible();
});
