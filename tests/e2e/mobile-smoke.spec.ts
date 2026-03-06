import path from "node:path";

import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const uploadFile = path.join(process.cwd(), "tests", "fixtures", "upload.png");

test("guest mobile flow uploads once, creates a stable verified result link, and opens leaderboard", async ({ page, request }) => {
  await page.addInitScript(() => {
    (window as Window & { __scavengDisableWebShare?: boolean }).__scavengDisableWebShare = true;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as Window & { __copiedShareText?: string }).__copiedShareText = text;
        }
      }
    });
  });

  const invalidResultResponse = await request.get("/result/not-a-real-share");
  expect(invalidResultResponse.status()).toBe(404);

  await page.goto("/?state=live");

  await expect(page.getByText("Upload your photo")).toBeVisible();
  await page.setInputFiles('input[type="file"]', uploadFile);

  await expect(page.getByText("You're in!")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/Results appear the moment the window closes/)).toBeVisible();

  const currentPayload = await page.evaluate(async () => {
    const response = await fetch("/api/current-hunt?state=live");
    return response.json();
  });
  expect(currentPayload.submission?.verificationStatus).toBe("needs_manual_review");

  const duplicatePayload = await page.evaluate(async () => {
    const response = await fetch("/api/submissions/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        huntId: "hunt-today",
        fileName: "upload.png",
        fileSize: 68
      })
    });
    return response.json();
  });
  expect(duplicatePayload.alreadySubmitted).toBe(true);

  await page.getByPlaceholder("your@email.com").fill("mobile-player@example.com");
  await page.getByRole("button", { name: "Remind me" }).click();
  await expect(page.getByText("Morning reminder enabled.")).toBeVisible();

  await page.goto("/?state=results-out");
  await expect(page.getByTestId("result-share-card")).toBeVisible();
  await expect(page.getByText(/place/)).toBeVisible();

  await page.getByTestId("share-result-button").click();
  await expect(page.getByText("Share text copied.")).toBeVisible();
  const firstShareText = await page.evaluate(() => (window as Window & { __copiedShareText?: string }).__copiedShareText ?? "");
  expect(firstShareText).toContain("scaveng.io");
  expect(firstShareText).toContain("Today's hunt:");
  const firstShareUrl = firstShareText.trim().split("\n").at(-1) ?? "";
  expect(firstShareUrl).toContain("/result/");

  await page.getByTestId("share-result-button").click();
  const secondShareText = await page.evaluate(() => (window as Window & { __copiedShareText?: string }).__copiedShareText ?? "");
  const secondShareUrl = secondShareText.trim().split("\n").at(-1) ?? "";
  expect(secondShareUrl).toBe(firstShareUrl);

  await page.goto(new URL(firstShareUrl).pathname);
  await expect(page.getByText("Verified result")).toBeVisible();
  await expect(page.getByText("Find a blonde dog")).toBeVisible();
  await expect(page.locator("img.result-photo")).toBeVisible();

  await page.goto("/?state=results-out");
  await page.getByRole("link", { name: "All-time leaderboard" }).click();
  await expect(page).toHaveURL(/\/leaderboard$/);
  await expect(page.getByText("Leaderboard")).toBeVisible();
});

test("history page explains that guests need an account", async ({ page }) => {
  await page.goto("/history");
  await expect(page.getByText("Your hunt history")).toBeVisible();
  await expect(page.getByText("Sign in to save your history")).toBeVisible();
});

test("admin route redirects unauthenticated users to the unlock screen", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/unlock$/);
  await expect(page.getByRole("heading", { name: "Admin access" })).toBeVisible();
});

test("results cron publishes due hunts after the internal pending state", async ({ request }) => {
  const soonResponse = await request.get("/api/current-hunt?state=results-soon");
  expect(soonResponse.ok()).toBeTruthy();
  const soonPayload = await soonResponse.json();
  expect(soonPayload.homeState).toBe("results-soon");

  const publishResponse = await request.post("/api/cron/results/publish");
  expect(publishResponse.ok()).toBeTruthy();
  const publishPayload = await publishResponse.json();
  expect(publishPayload.published).toEqual([
    {
      huntId: "hunt-today",
      publishedCount: 5
    }
  ]);

  const currentResponse = await request.get("/api/current-hunt");
  expect(currentResponse.ok()).toBeTruthy();
  const currentPayload = await currentResponse.json();
  expect(currentPayload.homeState).toBe("results-out");
});