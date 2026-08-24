import assert from "node:assert/strict";
import test from "node:test";
import { mergeCalculatorProps, resolveLocalizedCalculatorProps } from "../lib/localized-calculator-config.ts";

test("deeply merges payment and overtime configuration while replacing tiers", () => {
  const merged = mergeCalculatorProps(
    { paymentDefaults: { enabled: true, currency: "USD", hourlyRate: 20, overtime: { enabled: false, basis: "daily", tiers: [{ id: "old", afterHours: 8, rateType: "multiplier", rateValue: 1.5 }] } } },
    { paymentDefaults: { overtime: { enabled: true, tiers: [{ id: "new", afterHours: 40, rateType: "multiplier", rateValue: 2 }] } } },
  );
  assert.equal(merged.paymentDefaults?.currency, "USD");
  assert.equal(merged.paymentDefaults?.overtime?.basis, "daily");
  assert.deepEqual(merged.paymentDefaults?.overtime?.tiers?.map(({ id }) => id), ["new"]);
});

test("preserves Spanish overtime product defaults", () => {
  const props = resolveLocalizedCalculatorProps("es", {
    slug: "time-card-calculator-with-overtime", title: "", metaTitle: "", metaDescription: "", h1: "", subtitle: "", intro: "", howToSteps: [], example: { title: "", calculation: "", result: "" }, faqs: [], relatedSlugs: [],
    calculatorProps: { paymentDefaults: { enabled: true, currency: "USD", overtime: { enabled: true, basis: "weekly" } } },
  });
  assert.equal(props.timeFormat, "24h");
  assert.equal(props.paymentDefaults?.currency, "EUR");
  assert.equal(props.paymentSettingsDefaultOpen, true);
  assert.deepEqual(props.paymentDefaults?.overtime?.tiers?.[0], { id: "tier-1", afterHours: 40, rateType: "multiplier", rateValue: 1.5 });
});
