import HeadInfo from "@/components/head-info";
import TimeCardCalculator from "@/components/time-card-calculator";
import { Link } from "@/i18n/routing";
import { ToolCalculatorConfig, toolCalculatorMap } from "@/lib/tool-calculators";
import { getLocalizedToolSlug } from "@/lib/i18n-slugs";
import { getLocalizedToolView } from "@/lib/localized-tool-content";
import { useTranslations } from "next-intl";

interface ToolLandingPageProps {
  locale: string;
  config: ToolCalculatorConfig;
}

const SITE_URL = "https://time-card-calculator.work";

const toTitleCase = (text: string) =>
  text
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const deGuideTitleMap: Record<string, string> = {
  "time-card-calculator-with-lunch": "Arbeitszeit mit Mittagspause berechnen",
  "time-card-calculator-with-breaks": "Arbeitszeit mit Pausen berechnen",
  "biweekly-time-card-calculator": "2-Wochen-Arbeitszeit Guide"
};

export default function ToolLandingPage({ locale, config }: ToolLandingPageProps) {
  const t = useTranslations("ToolPage");
  const localizedSlug = getLocalizedToolSlug(locale, config.slug);
  const localizedView = getLocalizedToolView(locale, config, localizedSlug);
  const canonicalPath = localizedView.slug;
  const canonicalUrl = `${SITE_URL}/${canonicalPath}`;

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: localizedView.title,
        item: canonicalUrl
      }
    ]
  };

  const softwareSchema = {
    "@type": "SoftwareApplication",
    name: localizedView.title,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD"
    },
    description: localizedView.metaDescription,
    url: canonicalUrl
  };

  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: localizedView.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [softwareSchema, faqSchema, breadcrumbSchema]
  };

  const relatedPages = config.relatedSlugs
    .map((slug) => toolCalculatorMap[slug])
    .filter(Boolean)
    .slice(0, 5);

  const guideHref = config.guideSlug ? `/guides/${config.guideSlug}` : null;

  return (
    <div>
      <HeadInfo
        locale={locale}
        page={canonicalPath}
        title={localizedView.metaTitle}
        description={localizedView.metaDescription}
        keywords={localizedView.keywords}
        ogImageAlt={`${localizedView.title} tool preview`}
        structuredData={structuredData}
      />

      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-8">
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-blue-600">
              {t("home")}
            </Link>
            <span className="mx-2">/</span>
            <span>{localizedView.title}</span>
          </nav>

          <section className="mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{localizedView.h1}</h1>
            <p className="text-lg text-gray-600 mt-2">{localizedView.subtitle}</p>
          </section>

          <TimeCardCalculator
            {...config.calculatorProps}
            timeFormat={locale === "de" ? "24h" : (config.calculatorProps.timeFormat ?? "auto")}
          />

          <section className="mt-8 bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t("whoShouldUse", { title: localizedView.title })}</h2>
            <p className="text-gray-700">{localizedView.intro}</p>
          </section>

          <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t("howToUse", { title: localizedView.title })}</h2>
              <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                {localizedView.howToSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t("exampleCalculation")}</h2>
              <p className="font-semibold text-gray-800">{localizedView.example.title}</p>
              <p className="text-gray-700 mt-2">{localizedView.example.calculation}</p>
              <p className="text-green-700 font-semibold mt-2">{localizedView.example.result}</p>
            </div>
          </section>

          <section className="mt-6 bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("faqTitle", { title: localizedView.title })}</h2>
            <div className="space-y-5">
              {localizedView.faqs.map((faq) => (
                <div key={faq.question} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <p className="text-gray-700 mt-1">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("relatedCalculators")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relatedPages.map((item) => {
                const relatedSlug = getLocalizedToolSlug(locale, item.slug);
                const relatedView = getLocalizedToolView(locale, item, relatedSlug);
                return (
                <Link
                  key={item.slug}
                  href={`/${relatedSlug}`}
                  className="border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <p className="font-semibold text-gray-900">{relatedView.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{relatedView.metaDescription}</p>
                </Link>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                {t("backToHome")}
              </Link>
              {guideHref && (
                <Link href={guideHref} className="text-blue-600 hover:text-blue-700 font-medium">
                  {t("readRelatedGuide")}: {locale === "de" ? deGuideTitleMap[config.guideSlug || ""] : toTitleCase(config.guideSlug || "")}
                </Link>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
