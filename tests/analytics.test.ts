import assert from "node:assert/strict";
import test from "node:test";
import { analyticsContext, trackEvent, beginLogin, completeLogin, failLogin } from "../lib/analytics.ts";

test("analytics queues early events, filters parameters, and cannot block actions", () => {
  const previousEnv = process.env.NODE_ENV;
  const previousWindow = globalThis.window;
  Object.assign(process.env, { NODE_ENV: "production" });
  const fake = {} as Window;
  Object.assign(globalThis, { window: fake });
  try {
    const context = { ...analyticsContext("fr", "monthly-time-card-calculator", "monthly"), notes: "private", id: "private" };
    trackEvent("time_card_export", context, { method: "csv" });
    assert.deepEqual(fake.timeCardGaQueue, [["event", "time_card_export", { locale: "fr", calculator_type: "monthly-time-card-calculator", period_type: "monthly", method: "csv" }]]);
    const calls: unknown[][] = [];
    fake.gtag = (...args) => { calls.push(args); };
    trackEvent("time_card_save_success", context, { operation: "update" });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][1], "time_card_save_success");
    fake.gtag = () => { throw new Error("blocked analytics"); };
    assert.doesNotThrow(() => trackEvent("time_card_print", context));
    Object.assign(process.env, { NODE_ENV: "development" });
    fake.gtag = (...args) => { calls.push(args); };
    trackEvent("time_card_print", context);
    assert.equal(calls.length, 1);
    delete (globalThis as { window?: Window }).window;
    Object.assign(process.env, { NODE_ENV: "production" });
    assert.doesNotThrow(() => trackEvent("time_card_print", context));
  } finally {
    Object.assign(process.env, { NODE_ENV: previousEnv });
    Object.assign(globalThis, { window: previousWindow });
  }
});

test("login is counted once after an explicit attempt, never on ordinary session loads", () => {
  const previousEnv = process.env.NODE_ENV;
  const previousWindow = globalThis.window;
  const previousStorage = globalThis.sessionStorage;
  const values = new Map<string, string>();
  const events: unknown[][] = [];
  Object.assign(process.env, { NODE_ENV: "production" });
  Object.assign(globalThis, { window: { gtag: (...args: unknown[]) => events.push(args) }, sessionStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) } });
  try {
    completeLogin(); assert.equal(events.length, 0);
    beginLogin(analyticsContext("de", "monthly-time-card-calculator", "monthly"), "save");
    assert.equal(events[0][1], "login_start");
    completeLogin(); completeLogin();
    assert.deepEqual(events.map(event => event[1]), ["login_start", "login"]);
    beginLogin(analyticsContext("en"), "header"); failLogin(analyticsContext("en"), "header"); completeLogin();
    assert.deepEqual(events.map(event => event[1]), ["login_start", "login", "login_start", "login_error"]);
    values.set("time-card-analytics-login", JSON.stringify({ context: analyticsContext("es"), startedAt: Date.now() - 31 * 60 * 1000 }));
    completeLogin(); assert.equal(events.length, 4);
    values.set("time-card-analytics-login", "broken JSON"); assert.doesNotThrow(completeLogin);
  } finally {
    Object.assign(process.env, { NODE_ENV: previousEnv });
    Object.assign(globalThis, { window: previousWindow, sessionStorage: previousStorage });
  }
});
