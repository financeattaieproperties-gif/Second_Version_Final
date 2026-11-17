import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("PropertyDetailPage includes mobile-only Request Property Visit FAB linked to VisitRequestDialog", () => {
  const filePath = path.resolve("src/pages/PropertyDetailPage.tsx");
  assert.ok(fs.existsSync(filePath), "src/pages/PropertyDetailPage.tsx must exist");

  const code = fs.readFileSync(filePath, "utf8");
  assert.ok(
    code.includes('data-testid="mobile-request-visit-fab"'),
    "PropertyDetailPage must include data-testid=\"mobile-request-visit-fab\""
  );
  assert.ok(
    code.includes("sm:hidden") && code.includes("fixed bottom-4"),
    "Mobile FAB wrapper must be fixed on mobile and hidden on sm+ screens"
  );
  assert.ok(
    code.includes("setVisitOpen(true)"),
    "Clicking mobile FAB must open VisitRequestDialog via setVisitOpen(true)"
  );
  assert.ok(
    code.includes("<VisitRequestDialog"),
    "PropertyDetailPage must render VisitRequestDialog when visitOpen is true"
  );
});

test("Public i18n locales include visitDialog.bookNow and requestVisitBtn keys", () => {
  const en = JSON.parse(fs.readFileSync(path.resolve("src/i18n/locales/en.json"), "utf8"));
  const fa = JSON.parse(fs.readFileSync(path.resolve("src/i18n/locales/fa.json"), "utf8"));

  assert.ok(en.visitDialog?.bookNow, "en.json must define visitDialog.bookNow");
  assert.ok(fa.visitDialog?.bookNow, "fa.json must define visitDialog.bookNow");
  assert.ok(en.visitDialog?.requestVisitBtn, "en.json must define visitDialog.requestVisitBtn");
  assert.ok(fa.visitDialog?.requestVisitBtn, "fa.json must define visitDialog.requestVisitBtn");
});
