import type { SupportedLocale } from "@/i18n/config";
import type { CalculatorPropsConfig, ToolCalculatorConfig, ToolSlug } from "@/lib/tool-calculators";

const localeDefaults: Record<SupportedLocale, CalculatorPropsConfig> = {
  en: { timeFormat: "auto", defaultCurrency: "USD" },
  de: { timeFormat: "24h", defaultCurrency: "EUR" },
  "pt-br": { timeFormat: "24h", defaultCurrency: "BRL" },
  fr: { timeFormat: "24h", defaultCurrency: "EUR" },
  es: { timeFormat: "24h", defaultCurrency: "EUR" },
};

const spanishPayment = { enabled: true, currency: "EUR", hourlyRate: 12 } as const;

const toolLocaleOverrides: Partial<Record<SupportedLocale, Partial<Record<ToolSlug, CalculatorPropsConfig>>>> = {
  es: {
    "time-card-calculator-with-lunch": {
      defaultBreakMinutes: 0, showBreakDeduction: true, showOvertime: true,
      paymentDefaults: { ...spanishPayment, overtime: { enabled: false, basis: "weekly" } },
    },
    "time-card-calculator-with-overtime": {
      mode: "time-card", defaultBreakMinutes: 0, showBreakDeduction: true,
      showOvertime: true, showPrintableTimesheet: true, paymentPresentation: "popover",
      paymentSettingsDefaultOpen: true,
      paymentDefaults: {
        ...spanishPayment,
        overtime: { enabled: true, basis: "weekly", tiers: [{ id: "tier-1", afterHours: 40, rateType: "multiplier", rateValue: 1.5 }] },
      },
    },
    "time-card-calculator-with-multiple-in-and-out": {
      mode: "split-shift", defaultBreakMinutes: 0, showBreakDeduction: false,
      showLunchBreak: false, showMultipleBreaks: false, showOvertime: true,
      showPrintableTimesheet: true,
      paymentDefaults: { ...spanishPayment, overtime: { enabled: false, basis: "daily" } },
    },
  },
};

export function mergeCalculatorProps(...configs: Array<CalculatorPropsConfig | undefined>): CalculatorPropsConfig {
  return configs.reduce<CalculatorPropsConfig>((merged, config) => {
    if (!config) return merged;
    const paymentDefaults = config.paymentDefaults
      ? {
          ...merged.paymentDefaults,
          ...config.paymentDefaults,
          overtime: config.paymentDefaults.overtime
            ? { ...merged.paymentDefaults?.overtime, ...config.paymentDefaults.overtime, tiers: config.paymentDefaults.overtime.tiers ?? merged.paymentDefaults?.overtime?.tiers }
            : merged.paymentDefaults?.overtime,
        }
      : merged.paymentDefaults;
    return {
      ...merged,
      ...config,
      labels: config.labels ? { ...merged.labels, ...config.labels } as CalculatorPropsConfig["labels"] : merged.labels,
      paymentDefaults,
    };
  }, {});
}

export const resolveLocalizedCalculatorProps = (locale: SupportedLocale, config: ToolCalculatorConfig) =>
  mergeCalculatorProps(config.calculatorProps, localeDefaults[locale], toolLocaleOverrides[locale]?.[config.slug]);

export const getSchemaCurrency = (props: CalculatorPropsConfig) =>
  props.paymentDefaults?.currency ?? props.defaultCurrency ?? "USD";
