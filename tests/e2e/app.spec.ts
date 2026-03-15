import { expect, test } from "@playwright/test";
import { execute } from "./support/db";

async function deleteUserByEmail(email: string) {
  await execute('DELETE FROM "user" WHERE "email" = $1', [email]);
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
  await page.getByRole("button", { name: /auto continue/i }).click();
  await expect(page.getByRole("button", { name: /auto continue/i })).toContainText("auto continue");
});

test("profile updates support bio and avatar upload", async ({ page }) => {
  const email = `profile_${Date.now()}@example.com`;

  await page.request.post("http://localhost:3100/api/auth/sign-up/email", {
    data: {
      name: "Profile User",
      email,
      password: "password123",
    },
  });
  await authenticateInBrowser(page, email);

  await page.goto("/settings");
  const fileInput = page.locator("input[type='file']");
  await fileInput.setInputFiles("tests/fixtures/avatar.png");
  await fileInput.dispatchEvent("change");
  await page.getByRole("button", { name: "Upload avatar" }).click();
  await page.getByPlaceholder("Display name").fill("Profile User Updated");
  await page.getByPlaceholder("Bio").fill("Typing through scripture with maps.");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByPlaceholder("Display name")).toHaveValue("Profile User Updated");
  await expect(page.getByPlaceholder("Bio")).toHaveValue("Typing through scripture with maps.");
  await expect(page.getByPlaceholder("Avatar image URL")).toHaveCount(0);
});

test("typing page redirects unauthenticated users", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/");

  await page.waitForURL("**/auth/sign-in");
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
