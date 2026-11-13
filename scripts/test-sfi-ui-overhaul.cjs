// Optional browser QA: provide Playwright/axe module paths, two built-site servers,
// and an isolated scripts/phase1_local.py API with --demo-accounts. Never use a
// production API: admin mutations below create/archive fictional QA records.
const { chromium } = require(process.env.SFI_PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const url = process.env.SFI_UI_URL || "http://localhost:4000";
const baseline = process.env.SFI_UI_BASELINE || "http://localhost:4100";
const api = process.env.SFI_UI_API || "http://localhost:8427";
const output = path.resolve("docs/ui-overhaul");
const functionalOnly = process.env.SFI_UI_FUNCTIONAL_ONLY === "1";
const sampleNumber = "98.771/" + ((Date.now() % 999) + 1);
const report = {
  checks: [],
  layouts: [],
  accessibility: [],
  errors: [],
  screenshots: [],
};
const check = (name) => {
  report.checks.push(name);
  console.log("PASS", name);
};
const sizes = [
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [320, 720],
];
let browser;
(async () => {
  try {
    assert.match(api, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
    browser = await chromium.launch({
      headless: true,
      executablePath: process.env.SFI_CHROMIUM,
      args: ["--no-sandbox"],
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const health = await context.request.get(api + "/api/sfi/health");
    assert.equal(health.status(), 200);
    assert.equal((await health.json()).mode, "isolated-local-catalog");
    await context.route("**/assets/js/sfi/api-base.js", (r) =>
      r.fulfill({
        contentType: "text/javascript",
        body: `window.SFI_API_BASE=${JSON.stringify(api)};`,
      }),
    );
    const page = await context.newPage();
    page.on("pageerror", (e) => report.errors.push(e.message));
    const idle = () =>
      page.waitForFunction(
        () =>
          document.getElementById("sfiResults")?.getAttribute("aria-busy") ===
          "false",
      );
    const go = async (route) => {
      assert.equal((await page.goto(url + route)).status(), 200);
      if (route.startsWith("/sfi-specs/")) await idle();
    };
    const search = async (query) => {
      await page.locator("#sfiSearch").fill(query);
      await page.locator("#sfiSearch").press("Enter");
      await idle();
    };
    const shot = async (name) => {
      await page.screenshot({
        path: path.join(output, "screenshots", name),
        animations: "disabled",
      });
      report.screenshots.push(name);
    };
    // The baseline must contain the original 10 links and old homepage copy.
    for (const width of functionalOnly ? [] : [1440, 390]) {
      await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
      await page.goto(baseline + "/");
      assert.match(await page.locator("h1").innerText(), /Welcome to/);
      assert.equal(await page.locator("#navLinks li").count(), 10);
      report.layouts.push({
        version: "before",
        route: "/",
        width,
        ...(await page.evaluate(() => ({
          height: document.documentElement.scrollHeight,
          scrollWidth: document.documentElement.scrollWidth,
        }))),
      });
      await shot(`before-home-${width}.png`);
      await page.goto(baseline + "/sfi-specs/");
      await idle();
      await shot(`before-specifications-${width}.png`);
      if (width === 390) {
        await page.locator("#navToggle").click();
        await shot("before-mobile-navigation.png");
      }
    }
    if (!functionalOnly)
      check("before screenshots use isolated, unchanged main source");
    for (const [width, height] of functionalOnly ? [] : sizes) {
      await page.setViewportSize({ width, height });
      for (const route of [
        "/",
        "/sfi-specs/",
        "/about/",
        "/services/",
        "/news-events/",
        "/login/",
      ]) {
        await go(route);
        const layout = await page.evaluate(() => ({
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
          header: document.querySelector(".sfi-nav").getBoundingClientRect()
            .height,
        }));
        report.layouts.push({ version: "after", route, ...layout });
        assert.ok(
          layout.scrollWidth <= width,
          `${route} overflows at ${width}: ${layout.scrollWidth}`,
        );
        assert.equal(await page.locator("h1").count(), 1, route);
        assert.deepEqual(
          (await page.locator("#navLinks a").allTextContents()).map((x) =>
            x.trim(),
          ),
          ["About", "Specifications", "Services", "News & Contact", "Sign In"],
        );
        if (width === 1440)
          assert.ok(layout.header >= 60 && layout.header <= 72);
        if (route === "/sfi-specs/") {
          assert.ok(
            (await page.locator("#sfiSearch").boundingBox()).y < height * 0.6,
            "search immediately visible",
          );
          assert.equal(await page.locator("#adminView").isVisible(), false);
        }
        if (
          (width === 1440 || width === 390) &&
          (route === "/" || route === "/sfi-specs/")
        )
          await shot(
            `after-${route === "/" ? "home" : "specifications"}-${width}.png`,
          );
        if (process.env.SFI_AXE_SOURCE && [1440, 390, 320].includes(width)) {
          await page.addScriptTag({ path: process.env.SFI_AXE_SOURCE });
          const scan = await page.evaluate(() =>
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
            violations: scan.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.map((n) => ({
                target: n.target,
                summary: n.failureSummary,
              })),
            })),
          });
        }
      }
      check(
        `six public routes fit ${width}×${height}; heading/navigation/search checks`,
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await go("/");
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .locator(".sfi-skip-link")
        .evaluate((n) => n === document.activeElement),
      true,
    );
    await page.keyboard.press("Enter");
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "sfi-main",
    );
    await page.locator("#navToggle").focus();
    await page.keyboard.press("Enter");
    assert.equal(
      await page.locator("#navToggle").getAttribute("aria-expanded"),
      "true",
    );
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement.textContent.trim()),
      "About",
    );
    await shot("after-mobile-navigation.png");
    await page.keyboard.press("Escape");
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "navToggle",
    );
    assert.equal(await page.locator("#navLinks").isVisible(), false);
    await page.locator("#navToggle").click();
    await page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "Specifications", exact: true })
      .click();
    await idle();
    assert.equal(
      await page.locator("#navToggle").getAttribute("aria-expanded"),
      "false",
    );
    check(
      "keyboard skip link, mobile menu toggle, Tab order, Escape focus return and link closure",
    );
    // Real Chromium page zoom (equivalent effective CSS viewport 720×450 at 200%).
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("/sfi-specs/");
    const client = await context.newCDPSession(page);
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 720,
      height: 450,
      deviceScaleFactor: 2,
      mobile: false,
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await search("16.1");
    assert.equal(await page.locator("#sfiResults article").count(), 1);
    await client.send("Emulation.clearDeviceMetricsOverride");
    check("200% zoom-equivalent reflow preserves search and avoids overflow");
    await go("/");
    const query = "driver suit & restraints <test>";
    await page.locator("#homeQuery").fill(query);
    await page.locator(".sfi-home-search button").click();
    await idle();
    assert.equal(new URL(page.url()).searchParams.get("q"), query);
    assert.equal(await page.locator("#sfiSearch").inputValue(), query);
    check("homepage GET query safely reaches canonical search");
    const catalog = await (
      await context.request.get(api + "/api/sfi/specs")
    ).json();
    await search("");
    const identities = [];
    do {
      identities.push(
        ...(await page
          .locator("#sfiResults article")
          .evaluateAll((nodes) =>
            nodes.map((n) => n.getAttribute("aria-label")),
          )),
      );
      if (await page.locator("#sfiNext").isDisabled()) break;
      await page.locator("#sfiNext").click();
      await idle();
    } while (identities.length < 1000);
    assert.equal(identities.length, catalog.length);
    assert.equal(new Set(identities).size, catalog.length);
    await page.locator("#sfiPrevious").click();
    await idle();
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "sfiCount",
    );
    check(
      `pagination browses all ${catalog.length} canonical identities with no duplicate results`,
    );
    const categories = await (
      await context.request.get(api + "/api/sfi/categories")
    ).json();
    for (const category of categories) {
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
    await page.locator("#catGrid button").first().click();
    await idle();
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "sfiSearch",
    );
    await page.locator("#sfiClear").click();
    await idle();
    check(
      "all backend category filters, category browsing, focus return and reset",
    );
    for (const q of [
      "16.1",
      "20.1/1",
      "20.1/2",
      "Driver Restraint",
      "HaRnEsS",
      "restra",
    ]) {
      await search(q);
      assert.ok((await page.locator("#sfiResults article").count()) > 0);
    }
    await search("16.1");
    assert.equal(await page.locator("#sfiResults a").count(), 1);
    const approved = await page.locator("#sfiResults a").getAttribute("href");
    assert.match(
      approved,
      /^https:\/\/(www\.)?sfifoundation.com\/wp-content\/.+\.pdf$/i,
    );
    if (process.env.SFI_UI_FETCH_PDF === "1") {
      const pdf = await context.request.get(approved);
      assert.equal(pdf.status(), 200);
      assert.equal((await pdf.body()).subarray(0, 5).toString(), "%PDF-");
      const opened = context.waitForEvent("page");
      await page.locator("#sfiResults a").click();
      const popup = await opened;
      await popup.waitForURL(approved, { waitUntil: "commit" });
      await popup.close();
      check(
        "approved specification opens its official PDF in a new tab; HTTP 200 and PDF bytes",
      );
    }
    for (const q of ["20.1/1", "20.1/2", "10.1G"]) {
      await search(q);
      assert.equal(await page.locator("#sfiResults a").count(), 0);
    }
    await search("unmatchable-qa-query-991");
    assert.equal(await page.locator("#sfiNoResults").isVisible(), true);
    check(
      "exact, qualified, product, mixed-case and partial queries; approved PDF only; unavailable PDFs and empty state",
    );
    await page.route("**/api/sfi/specs**", (r) =>
      r.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
    );
    await search("16.1");
    assert.equal(await page.locator("#sfiRetry").isVisible(), true);
    assert.match(
      await page.locator("#sfiCount").innerText(),
      /could not be loaded/,
    );
    await page.unroute("**/api/sfi/specs**");
    await page.locator("#sfiRetry").click();
    await idle();
    assert.equal(await page.locator("#sfiResults a").count(), 1);
    check("service failure and retry are accessible and recover");
    // Simulate a newly revoked response; never modify a real specification.
    const record = catalog.find((x) => x.spec_number === "16.1");
    await page.route("**/api/sfi/specs/search?**", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          items: [{ ...record, document_status: "rejected" }],
          total: 1,
        }),
      }),
    );
    await search("16.1");
    assert.equal(await page.locator("#sfiResults a").count(), 0);
    assert.match(
      await page.locator("#sfiResults").innerText(),
      /Rejected or mismatched/,
    );
    await page.unroute("**/api/sfi/specs/search?**");
    check(
      "revoked status suppresses a previously approved URL (controlled response regression)",
    );
    for (const [old, target] of [
      ["/history/", "/about/#history"],
      ["/specs/", "/sfi-specs/"],
      ["/contact/", "/news-events/#contact"],
    ]) {
      await page.goto(url + old);
      await page.waitForURL(url + target);
      assert.equal(
        await page.locator("link[rel=canonical]").getAttribute("href"),
        "https://sfi.opencodingsociety.com" + target.split("#")[0],
      );
    }
    await page.goto(url + "/specs/?q=16.1");
    await page.waitForURL(url + "/sfi-specs/?q=16.1");
    await idle();
    assert.equal(await page.locator("#sfiSearch").inputValue(), "16.1");
    check(
      "legacy redirects resolve once, preserve query strings and have destination canonicals",
    );
    await go("/");
    assert.equal(await page.locator("#chatInput").isVisible(), false);
    await page.locator("#chatFab").click();
    assert.equal(
      await page.locator("#chatFab").getAttribute("aria-expanded"),
      "true",
    );
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "chatInput",
    );
    assert.equal(
      await page
        .locator("#chatInput")
        .evaluate((n) => getComputedStyle(n).outlineColor),
      "rgb(26, 95, 168)",
    );
    await page.route("**/api/sfi/chat", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          reply: '**Safe reply** <img src=x onerror="window.unsafeChat=true">',
        }),
      }),
    );
    await page.locator("#chatInput").fill("Synthetic formatting check");
    await page.locator("#chatSend").click();
    await page.waitForSelector("#chatMessages b");
    assert.equal(await page.locator("#chatMessages img").count(), 0);
    assert.equal(await page.evaluate(() => window.unsafeChat), undefined);
    await page.keyboard.press("Escape");
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "chatFab",
    );
    assert.equal(await page.locator("#chatWindow").isVisible(), false);
    await page.unroute("**/api/sfi/chat");
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await page
        .locator("#chatFab")
        .evaluate((n) => getComputedStyle(n).animationName),
      "none",
    );
    check(
      "footer assistant stays out of results, closed controls are unfocusable, Escape returns focus, replies are escaped and reduced motion is respected",
    );
    const noJs = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const fallback = await noJs.newPage();
    await fallback.goto(url + "/");
    assert.equal(await fallback.locator("#navLinks").isVisible(), true);
    assert.equal(await fallback.locator("#navToggle").isVisible(), false);
    await noJs.close();
    check("mobile navigation remains usable without JavaScript");
    const write = () =>
      context.request.post(api + "/api/sfi/specs", {
        data: {
          spec_number: sampleNumber,
          product_name: "Fictional UI QA",
          category: "QA",
        },
      });
    assert.equal((await write()).status(), 401);
    await context.request.post(api + "/local-demo/", {
      form: { role: "User" },
      maxRedirects: 0,
    });
    await go("/sfi-specs/");
    assert.equal(await page.locator("#adminView").isVisible(), false);
    assert.equal((await write()).status(), 403);
    await context.request.post(api + "/local-demo/", {
      form: { role: "Admin" },
      maxRedirects: 0,
    });
    await go("/sfi-specs/");
    await page.waitForSelector("#adminView:not(.sfi__hidden)");
    await page.waitForFunction(
      () => document.querySelectorAll("#adminTableBody tr").length > 1,
    );
    await page.getByRole("button", { name: "Save spec", exact: true }).click();
    assert.match(await page.locator("#adminMsg").innerText(), /required/);
    await page
      .getByLabel("Product name", { exact: true })
      .fill("Fictional UI QA");
    await page.getByLabel("Spec number", { exact: true }).fill(sampleNumber);
    await page.getByLabel("Category", { exact: true }).fill("QA");
    await page.getByRole("button", { name: "Save spec", exact: true }).click();
    await page.waitForFunction(
      () => document.getElementById("adminMsg").textContent === "Spec created",
    );
    const row = page
      .locator("#adminTableBody tr")
      .filter({ hasText: "SFI " + sampleNumber });
    await row.getByRole("button", { name: "Edit", exact: true }).click();
    await page.waitForFunction(
      (number) => document.getElementById("fSpecNum").value === number,
      sampleNumber,
    );
    await page
      .getByLabel("Product name", { exact: true })
      .fill("Fictional UI QA edited");
    await page.getByRole("button", { name: "Save spec", exact: true }).click();
    await page.waitForFunction(
      () => document.getElementById("adminMsg").textContent === "Spec updated",
    );
    page.once("dialog", (d) => d.accept());
    await row.getByRole("button", { name: "Archive", exact: true }).click();
    await page.waitForFunction(() =>
      document.getElementById("adminMsg").textContent.includes("archived"),
    );
    await page.getByLabel("Show archived specifications").check();
    await row.getByRole("button", { name: "Restore", exact: true }).waitFor();
    page.once("dialog", (d) => d.accept());
    await row.getByRole("button", { name: "Restore", exact: true }).click();
    await page.waitForFunction(() =>
      document.getElementById("adminMsg").textContent.includes("restored"),
    );
    await page
      .getByRole("button", { name: "View as public", exact: true })
      .click();
    assert.equal(await page.locator("#publicView").isVisible(), true);
    await page.locator("#backToAdminBtn").click();
    assert.equal(await page.locator("#adminView").isVisible(), true);
    await page.getByRole("tab", { name: "Explore", exact: true }).click();
    assert.equal(await page.locator("#catGrid").isVisible(), true);
    check(
      "real anonymous/member writes denied; synthetic admin validation, create, edit, archive, restore and view switching",
    );
    const synthetic = await (
      await context.request.get(
        api + "/api/sfi/specs/search?q=" + encodeURIComponent(sampleNumber),
      )
    ).json();
    assert.equal(
      (
        await context.request.delete(
          api + "/api/sfi/specs/" + synthetic[0].id,
          { data: { confirm_canonical_id: sampleNumber } },
        )
      ).status(),
      200,
    );
    assert.deepEqual(report.errors, []);
    check("zero page exceptions");
    if (report.accessibility.length) {
      assert.equal(
        report.accessibility.reduce((n, x) => n + x.violations.length, 0),
        0,
        "axe violations (see browser-results.json)",
      );
      check(
        `${report.accessibility.length} WCAG A/AA automated accessibility scans: zero violations`,
      );
    }
  } catch (e) {
    report.failure = e.stack;
    console.error(e);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    fs.writeFileSync(
      path.join(
        output,
        functionalOnly ? "functional-results.json" : "browser-results.json",
      ),
      JSON.stringify(report, null, 2) + "\n",
    );
  }
})();
