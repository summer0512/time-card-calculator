import HeadInfo from "@/components/head-info";
import TimeCardCalculator from "@/components/time-card-calculator";
import { Link } from "@/i18n/routing";
import type { SupportedLocale } from "@/i18n/config";
import { toolCalculatorMap, type ToolCalculatorConfig } from "@/lib/tool-calculators";
import { getLocalizedToolPath, getLocalizedToolSlug, getToolAlternatePaths, isToolAvailableInLocale } from "@/lib/i18n-slugs";
import { getLocalizedToolView } from "@/lib/localized-tool-content";
import { getSchemaCurrency, resolveLocalizedCalculatorProps } from "@/lib/localized-calculator-config";
import { siteConfig } from "@/lib/site-config";
import { resolveLocalizedGuideForTool } from "@/lib/guides";
import { useTranslations } from "next-intl";

interface ToolLandingPageProps { locale: SupportedLocale; config: ToolCalculatorConfig; }

export default function ToolLandingPage({ locale, config }: ToolLandingPageProps) {
  const t = useTranslations("ToolPage");
  const localizedSlug = getLocalizedToolSlug(locale, config.slug)!;
  const localizedPath = getLocalizedToolPath(locale, config.slug)!;
  const localizedView = getLocalizedToolView(locale, config, localizedSlug);
  const calculatorProps = resolveLocalizedCalculatorProps(locale, config);
  const canonicalUrl = `${siteConfig.url}${localizedPath}`;
  const homePath = locale === "en" ? "/" : `/${locale}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "SoftwareApplication", name: localizedView.title, applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: 0, priceCurrency: getSchemaCurrency(calculatorProps) }, description: localizedView.metaDescription, url: canonicalUrl },
      { "@type": "FAQPage", mainEntity: localizedView.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: t("home"), item: `${siteConfig.url}${homePath}` },
        { "@type": "ListItem", position: 2, name: localizedView.title, item: canonicalUrl },
      ] },
    ],
  };

  const relatedGuide = resolveLocalizedGuideForTool(locale, config.slug);
  const relatedPages = config.relatedSlugs
    .filter((slug) => isToolAvailableInLocale(slug, locale))
    .map((slug) => toolCalculatorMap[slug])
    .slice(0, 5);

  return <div>
    <HeadInfo locale={locale} page={localizedSlug} title={localizedView.metaTitle} description={localizedView.metaDescription}
      keywords={localizedView.keywords} ogImageAlt={t("previewAlt", { title: localizedView.title })}
      structuredData={structuredData} alternatePaths={getToolAlternatePaths(config.slug)} />
    <main className="py-6"><div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-8">
      <nav className="text-sm text-gray-600 mb-4"><Link href="/" className="hover:text-blue-600">{t("home")}</Link><span className="mx-2">/</span><span>{localizedView.title}</span></nav>
      <section className="mb-4"><h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{localizedView.h1}</h1><p className="text-lg text-gray-600 mt-2">{localizedView.subtitle}</p></section>
      <TimeCardCalculator {...calculatorProps} />
      <section className="mt-8 bg-white rounded-lg border p-6"><h2 className="text-2xl font-semibold text-gray-900 mb-3">{t("whoShouldUse", { title: localizedView.title })}</h2><p className="text-gray-700">{localizedView.intro}</p></section>
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6"><h2 className="text-2xl font-semibold text-gray-900 mb-3">{t("howToUse", { title: localizedView.title })}</h2><ol className="space-y-2 text-gray-700 list-decimal list-inside">{localizedView.howToSteps.map((step) => <li key={step}>{step}</li>)}</ol></div>
        <div className="bg-white rounded-lg border p-6"><h2 className="text-2xl font-semibold text-gray-900 mb-3">{t("exampleCalculation")}</h2><p className="font-semibold text-gray-800">{localizedView.example.title}</p><p className="text-gray-700 mt-2">{localizedView.example.calculation}</p><p className="text-green-700 font-semibold mt-2">{localizedView.example.result}</p></div>
      </section>
      <section className="mt-6 bg-white rounded-lg border p-6"><h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("faqTitle", { title: localizedView.title })}</h2><div className="space-y-5">{localizedView.faqs.map((faq) => <div key={faq.question} className="border-b border-gray-200 pb-4 last:border-b-0"><h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3><p className="text-gray-700 mt-1">{faq.answer}</p></div>)}</div></section>
      <section className="mt-6 bg-white rounded-lg border p-6"><h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("relatedCalculators")}</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{relatedPages.map((item) => { const slug = getLocalizedToolSlug(locale, item.slug)!; const view = getLocalizedToolView(locale, item, slug); return <Link key={item.slug} href={`/${slug}`} className="border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"><p className="font-semibold text-gray-900">{view.title}</p><p className="text-sm text-gray-600 mt-1">{view.metaDescription}</p></Link>; })}</div><div className="mt-5 flex flex-wrap gap-3"><Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">{t("backToHome")}</Link>{relatedGuide && <a href={relatedGuide.path} className="text-blue-600 hover:text-blue-700 font-medium">{t("readRelatedGuide")}: {relatedGuide.title}</a>}</div></section>
    </div></main>
  </div>;
}
