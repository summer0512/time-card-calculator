import deCalculatorContent from "@/content/calculators/de.json";
import ptBrCalculatorContent from "@/content/calculators/pt-br.json";
import frCalculatorContent from "@/content/calculators/fr.json";
import esSeoContent from "@/content/calculators/es-seo.json";
import type { SupportedLocale } from "@/i18n/config";
import { ToolCalculatorConfig, ToolSlug } from "@/lib/tool-calculators";

interface LocalizedToolOverrides {
  slug?: string;
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  h1?: string;
  subtitle?: string;
  intro?: string;
  keywords?: string;
  howToSteps?: string[];
  example?: {
    title: string;
    calculation: string;
    result: string;
  };
  faqs?: Array<{ question: string; answer: string }>;
}

type LocalizedContentMap = Partial<Record<ToolSlug, LocalizedToolOverrides>>;

const deContent = deCalculatorContent as LocalizedContentMap;
const ptBrContent = ptBrCalculatorContent as LocalizedContentMap;
const frContent = frCalculatorContent as LocalizedContentMap;
const toSpanishOverride = (content: (typeof esSeoContent)[keyof typeof esSeoContent]): LocalizedToolOverrides => ({
  title: content.h1,
  metaTitle: content.title,
  metaDescription: content.description,
  h1: content.h1,
  subtitle: content.subtitle,
  intro: content.intro,
  keywords: content.keywords,
  howToSteps: content.howToSteps,
  example: content.example,
  faqs: content.faqs,
});

const esContent: LocalizedContentMap = {
  "time-card-calculator-with-lunch": toSpanishOverride(esSeoContent["calculadora-de-horas"]),
  "time-card-calculator-with-overtime": toSpanishOverride(esSeoContent["calculadora-de-horas-extras"]),
  "time-card-calculator-with-multiple-in-and-out": toSpanishOverride(esSeoContent["calcular-horas-jornada-partida"]),
};

const localeContent: Partial<Record<SupportedLocale, LocalizedContentMap>> = {
  de: deContent,
  "pt-br": ptBrContent,
  fr: frContent,
  es: esContent,
};

export interface LocalizedToolView {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  intro: string;
  keywords: string;
  howToSteps: string[];
  example: {
    title: string;
    calculation: string;
    result: string;
  };
  faqs: Array<{ question: string; answer: string }>;
}

const defaultKeywords = (config: ToolCalculatorConfig) =>
  `${config.title.toLowerCase()}, free ${config.title.toLowerCase()}, ${config.slug.replace(/-/g, " ")}`;

export const getLocalizedToolView = (
  locale: SupportedLocale,
  config: ToolCalculatorConfig,
  fallbackSlug: string
): LocalizedToolView => {
  const overrides = localeContent[locale]?.[config.slug];

  return {
    slug: overrides?.slug ?? fallbackSlug,
    title: overrides?.title ?? config.title,
    metaTitle: overrides?.metaTitle ?? config.metaTitle,
    metaDescription: overrides?.metaDescription ?? config.metaDescription,
    h1: overrides?.h1 ?? config.h1,
    subtitle: overrides?.subtitle ?? config.subtitle,
    intro: overrides?.intro ?? config.intro,
    keywords: overrides?.keywords ?? defaultKeywords(config),
    howToSteps: overrides?.howToSteps ?? config.howToSteps,
    example: overrides?.example ?? config.example,
    faqs: overrides?.faqs ?? config.faqs,
  };
};
