import deCalculatorContent from "@/content/calculators/de.json";
import ptBrCalculatorContent from "@/content/calculators/pt-br.json";
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

const localeContent: Record<string, LocalizedContentMap> = {
  de: deContent,
  "pt-br": ptBrContent,
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
  locale: string,
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
