export interface AnalyticsContext {
  locale: string;
  calculator_type: string;
  period_type: string;
}
export type AnalyticsEvent = "login_start" | "login" | "login_error" | "time_card_save_start" | "time_card_save_success" | "time_card_save_error" | "time_card_export" | "time_card_print" | "time_card_share_start" | "time_card_share_link" | "time_card_share_copy" | "time_card_share_error" | "time_card_share_stop";
type EventOptions = { method?: "Google" | "csv" | "print" | "link" | "clipboard"; operation?: "create" | "update" | "generate" | "copy" | "stop"; entry_point?: "header" | "mobile_menu" | "my_time_cards" | "save" | "share" };
type GaEvent = ["event", AnalyticsEvent, AnalyticsContext & EventOptions];
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    timeCardGaQueue?: GaEvent[];
  }
}
export const analyticsContext = (locale: string, calculatorType = "none", periodType = "none"): AnalyticsContext => ({ locale, calculator_type: calculatorType, period_type: periodType });

// Only allow categorical parameters; never pass card data, IDs or error messages.
export function trackEvent(event: AnalyticsEvent, context: AnalyticsContext, options: EventOptions = {}): void {
  if (process.env.NODE_ENV !== "production" || typeof window === "undefined") return;
  const params = { locale: context.locale, calculator_type: context.calculator_type, period_type: context.period_type,
    ...(options.method ? { method: options.method } : {}),
    ...(options.operation ? { operation: options.operation } : {}),
    ...(options.entry_point ? { entry_point: options.entry_point } : {}),
  };
  try {
    if (window.gtag) window.gtag("event", event, params);
    else (window.timeCardGaQueue ??= []).push(["event", event, params]);
  } catch { /* Analytics must never prevent a user action. */ }
}
const LOGIN_KEY = "time-card-analytics-login";
export function beginLogin(context: AnalyticsContext, entryPoint: EventOptions["entry_point"]): void {
  try { sessionStorage.setItem(LOGIN_KEY, JSON.stringify({ context, entryPoint, startedAt: Date.now() })); } catch { /* Storage may be unavailable. */ }
  trackEvent("login_start", context, { method: "Google", entry_point: entryPoint });
}
export function failLogin(context: AnalyticsContext, entryPoint: EventOptions["entry_point"]): void {
  try { sessionStorage.removeItem(LOGIN_KEY); } catch { /* Storage may be unavailable. */ }
  trackEvent("login_error", context, { method: "Google", entry_point: entryPoint });
}
// Called only after a real authenticated session is observed on return from OAuth.
export function completeLogin(): void {
  try {
    const raw = sessionStorage.getItem(LOGIN_KEY);
    if (!raw) return;
    sessionStorage.removeItem(LOGIN_KEY);
    const pending = JSON.parse(raw);
    if (Date.now() - pending.startedAt > 30 * 60 * 1000 || Date.now() < pending.startedAt) return;
    trackEvent("login", pending.context, { method: "Google", entry_point: pending.entryPoint });
  } catch { /* An unavailable or stale marker must not affect authentication. */ }
}
