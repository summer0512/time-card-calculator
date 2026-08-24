import type { ComponentType } from "react";
import type { SupportedLocale } from "@/i18n/config";
import type { ToolSlug } from "@/lib/tool-calculators";
import BiweeklyArticle from "@/content/guides/articles/biweekly";
import BreaksArticle from "@/content/guides/articles/breaks";
import LunchArticle from "@/content/guides/articles/lunch";
import FrenchWorkHoursArticle from "@/content/guides/articles/fr-work-hours";

export type GuideId = "biweekly-time-card" | "time-card-with-breaks" | "time-card-with-lunch" | "calculate-work-hours";
export interface LocalizedGuide {
  path: string; title: string; description: string; keywords: string; h1: string;
  ogImageAlt: string; article: ComponentType; relatedTool: ToolSlug;
  faqs?: ReadonlyArray<{ question: string; answer: string }>;
}

type GuideRegistry = Record<GuideId, Partial<Record<SupportedLocale, LocalizedGuide>>>;
const frenchFaqs = [
  { question: "Comment calculer les heures de travail ?", answer: "Additionnez la durée de chaque journée de travail, puis soustrayez les pauses non payées pour obtenir le temps net." },
  { question: "Comment calculer les heures de travail par jour ?", answer: "Prenez l'heure de fin, retirez l'heure de début, puis enlevez la pause déjeuner ou les pauses non payées." },
  { question: "Comment calculer des heures de travail sur une semaine ?", answer: "Cumulez les totaux journaliers de toute la semaine pour obtenir le total hebdomadaire." },
  { question: "Comment calculer heure de travail avec pause ?", answer: "Saisissez chaque pause séparément afin que le calculateur retire automatiquement le temps non payé." },
] as const;

export const guideRegistry: GuideRegistry = {
  "biweekly-time-card": { en: { path: "/guides/biweekly-time-card-calculator", title: "How to Calculate a Biweekly Time Card", description: "Tutorial for calculating two-week pay periods with lunch and overtime rules, with a direct link to the free biweekly calculator tool.", keywords: "biweekly time card calculator, 2 week time card calculator, time tracking, payroll calculator", h1: "How to Calculate a Biweekly Time Card", ogImageAlt: "Biweekly time card calculator guide cover", article: BiweeklyArticle, relatedTool: "biweekly-time-card-calculator" } },
  "time-card-with-breaks": { en: { path: "/guides/time-card-calculator-with-breaks", title: "How to Calculate Time Cards with Multiple Breaks", description: "Tutorial for subtracting lunch and multiple breaks from work hours, with direct access to the free calculator tool.", keywords: "time card calculator, breaks, work hours, time tracking", h1: "How to Calculate Time Cards with Multiple Breaks", ogImageAlt: "Time card calculator with breaks guide cover", article: BreaksArticle, relatedTool: "time-card-calculator-with-breaks" } },
  "time-card-with-lunch": { en: { path: "/guides/time-card-calculator-with-lunch", title: "How to Calculate Time Cards with Lunch Breaks", description: "Step-by-step tutorial for calculating time cards with lunch breaks, with direct access to the free calculator tool.", keywords: "time card calculator, lunch break, work hours, time tracking", h1: "How to Calculate Time Cards with Lunch Breaks", ogImageAlt: "Time card calculator with lunch breaks guide cover", article: LunchArticle, relatedTool: "time-card-calculator-with-lunch" } },
  "calculate-work-hours": { fr: { path: "/fr/comment-calculer-heures-travail", title: "Comment calculer les heures de travail", description: "Guide SEO en français pour calculer les heures de travail par jour, par semaine et avec pause.", keywords: "comment calculer les heures de travail, comment calculer heure de travail, comment calculer des heures de travail, comment calculer les heures de travail par jour", h1: "Comment calculer les heures de travail", ogImageAlt: "Comment calculer les heures de travail - guide français", article: FrenchWorkHoursArticle, relatedTool: "time-card-calculator-with-lunch", faqs: frenchFaqs } },
};

export const getGuidesForLocale = (locale: SupportedLocale) =>
  (Object.entries(guideRegistry) as [GuideId, GuideRegistry[GuideId]][]).flatMap(([id, locales]) => {
    const guide = locales[locale];
    return guide ? [{ id, ...guide }] : [];
  });

export const getLocalizedGuide = (id: GuideId, locale: SupportedLocale) => guideRegistry[id][locale] ?? null;
export const getLocalizedGuidePath = (id: GuideId, locale: SupportedLocale) => getLocalizedGuide(id, locale)?.path ?? null;
export const isGuideAvailableInLocale = (id: GuideId, locale: SupportedLocale) => Boolean(getLocalizedGuide(id, locale));
export const getAvailableGuideLocales = (id: GuideId) => Object.keys(guideRegistry[id]) as SupportedLocale[];
export const getGuideAlternatePaths = (id: GuideId) => Object.fromEntries(getAvailableGuideLocales(id).map((locale) => [locale, getLocalizedGuidePath(id, locale)!]));
export const resolveGuideByPath = (pathname: string): { id: GuideId; locale: SupportedLocale } | null => {
  for (const [id, locales] of Object.entries(guideRegistry) as [GuideId, GuideRegistry[GuideId]][]) {
    for (const [locale, guide] of Object.entries(locales) as [SupportedLocale, LocalizedGuide][]) if (guide.path === pathname) return { id, locale };
  }
  return null;
};
export const resolveEnglishGuideSlug = (slug: string): GuideId | null => {
  const match = (Object.entries(guideRegistry) as [GuideId, GuideRegistry[GuideId]][]).find(([, locales]) => locales.en?.path === `/guides/${slug}`);
  return match?.[0] ?? null;
};
export const resolveLocalizedGuideForTool = (locale: SupportedLocale, tool: ToolSlug) => {
  const match = (Object.entries(guideRegistry) as [GuideId, GuideRegistry[GuideId]][]).find(([, locales]) => locales[locale]?.relatedTool === tool);
  if (!match) return null;
  const guide = match[1][locale]!;
  return { id: match[0], title: guide.title, path: guide.path };
};
