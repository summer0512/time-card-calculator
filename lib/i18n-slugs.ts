import { ToolSlug, toolCalculators } from "@/lib/tool-calculators";
import { SupportedLocale } from "@/i18n/config";

type LocaleToolSlugMap = Record<SupportedLocale, Record<ToolSlug, string>>;

const enMap = toolCalculators.reduce((acc, item) => {
  acc[item.slug] = item.slug;
  return acc;
}, {} as Record<ToolSlug, string>);

const deMap: Record<ToolSlug, string> = {
  "time-card-calculator-with-lunch": "stundenrechner",
  "biweekly-time-card-calculator": "stundenrechner-monat",
  "time-card-calculator-with-breaks": "stundenrechner-mit-pause",
  "timesheet-calculator-with-lunch": "stundenrechner-woche",
  "time-clock-calculator-with-lunch": "stundenrechner-uhrzeit",
  "hours-calculator-with-lunch": "stundenrechner-dezimal",
  "lunch-break-calculator": "lunch-break-calculator",
  "30-minute-lunch-break-calculator": "30-minute-lunch-break-calculator",
  "time-punch-calculator": "time-punch-calculator",
  "punch-clock-calculator": "punch-clock-calculator",
  "military-time-card-calculator": "military-time-card-calculator"
};

const localeToolSlugMap: LocaleToolSlugMap = {
  en: enMap,
  de: deMap,
};

export const getLocalizedToolSlug = (locale: string, canonicalSlug: ToolSlug): string => {
  const normalized = (locale in localeToolSlugMap ? locale : "en") as SupportedLocale;
  return localeToolSlugMap[normalized][canonicalSlug] ?? canonicalSlug;
};

export const resolveLocalizedToolSlug = (locale: string, localizedSlug: string): ToolSlug | null => {
  const normalized = (locale in localeToolSlugMap ? locale : "en") as SupportedLocale;
  const entry = Object.entries(localeToolSlugMap[normalized]).find(([, value]) => value === localizedSlug);
  return (entry?.[0] as ToolSlug | undefined) ?? null;
};

export const getAllLocalizedToolSlugs = (locale: string): string[] => {
  const normalized = (locale in localeToolSlugMap ? locale : "en") as SupportedLocale;
  return Object.values(localeToolSlugMap[normalized]);
};
