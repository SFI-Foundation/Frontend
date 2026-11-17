// Optional browser acceptance for page photography; uses existing Playwright/axe QA tooling.
const { chromium } = require(process.env.SFI_PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const site = process.env.SFI_UI_URL || "http://localhost:4600";
const output = path.resolve(
  process.env.SFI_PHOTO_OUTPUT || "qa-evidence/site-photography",
);
fs.mkdirSync(path.join(output, "screenshots"), { recursive: true });
const routes = [
  ["home", "/", ["hero", "safety"]],
  ["specifications", "/sfi-specs/", ["specs"]],
  ["history", "/history/", ["history"]],
  ["news-events", "/news-events/", ["news"]],
];
const report = {
  layouts: [],
  accessibility: [],
  loading: [],
  checks: [],
  errors: [],
};
let browser;
const shot = async (page, name, fullPage = true) =>
  page.screenshot({
    path: path.join(output, "screenshots", name),
    fullPage,
    animations: "disabled",
  });
const scan = async (page, name, width) => {
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
    name,
    width,
    violations: result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  });
  assert.equal(result.violations.length, 0, `${name} axe violations`);
};
(async () => {
  try {
    browser = await chromium.launch({
      executablePath: process.env.SFI_CHROMIUM,
      headless: true,
      args: ["--no-sandbox"],
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on("pageerror", (e) => report.errors.push(e.message));
    for (const [width, height] of [
      [1440, 900],
      [1024, 768],
      [768, 1024],
      [390, 844],
      [320, 720],
    ]) {
      await page.setViewportSize({ width, height });
      for (const [name, route, photos] of routes) {
        assert.equal((await page.goto(site + route)).status(), 200);
        if (name === "specifications")
          await page.waitForFunction(
            () =>
              document
                .querySelector("#sfiResults")
                ?.getAttribute("aria-busy") === "false",
          );
        assert.deepEqual(
          await page
            .locator("main [data-photograph]")
            .evaluateAll((ns) => ns.map((n) => n.dataset.photograph)),
          photos,
        );
        assert.equal(
          await page.locator(".opencs-bar img").count(),
          1,
          "navbar contains the SFI logo alone",
        );
        assert.match(
          await page.locator(".opencs-bar img").getAttribute("src"),
          /SFI-Logo\.png$/,
        );
        assert.equal(
          (await page.locator(".opencs-bar").boundingBox()).height,
          68,
        );
        for (const photo of photos) {
          const image = page.locator(`[data-photograph=${photo}] img`);
          assert.ok(
            (await image.getAttribute("alt")).length > 12,
            "meaningful photograph alt",
          );
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((n) => n.decode());
          assert.ok(
            await image.isVisible(),
            `${photo} remains visible at ${width}`,
          );
          assert.ok(
            await image.evaluate(
              (n) =>
                n.complete && n.naturalWidth > 0 && n.width > 0 && n.height > 0,
            ),
          );
          const url = await image.evaluate((n) => {
            const u = new URL(n.currentSrc);
            return { origin: u.origin, pathname: u.pathname };
          });
          assert.equal(
            url.origin,
            new URL(site).origin,
            "locally hosted image",
          );
          assert.match(url.pathname, /\/images\/sfi\/photography\/.*\.webp$/);
        }
        await page.evaluate(() => scrollTo(0, 0));
        const layout = await page.evaluate(() => ({
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
          heroHeight: document
            .querySelector(".sfi-home-hero")
            ?.getBoundingClientRect().height,
          searchBottom: document
            .querySelector("#sfiSearch")
            ?.getBoundingClientRect().bottom,
        }));
        assert.ok(layout.scrollWidth <= width, `${name} overflow at ${width}`);
        if (name === "home") {
          assert.equal(
            await page
              .locator("[data-photograph=hero] img")
              .getAttribute("fetchpriority"),
            "high",
          );
          assert.equal(
            await page
              .locator("[data-photograph=hero] img")
              .getAttribute("loading"),
            "eager",
          );
          assert.equal(
            await page
              .locator("[data-photograph=safety] img")
              .getAttribute("loading"),
            "lazy",
          );
          if (width >= 1024)
            assert.ok(
              layout.heroHeight >= 280 && layout.heroHeight <= 380,
              "compact desktop hero",
            );
        }
        if (name === "specifications") {
          const heading = await page.locator("h1").boundingBox();
          const photograph = await page
            .locator("[data-photograph=specs]")
            .boundingBox();
          assert.ok(
            heading.x + heading.width <= photograph.x ||
              photograph.x + photograph.width <= heading.x ||
              heading.y + heading.height <= photograph.y ||
              photograph.y + photograph.height <= heading.y,
            "heading and photo never overlap",
          );
        }
        if (name === "specifications")
          assert.ok(
            layout.searchBottom < height * 0.65,
            "search remains immediately visible",
          );
        report.layouts.push({ route, ...layout });
        await shot(
          page,
          `after-${name}-${width}.png`,
          name !== "specifications",
        );
      }
      await page.goto(site + "/photo-credits/");
      assert.equal(await page.locator("main article").count(), 5);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      for (const id of ["hero", "safety", "specs", "history", "news"])
        assert.equal(
          await page
            .locator(`#${id} a[href*="creativecommons.org/licenses/"]`)
            .count(),
          1,
        );
      if ([1440, 390, 320].includes(width))
        await scan(page, "Photography credits", width);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(site + "/");
    await page.locator("#navToggle").focus();
    await page.keyboard.press("Space");
    await scan(page, "Home with mobile menu open", 390);
    await shot(page, "after-mobile-navigation-390.png", false);
    await page.keyboard.press("Escape");
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "navToggle",
    );
    report.checks.push(
      "Five page-content photographs; clean 68px navbar; visible mobile images; compact search and desktop hero; source/license credits; keyboard menu",
    );
    // Exercise the <picture> JPEG fallback by marking WebP unsupported in this test document.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(site + "/");
    await page
      .locator("main picture source")
      .evaluateAll((ns) => ns.forEach((n) => (n.type = "image/x-unsupported")));
    for (const image of await page.locator("main picture img").all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((n) => n.decode());
      assert.match(
        await image.evaluate((n) => new URL(n.currentSrc).pathname),
        /\.jpg$/,
      );
    }
    report.checks.push(
      "JPEG fallback decodes when WebP sources are unavailable",
    );
    // Hold every photo response to check reserved geometry before and after image loading.
    for (const deviceScaleFactor of [1, 2]) {
      const c = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor,
      });
      await c.addInitScript(() => {
        window.__photoShifts = [];
        new PerformanceObserver((list) => {
          for (const e of list.getEntries())
            if (!e.hadRecentInput) window.__photoShifts.push(e.value);
        }).observe({ type: "layout-shift", buffered: true });
      });
      let release;
      const pending = new Promise((r) => (release = r));
      await c.route("**/images/sfi/photography/**", async (r) => {
        await pending;
        await r.continue();
      });
      const p = await c.newPage();
      await p.goto(site + "/", { waitUntil: "domcontentloaded" });
      const boxes = () =>
        p
          .locator(".opencs-bar,.sfi-home-hero,.sfi-home-safety")
          .evaluateAll((ns) =>
            ns.map((n) => {
              const r = n.getBoundingClientRect();
              return { x: r.x, y: r.y, width: r.width, height: r.height };
            }),
          );
      const before = await boxes();
      release();
      for (const image of await p.locator("main picture img").all())
        await image.evaluate((n) => n.decode());
      await p.evaluate(
        () =>
          new Promise((r) =>
            requestAnimationFrame(() => requestAnimationFrame(r)),
          ),
      );
      assert.deepEqual(
        await boxes(),
        before,
        "image loading retains section geometry",
      );
      const score = await p.evaluate(() =>
        window.__photoShifts.reduce((s, v) => s + v, 0),
      );
      assert.equal(score, 0);
      const selected = await p
        .locator("[data-photograph=hero] img")
        .evaluate((n) => new URL(n.currentSrc).pathname);
      if (deviceScaleFactor === 2) assert.match(selected, /hero-1280\.webp$/);
      report.loading.push({
        deviceScaleFactor,
        layoutShiftScore: score,
        selectedHero: selected,
        geometryStable: true,
      });
      await c.close();
    }
    report.checks.push(
      "Standard/Retina responsive selection and zero measured layout shift with delayed photos",
    );
    assert.deepEqual(report.errors, []);
    console.log(
      `PASS ${report.layouts.length} photography layouts, ${report.accessibility.length} additional accessibility scans, fallback and delayed-loading checks`,
    );
    report.checks.forEach((x) => console.log("PASS", x));
  } catch (e) {
    report.failure = e.stack;
    console.error(e);
    process.exitCode = 1;
  } finally {
    await browser?.close();
    fs.writeFileSync(
      path.join(output, "photography-results.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
  }
})();
