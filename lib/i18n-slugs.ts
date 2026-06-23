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
  "time-card-calculator-with-multiple-in-and-out": "time-card-calculator-with-multiple-in-and-out",
  "timesheet-calculator-with-lunch": "stundenrechner-woche",
  "timesheet-calculator-with-breaks": "timesheet-calculator-with-breaks",
  "time-clock-calculator-with-lunch": "stundenrechner-uhrzeit",
  "hours-calculator-with-lunch": "stundenrechner-dezimal",
  "lunch-break-calculator": "lunch-break-calculator",
  "30-minute-lunch-break-calculator": "30-minute-lunch-break-calculator",
  "time-punch-calculator": "time-punch-calculator",
  "punch-clock-calculator": "punch-clock-calculator",
  "military-time-card-calculator": "military-time-card-calculator"
};

const ptBrMap: Record<ToolSlug, string> = {
  "time-card-calculator-with-lunch": "calculadora-de-horas",
  "biweekly-time-card-calculator": "calculadora-de-horas-quinzenais",
  "time-card-calculator-with-breaks": "calculadora-de-horas-trabalhadas",
  "time-card-calculator-with-multiple-in-and-out": "time-card-calculator-with-multiple-in-and-out",
  "timesheet-calculator-with-lunch": "calculadora-de-banco-de-horas",
  "timesheet-calculator-with-breaks": "timesheet-calculator-with-breaks",
  "time-clock-calculator-with-lunch": "calculadora-de-horas-extras",
  "hours-calculator-with-lunch": "calculadora-de-minutos-para-horas",
  "lunch-break-calculator": "calculadora-de-intervalo",
  "30-minute-lunch-break-calculator": "calculadora-de-intervalo-de-30-minutos",
  "time-punch-calculator": "calculadora-de-ponto",
  "punch-clock-calculator": "calculadora-cartao-de-ponto",
  "military-time-card-calculator": "calculadora-de-horas-formato-24h"
};

const frMap: Record<ToolSlug, string> = {
  "time-card-calculator-with-lunch": "calcul-temps-de-travail",
  "biweekly-time-card-calculator": "calcul-temps-de-travail-par-mois",
  "time-card-calculator-with-breaks": "calcul-temps-de-travail-avec-pause",
  "time-card-calculator-with-multiple-in-and-out": "time-card-calculator-with-multiple-in-and-out",
  "timesheet-calculator-with-lunch": "timesheet-calculator-with-lunch",
  "timesheet-calculator-with-breaks": "timesheet-calculator-with-breaks",
  "time-clock-calculator-with-lunch": "time-clock-calculator-with-lunch",
  "hours-calculator-with-lunch": "hours-calculator-with-lunch",
  "lunch-break-calculator": "lunch-break-calculator",
  "30-minute-lunch-break-calculator": "30-minute-lunch-break-calculator",
  "time-punch-calculator": "time-punch-calculator",
  "punch-clock-calculator": "punch-clock-calculator",
  "military-time-card-calculator": "military-time-card-calculator"
};

const localeToolSlugMap: LocaleToolSlugMap = {
  en: enMap,
  de: deMap,
  "pt-br": ptBrMap,
  fr: frMap,
};

const enabledToolSlugsByLocale: Partial<Record<SupportedLocale, ReadonlySet<ToolSlug>>> = {
  fr: new Set<ToolSlug>([
    "time-card-calculator-with-lunch",
    "time-card-calculator-with-breaks",
    "biweekly-time-card-calculator",
  ]),
};

export const isLocalizedToolEnabled = (locale: string, canonicalSlug: ToolSlug): boolean => {
  const normalized = (locale in localeToolSlugMap ? locale : "en") as SupportedLocale;
  return enabledToolSlugsByLocale[normalized]?.has(canonicalSlug) ?? true;
};

export const getLocalizedToolSlug = (locale: string, canonicalSlug: ToolSlug): string => {
  const normalized = (locale in localeToolSlugMap ? locale : "en") as SupportedLocale;
  return localeToolSlugMap[normalized][canonicalSlug] ?? canonicalSlug;
};

export const resolveLocalizedToolSlug = (locale: string, localizedSlug: string): ToolSlug | null => {
  const normalized = (locale in localeToolSlugMap ? locale : "en") as SupportedLocale;
  const entry = Object.entries(localeToolSlugMap[normalized]).find(([, value]) => value === localizedSlug);
  const canonicalSlug = entry?.[0] as ToolSlug | undefined;

  if (!canonicalSlug || !isLocalizedToolEnabled(normalized, canonicalSlug)) {
    return null;
  }

  return canonicalSlug;
};

export const getAllLocalizedToolSlugs = (locale: string): string[] => {
  const normalized = (locale in localeToolSlugMap ? locale : "en") as SupportedLocale;
  return Object.entries(localeToolSlugMap[normalized])
    .filter(([canonicalSlug]) => isLocalizedToolEnabled(normalized, canonicalSlug as ToolSlug))
    .map(([, localizedSlug]) => localizedSlug);
};
