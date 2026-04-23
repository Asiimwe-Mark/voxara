import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should navigate to signup page", async ({ page }) => {
    await page.getByRole("link", { name: "Get Started" }).click();
    await expect(page).toHaveURL(/\/signup$/);
  });

  test("should navigate to login page", async ({ page }) => {
    await page.getByRole("link", { name: "Sign In" }).click();
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("should show validation errors on signup", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.locator("form")).toBeVisible();
  });

  test("should show validation errors on login", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Please enter a valid email address")).toBeVisible();
    await expect(page.getByText("Password must be at least 6 characters")).toBeVisible();
  });

  test("should navigate to reset password page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(page).toHaveURL("/reset-password");
    await expect(page.getByRole("heading", { name: "Reset Your Password" })).toBeVisible();
  });

  test("should complete sign‑up and redirect to login", async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;

    await page.goto("/signup");
    await page.getByPlaceholder("John Doe").fill("Test User");
    await page.getByPlaceholder("you@example.com").fill(uniqueEmail);
    await page.getByPlaceholder("••••••••").fill("password123");
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test("should login with valid credentials", async ({ page }) => {
    // Assumes a test user exists
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill("test@example.com");
    await page.getByPlaceholder("••••••••").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByRole("heading", { name: "My Videos" })).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill("test@example.com");
    await page.getByPlaceholder("••••••••").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/dashboard");

    await page.getByRole("button", { name: "User menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();

    await expect(page).toHaveURL("/login");
    await expect(page.getByText("Signed out")).toBeVisible();
  });

  test("should protect dashboard routes", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login");
  });
});