// Focused interaction/visual checks for the new navigation and shared palette.
const { chromium } = require(process.env.SFI_PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const output = "docs/ui-polish";
const site = process.env.SFI_UI_URL || "http://localhost:4600";
const checks = [];
const scans = [];
let browser;
(async () => {
  try {
    browser = await chromium.launch({
      executablePath: process.env.SFI_CHROMIUM,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    const shot = (name) =>
      page.screenshot({
        path: `${output}/screenshots/${name}.png`,
        animations: "disabled",
      });
    const scan = async (name) => {
      await page.addScriptTag({ path: process.env.SFI_AXE_SOURCE });
      const result = await page.evaluate(() =>
        axe.run(document, {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
          },
        }),
      );
      scans.push({ name, violations: result.violations });
      if (result.violations.length)
        fs.writeFileSync(
          `${output}/state-failure.json`,
          JSON.stringify({ name, violations: result.violations }, null, 2),
        );
      assert.equal(result.violations.length, 0, name);
    };
    await page.goto(site);
    const toggle = page.locator("#navToggle");
    await toggle.focus();
    await page.keyboard.press("Space");
    assert.equal(await toggle.getAttribute("aria-expanded"), "true");
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement.textContent.trim()),
      "Home",
    );
    assert.equal(
      await page
        .locator("#navLinks a")
        .first()
        .evaluate((n) => getComputedStyle(n).outlineColor),
      "rgb(255, 255, 255)",
    );
    await scan("390px open navigation, keyboard focus");
    await shot("after-mobile-navigation-viewport");
    await page.keyboard.press("Escape");
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "navToggle",
    );
    await toggle.click();
    await page.locator("h1").click();
    assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    checks.push(
      "Mobile keyboard Space/Tab/Escape, visible white focus, outside-click closing, and open-menu accessibility",
    );
    for (const [name, url] of [
      ["home", "/"],
      ["specifications", "/sfi-specs/"],
      ["history", "/history/"],
      ["news-events", "/news-events/"],
      ["contact", "/contact/"],
      ["sign-in", "/login/"],
      ["create-account", "/login/#register"],
    ]) {
      await page.setViewportSize({ width: 720, height: 450 });
      await page.goto(site + url);
      if (url.startsWith("/login/"))
        await page.waitForFunction(
          () => typeof window.switchTab === "function",
        );
      if (name === "create-account") {
        await page.locator("#tabRegister").click();
        await page.locator("#regName").waitFor();
      }
      if (name === "specifications")
        await page.waitForFunction(
          () =>
            document.querySelector("#sfiResults").getAttribute("aria-busy") ===
            "false",
        );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.setViewportSize({ width: 390, height: 844 });
      await shot(`after-${name}-390-viewport`);
    }
    checks.push(
      "All seven views reflow at 720 CSS pixels (1440px/200% equivalent); 390px viewport screenshots",
    );
    await page.goto(site + "/login/");
    await page.waitForFunction(() => typeof window.doLogin === "function");
    const submit = page.locator("#loginBtn");
    assert.equal(
      await submit.evaluate((n) => getComputedStyle(n).backgroundColor),
      "rgb(36, 99, 155)",
    );
    assert.equal(
      await submit.evaluate((n) => getComputedStyle(n).color),
      "rgb(255, 255, 255)",
    );
    assert.equal(
      await submit.evaluate((n) => getComputedStyle(n).backgroundImage),
      "none",
    );
    assert.equal(
      await submit.evaluate((n) => getComputedStyle(n).transitionDuration),
      "0s",
    );
    await submit.click();
    await scan("390px Sign In validation");
    await shot("after-sign-in-error-390");
    await page.locator("#tabRegister").click();
    await page.locator("#regBtn").click();
    await scan("390px Create Account validation");
    await shot("after-create-account-error-390");
    // Exercise presentation with an isolated response; no account is created.
    await page.route("**/api/user", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: "{}",
      }),
    );
    let releaseAuthentication;
    const pendingAuthentication = new Promise((resolve) => {
      releaseAuthentication = resolve;
    });
    await page.route("**/api/authenticate", async (route) => {
      await pendingAuthentication;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: "{}",
      });
    });
    await page.locator("#regName").fill("Visual QA");
    await page.locator("#regUid").fill("visual-qa");
    await page.locator("#regPass").fill("visual-test-only");
    await page.locator("#regBtn").click();
    await page.locator(".auth-msg.success").waitFor();
    await scan("390px account-created success presentation (stubbed response)");
    await shot("after-create-account-success-390");
    releaseAuthentication();
    checks.push(
      "Blue/white submit, no gradient, reduced motion, validation and simulated account success presentation",
    );
    const ratio = (a, b) => {
      const lum = (s) => {
        const v = s
          .match(/\w\w/g)
          .map((x) => parseInt(x, 16) / 255)
          .map((x) =>
            x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4,
          );
        return v[0] * 0.2126 + v[1] * 0.7152 + v[2] * 0.0722;
      };
      const x = lum(a),
        y = lum(b);
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    const contrasts = [
      ["navy/white", "153F70", "FFFFFF", 4.5],
      ["blue/white", "24639B", "FFFFFF", 4.5],
      ["body/white", "273444", "FFFFFF", 4.5],
      ["muted/subtle", "536174", "F7F9FC", 4.5],
      ["input border/white", "7b8797", "FFFFFF", 3],
      ["error/tint", "b3321f", "fbe9e6", 4.5],
      ["success/tint", "1B6C3D", "e6f4ec", 4.5],
    ].map(([name, a, b, min]) => {
      const value = ratio(a, b);
      assert.ok(value >= min, name);
      return { name, ratio: +value.toFixed(2), minimum: min };
    });
    fs.writeFileSync(
      `${output}/state-results.json`,
      JSON.stringify({ checks, accessibility: scans, contrasts }, null, 2) +
        "\n",
    );
    checks.forEach((x) => console.log("PASS", x));
    console.log(
      `PASS ${scans.length} additional state accessibility scans and ${contrasts.length} contrast pairs`,
    );
  } finally {
    await browser?.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
