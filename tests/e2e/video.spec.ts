import { test, expect } from "@playwright/test";

test.describe("Video Creation", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill("test@example.com");
    await page.getByPlaceholder("••••••••").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("should navigate to create page", async ({ page }) => {
    await page.getByRole("link", { name: "Create New Video" }).click();
    await expect(page).toHaveURL(/\/dashboard\/create$/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("should show progress tracker", async ({ page }) => {
    await page.goto("/dashboard/create");
    await expect(page.getByText("Topic")).toBeVisible();
    await expect(page.getByText("Script")).toBeVisible();
    await expect(page.getByText("Generate")).toBeVisible();
  });

  test("should toggle between faceless and avatar modes", async ({ page }) => {
    await page.goto("/dashboard/create");

    // Default is faceless
    await expect(page.getByLabel("Faceless (Stock Footage)")).toBeChecked();
    await expect(page.getByLabel("AI Avatar")).not.toBeChecked();

    // Switch to avatar
    await page.getByLabel("AI Avatar").check();
    await expect(page.getByLabel("AI Avatar")).toBeChecked();

    // Avatar dropdown should appear
    await expect(page.getByText("Select Avatar")).toBeVisible();
    await expect(page.getByText("Select Voice (Optional)")).toBeVisible();
  });

  test("should generate script from topic", async ({ page }) => {
    await page.goto("/dashboard/create");

    await page.getByPlaceholder("e.g., 5 morning habits for productivity").fill("Benefits of drinking water");
    await page.getByRole("button", { name: "Generate Script" }).click();

    // Wait for generation
    await expect(page.getByText("Generating Script...")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Review & Edit Script" })).toBeVisible({ timeout: 30000 });

    // Script should be populated
    const scriptTextarea = page.getByPlaceholder("Your video script will appear here...");
    await expect(scriptTextarea).not.toBeEmpty();
  });

  test("should edit script and create video", async ({ page }) => {
    await page.goto("/dashboard/create");

    await page.getByPlaceholder("e.g., 5 morning habits for productivity").fill("Benefits of drinking water");
    await page.getByRole("button", { name: "Generate Script" }).click();
    await expect(page.getByRole("heading", { name: "Review & Edit Script" })).toBeVisible({ timeout: 30000 });

    // Edit script
    await page.getByPlaceholder("Your video script will appear here...").fill("This is a test script for video creation.");

    // Create video
    await page.getByRole("button", { name: "Create Video" }).click();
    await expect(page.getByText("Creating Video...")).toBeVisible();

    // Should redirect to generating state
    await expect(page.getByRole("heading", { name: "Creating Your Video" })).toBeVisible();
  });

  test("should regenerate script", async ({ page }) => {
    await page.goto("/dashboard/create");

    await page.getByPlaceholder("e.g., 5 morning habits for productivity").fill("Benefits of drinking water");
    await page.getByRole("button", { name: "Generate Script" }).click();
    await expect(page.getByRole("heading", { name: "Review & Edit Script" })).toBeVisible({ timeout: 30000 });

    const originalScript = await page.getByPlaceholder("Your video script will appear here...").inputValue();

    await page.getByRole("button", { name: "Regenerate" }).click();
    await expect(page.getByRole("heading", { name: "What's your video about?" })).toBeVisible();

    // Generate again
    await page.getByRole("button", { name: "Generate Script" }).click();
    await expect(page.getByRole("heading", { name: "Review & Edit Script" })).toBeVisible({ timeout: 30000 });

    const newScript = await page.getByPlaceholder("Your video script will appear here...").inputValue();
    expect(newScript).not.toBe(originalScript);
  });

  test("should show credit error when out of credits", async ({ page }) => {
    // Assume test user has 0 credits
    await page.goto("/dashboard/create");
    await page.getByPlaceholder("e.g., 5 morning habits for productivity").fill("Benefits of drinking water");
    await page.getByRole("button", { name: "Generate Script" }).click();

    await expect(page.getByText("You have no credits left. Please upgrade your plan.")).toBeVisible();
    await expect(page).toHaveURL("/dashboard/billing");
  });

  test("should navigate back to dashboard from create page", async ({ page }) => {
    await page.goto("/dashboard/create");
    await page.getByRole("link", { name: "Dashboard" }).first().click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("should display video in dashboard after creation", async ({ page }) => {
    await page.goto("/dashboard");
    const videoCards = page.locator(".grid > div");
    await expect(videoCards.first()).toBeVisible();
  });
});