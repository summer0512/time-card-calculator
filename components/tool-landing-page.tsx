import HeadInfo from "@/components/head-info";
import TimeCardCalculator from "@/components/time-card-calculator";
import { Link } from "@/i18n/routing";
import { ToolCalculatorConfig, toolCalculatorMap } from "@/lib/tool-calculators";

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

export default function ToolLandingPage({ locale, config }: ToolLandingPageProps) {
  const canonicalPath = config.slug;
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
        name: config.title,
        item: canonicalUrl
      }
    ]
  };

  const softwareSchema = {
    "@type": "SoftwareApplication",
    name: config.title,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD"
    },
    description: config.metaDescription,
    url: canonicalUrl
  };

  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: config.faqs.map((faq) => ({
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
        title={config.metaTitle}
        description={config.metaDescription}
        keywords={`${config.title.toLowerCase()}, free ${config.title.toLowerCase()}, ${config.slug.replace(/-/g, " ")}`}
        ogImageAlt={`${config.title} tool preview`}
        structuredData={structuredData}
      />

      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-8">
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>{config.title}</span>
          </nav>

          <section className="mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{config.h1}</h1>
            <p className="text-lg text-gray-600 mt-2">{config.subtitle}</p>
          </section>

          <TimeCardCalculator {...config.calculatorProps} />

          <section className="mt-8 bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Who Should Use This {config.title}</h2>
            <p className="text-gray-700">{config.intro}</p>
          </section>

          <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">How to Use This {config.title}</h2>
              <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                {config.howToSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Example Calculation</h2>
              <p className="font-semibold text-gray-800">{config.example.title}</p>
              <p className="text-gray-700 mt-2">{config.example.calculation}</p>
              <p className="text-green-700 font-semibold mt-2">{config.example.result}</p>
            </div>
          </section>

          <section className="mt-6 bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions About {config.title}</h2>
            <div className="space-y-5">
              {config.faqs.map((faq) => (
                <div key={faq.question} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <p className="text-gray-700 mt-1">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Related Calculators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relatedPages.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${item.slug}`}
                  className="border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.metaDescription}</p>
                </Link>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                Back to Free Time Card Calculator
              </Link>
              {guideHref && (
                <Link href={guideHref} className="text-blue-600 hover:text-blue-700 font-medium">
                  Read Related Guide: {toTitleCase(config.guideSlug || "")}
                </Link>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
