import { expect, test } from "@playwright/test";

test("shows an accessible login form", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Login" })).toBeEnabled();
  await expect(page.getByRole("link", { name: "Register" })).toHaveAttribute(
    "href",
    "/register",
  );
});
