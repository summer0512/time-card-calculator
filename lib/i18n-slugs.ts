import type { SupportedLocale } from "@/i18n/config";
import { toolCalculators, type ToolSlug } from "@/lib/tool-calculators";

type LocalizedToolRegistry = Record<ToolSlug, Partial<Record<SupportedLocale, string>>>;

const allEnglishTools = Object.fromEntries(
  toolCalculators.map(({ slug }) => [slug, { en: slug }]),
) as LocalizedToolRegistry;

export const localizedToolRegistry: LocalizedToolRegistry = {
  ...allEnglishTools,
  "time-card-calculator-with-overtime": {
    en: "time-card-calculator-with-overtime",
    es: "calculadora-de-horas-extras",
  },
  "time-card-calculator-with-lunch": {
    en: "time-card-calculator-with-lunch", de: "stundenrechner",
    "pt-br": "calculadora-de-horas", fr: "calcul-temps-de-travail", es: "calculadora-de-horas",
  },
  "biweekly-time-card-calculator": {
    en: "biweekly-time-card-calculator", de: "stundenrechner-monat",
    "pt-br": "calculadora-de-horas-quinzenais", fr: "calcul-temps-de-travail-par-mois",
  },
  "time-card-calculator-with-breaks": {
    en: "time-card-calculator-with-breaks", de: "stundenrechner-mit-pause",
    "pt-br": "calculadora-de-horas-trabalhadas", fr: "calcul-temps-de-travail-avec-pause",
  },
  "time-card-calculator-with-multiple-in-and-out": {
    en: "time-card-calculator-with-multiple-in-and-out", de: "time-card-calculator-with-multiple-in-and-out",
    "pt-br": "time-card-calculator-with-multiple-in-and-out", es: "calcular-horas-jornada-partida",
  },
  "timesheet-calculator-with-lunch": { en: "timesheet-calculator-with-lunch", de: "stundenrechner-woche", "pt-br": "calculadora-de-banco-de-horas" },
  "timesheet-calculator-with-breaks": { en: "timesheet-calculator-with-breaks", de: "timesheet-calculator-with-breaks", "pt-br": "timesheet-calculator-with-breaks" },
  "time-clock-calculator-with-lunch": { en: "time-clock-calculator-with-lunch", de: "stundenrechner-uhrzeit", "pt-br": "calculadora-de-horas-extras" },
  "hours-calculator-with-lunch": { en: "hours-calculator-with-lunch", de: "stundenrechner-dezimal", "pt-br": "calculadora-de-minutos-para-horas" },
  "lunch-break-calculator": { en: "lunch-break-calculator", de: "lunch-break-calculator", "pt-br": "calculadora-de-intervalo" },
  "30-minute-lunch-break-calculator": { en: "30-minute-lunch-break-calculator", de: "30-minute-lunch-break-calculator", "pt-br": "calculadora-de-intervalo-de-30-minutos" },
  "time-punch-calculator": { en: "time-punch-calculator", de: "time-punch-calculator", "pt-br": "calculadora-de-ponto" },
  "punch-clock-calculator": { en: "punch-clock-calculator", de: "punch-clock-calculator", "pt-br": "calculadora-cartao-de-ponto" },
  "military-time-card-calculator": { en: "military-time-card-calculator", de: "military-time-card-calculator", "pt-br": "calculadora-de-horas-formato-24h" },
};

export const isToolAvailableInLocale = (canonicalSlug: ToolSlug, locale: SupportedLocale) =>
  Boolean(localizedToolRegistry[canonicalSlug][locale]);

export const isLocalizedToolEnabled = (locale: SupportedLocale, canonicalSlug: ToolSlug) =>
  isToolAvailableInLocale(canonicalSlug, locale);

export const getLocalizedToolSlug = (locale: SupportedLocale, canonicalSlug: ToolSlug) =>
  localizedToolRegistry[canonicalSlug][locale] ?? null;

export const getLocalizedToolPath = (locale: SupportedLocale, canonicalSlug: ToolSlug): string | null => {
  const slug = getLocalizedToolSlug(locale, canonicalSlug);
  if (!slug) return null;
  return locale === "en" ? `/${slug}` : `/${locale}/${slug}`;
};

export const getAvailableToolLocales = (canonicalSlug: ToolSlug) =>
  Object.keys(localizedToolRegistry[canonicalSlug]) as SupportedLocale[];

export const getToolAlternatePaths = (canonicalSlug: ToolSlug) =>
  Object.fromEntries(getAvailableToolLocales(canonicalSlug).map((locale) => [locale, getLocalizedToolPath(locale, canonicalSlug)!]));

export const resolveLocalizedToolSlug = (locale: SupportedLocale, localizedSlug: string): ToolSlug | null =>
  (Object.entries(localizedToolRegistry).find(([, locales]) => locales[locale] === localizedSlug)?.[0] as ToolSlug | undefined) ?? null;

export const resolveToolByPath = (pathname: string): { canonicalSlug: ToolSlug; locale: SupportedLocale } | null => {
  const parts = pathname.split("/").filter(Boolean);
  const locale = (["de", "pt-br", "fr", "es"].includes(parts[0]) ? parts.shift() : "en") as SupportedLocale;
  if (parts.length !== 1) return null;
  const canonicalSlug = resolveLocalizedToolSlug(locale, parts[0]);
  return canonicalSlug ? { canonicalSlug, locale } : null;
};

export const getAllLocalizedToolSlugs = (locale: SupportedLocale) =>
  toolCalculators.flatMap(({ slug }) => localizedToolRegistry[slug][locale] ? [localizedToolRegistry[slug][locale]!] : []);
