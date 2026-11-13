// Optional browser acceptance for the four-page SFI site and OCS-style top navigation.
// Use the existing isolated phase1_local.py API, never production accounts/data.
const { chromium } = require(process.env.SFI_PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const site = process.env.SFI_UI_URL || "http://localhost:4600";
const api = process.env.SFI_UI_API || "http://localhost:8427";
const output = path.resolve("docs/ui-overhaul");
const report = {
  checks: [],
  layouts: [],
  accessibility: [],
  errors: [],
  screenshots: [],
};
const check = (message) => {
  report.checks.push(message);
  console.log("PASS", message);
};
const pages = ["/", "/sfi-specs/", "/history/", "/contact/", "/login/"];
const labels = ["Home", "Spec Search", "History", "Contact & Location"];
let browser;
(async () => {
  try {
    assert.match(api, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
    browser = await chromium.launch({
      executablePath: process.env.SFI_CHROMIUM,
      headless: true,
      args: ["--no-sandbox"],
    });
    const context = await browser.newContext();
    assert.equal(
      (await (await context.request.get(api + "/api/sfi/health")).json()).mode,
      "isolated-local-catalog",
    );
    await context.route("**/assets/js/sfi/api-base.js", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: `window.SFI_API_BASE=${JSON.stringify(api)};`,
      }),
    );
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    const idle = () =>
      page.waitForFunction(
        () =>
          document.getElementById("sfiResults")?.getAttribute("aria-busy") ===
          "false",
      );
    const go = async (route) => {
      assert.equal((await page.goto(site + route)).status(), 200);
      await page.waitForSelector("#navLinks a");
      if (route.startsWith("/sfi-specs/")) await idle();
    };
    const search = async (value) => {
      await page.locator("#sfiSearch").fill(value);
      await page.locator("#sfiSearch").press("Enter");
      await idle();
    };
    const screenshot = async (name) => {
      await page.screenshot({
        path: path.join(output, "screenshots", name),
        animations: "disabled",
      });
      report.screenshots.push(name);
    };
    for (const [width, height] of [
      [1440, 900],
      [1024, 768],
      [768, 1024],
      [390, 844],
      [320, 720],
    ]) {
      await page.setViewportSize({ width, height });
      for (const route of pages) {
        await go(route);
        assert.deepEqual(
          (await page.locator("#navLinks a").allTextContents()).map((x) =>
            x.trim(),
          ),
          labels,
        );
        assert.deepEqual(
          await page
            .locator("link[rel=stylesheet]")
            .evaluateAll((nodes) => nodes.map((x) => new URL(x.href).pathname)),
          ["/assets/css/sfi.css"],
        );
        assert.equal(
          await page.locator('script[src$="/ocs-menu.js"]').count(),
          0,
        );
        assert.equal(
          await page
            .locator(
              ".site-header,.sfi-nav,.sfi-hero,.sfi-home-search,#chatFab",
            )
            .count(),
          0,
        );
        assert.equal(await page.locator("h1").count(), 1);
        const dimensions = await page.evaluate(() => ({
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
        }));
        report.layouts.push({ route, ...dimensions });
        assert.ok(
          dimensions.scrollWidth <= width,
          `${route} overflows at ${width}`,
        );
        assert.equal(
          await page.locator("#navToggle,dialog,.opencs-drawer").count(),
          0,
        );
        assert.ok(await page.locator("#navLinks a").first().isVisible());
        if (width >= 1024) {
          const positions = await page
            .locator("#navLinks a")
            .evaluateAll((nodes) =>
              nodes.map((n) => n.getBoundingClientRect().top),
            );
          assert.ok(
            positions.every((y) => Math.abs(y - positions[0]) < 2),
            "desktop navigation remains in one top row",
          );
          assert.ok((await page.locator("#navLinks").boundingBox()).y < 80);
        }
        if ([1440, 1024, 390].includes(width)) {
          const name = {
            "/": "home",
            "/sfi-specs/": "specifications",
            "/history/": "history",
            "/contact/": "contact",
          }[route];
          if (name) await screenshot(`after-${name}-${width}.png`);
        }
        if (process.env.SFI_AXE_SOURCE && [1440, 390, 320].includes(width)) {
          await page.addScriptTag({ path: process.env.SFI_AXE_SOURCE });
          const result = await page.evaluate(() =>
            axe.run(document, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
              },
            }),
          );
          report.accessibility.push({
            route,
            width,
            violations: result.violations.map((v) => ({
              id: v.id,
              nodes: v.nodes.map((n) => n.target),
            })),
          });
        }
      }
      check(
        `four public pages and account access at ${width}×${height}: visible top navigation, no side drawer, no theme CSS or overflow`,
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await go("/");
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .locator(".sfi-skip-link")
        .evaluate((x) => x === document.activeElement),
      true,
    );
    await page.keyboard.press("Enter");
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "sfi-main",
    );
    await screenshot("after-mobile-navigation.png");
    await page.getByRole("link", { name: "History", exact: true }).click();
    await page.waitForURL(site + "/history/");
    assert.match(await page.locator("h1").innerText(), /History/);
    assert.equal(
      await page.locator("#navLinks [aria-current=page]").innerText(),
      "History",
    );
    await go("/contact/");
    assert.equal(await page.locator("address").count(), 1);
    assert.match(
      await page.locator("address").innerText(),
      /15708 Pomerado Road/,
    );
    assert.equal(
      await page.locator('a[href*="google.com/maps/search/"]').count(),
      1,
    );
    check(
      "keyboard skip and top-link navigation; standalone History and verified Contact & Location",
    );
    await go("/sfi-specs/");
    const all = await (
      await context.request.get(api + "/api/sfi/specs")
    ).json();
    const ids = [];
    do {
      ids.push(
        ...(await page
          .locator("#sfiResults article")
          .evaluateAll((nodes) =>
            nodes.map((n) => n.getAttribute("aria-label")),
          )),
      );
      if (await page.locator("#sfiNext").isDisabled()) break;
      await page.locator("#sfiNext").click();
      await idle();
    } while (ids.length < 1000);
    assert.equal(ids.length, all.length);
    assert.equal(new Set(ids).size, all.length);
    await page.locator("#sfiPrevious").click();
    await idle();
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "sfiCount",
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("/sfi-specs/");
    const cats = await (
      await context.request.get(api + "/api/sfi/categories")
    ).json();
    for (const category of cats) {
      await page
        .locator("#sfiFilters")
        .getByRole("button", { name: category, exact: true })
        .click();
      await idle();
      assert.ok((await page.locator("#sfiResults article").count()) > 0);
    }
    await page.locator("#sfiClear").click();
    await idle();
    assert.equal(
      await page
        .locator("#sfiFilters [aria-pressed=true]")
        .getAttribute("data-category"),
      "all",
    );
    for (const term of [
      "16.1",
      "20.1/1",
      "20.1/2",
      "Driver Restraint",
      "HaRnEsS",
    ]) {
      await search(term);
      assert.ok((await page.locator("#sfiResults article").count()) > 0);
    }
    await search("16.1");
    assert.equal(await page.locator("#sfiResults a").count(), 1);
    for (const term of ["20.1/1", "20.1/2", "10.1G"]) {
      await search(term);
      assert.equal(await page.locator("#sfiResults a").count(), 0);
    }
    await search("unmatchable-qa-query-991");
    assert.equal(await page.locator("#sfiNoResults").isVisible(), true);
    await page.route("**/api/sfi/specs**", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: "{}",
      }),
    );
    await search("16.1");
    assert.equal(await page.locator("#sfiRetry").isVisible(), true);
    await page.unroute("**/api/sfi/specs**");
    await page.locator("#sfiRetry").click();
    await idle();
    assert.equal(await page.locator("#sfiResults a").count(), 1);
    check(
      `real specification search, all ${all.length} canonical identities, categories, pagination, PDF gating, empty/error/retry`,
    );
    for (const [old, target] of [
      ["/about/", "/"],
      ["/services/", "/"],
      ["/news-events/", "/contact/"],
      ["/search/", "/sfi-specs/"],
      ["/navigation/blogs/", "/"],
      ["/home.html", "/"],
      ["/home-legacy.html", "/"],
      ["/specs/", "/sfi-specs/"],
    ]) {
      await page.goto(site + old);
      await page.waitForURL(site + target);
    }
    await page.goto(site + "/search/?q=16.1");
    await page.waitForURL(site + "/sfi-specs/?q=16.1");
    await idle();
    assert.equal(await page.locator("#sfiSearch").inputValue(), "16.1");
    check(
      "blog/general search and retired pages redirect; spec query handoff preserved",
    );
    await context.request.post(api + "/local-demo/", {
      form: { role: "User" },
      maxRedirects: 0,
    });
    await go("/sfi-specs/");
    assert.equal(await page.locator("#adminView").isVisible(), false);
    await context.request.post(api + "/local-demo/", {
      form: { role: "Admin" },
      maxRedirects: 0,
    });
    await go("/sfi-specs/");
    await page.waitForSelector("#adminView:not(.sfi__hidden)");
    await page.waitForFunction(
      () => document.querySelectorAll("#adminTableBody tr").length > 1,
    );
    await page.locator("#viewPublicBtn").click();
    assert.equal(await page.locator("#publicView").isVisible(), true);
    await page.locator("#backToAdminBtn").click();
    assert.equal(await page.locator("#adminView").isVisible(), true);
    check("member/admin separation and existing administration view preserved");
    const noJs = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 320, height: 720 },
    });
    const fallback = await noJs.newPage();
    await fallback.goto(site + "/");
    assert.equal(await fallback.locator("#navLinks").isVisible(), true);
    assert.deepEqual(
      (await fallback.locator("#navLinks a").allTextContents()).map((x) =>
        x.trim(),
      ),
      labels,
    );
    await noJs.close();
    assert.deepEqual(report.errors, []);
    if (report.accessibility.length)
      assert.equal(
        report.accessibility.reduce((n, r) => n + r.violations.length, 0),
        0,
      );
    check(
      `no-JavaScript menu fallback; zero page exceptions; ${report.accessibility.length} axe scans with zero violations`,
    );
  } catch (error) {
    report.failure = error.stack;
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    fs.writeFileSync(
      path.join(output, "browser-results.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
  }
})();
