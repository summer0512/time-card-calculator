import HeadInfo from "@/components/head-info";
import TimeCardCalculator from "@/components/time-card-calculator";
import { Link } from "@/i18n/routing";
import spanishContent from "@/content/calculators/es-seo.json";

type SpanishCalculatorSlug = keyof typeof spanishContent;

interface SpanishCalculatorPageProps {
  slug: SpanishCalculatorSlug;
}

const SITE_URL = "https://time-card-calculator.work";

const calculatorProps = {
  "calculadora-de-horas": {
    mode: "time-card" as const,
    defaultBreakMinutes: 0,
    showBreakDeduction: true,
    showOvertime: true,
    showPrintableTimesheet: true,
    timeFormat: "24h" as const,
    paymentDefaults: {
      enabled: true,
      currency: "EUR",
      hourlyRate: 12,
      overtime: { enabled: false, basis: "weekly" as const },
    },
  },
  "calculadora-de-horas-extras": {
    mode: "time-card" as const,
    defaultBreakMinutes: 0,
    showBreakDeduction: true,
    showOvertime: true,
    showPrintableTimesheet: true,
    timeFormat: "24h" as const,
    paymentPresentation: "prominent" as const,
    paymentDefaults: {
      enabled: true,
      currency: "EUR",
      hourlyRate: 12,
      overtime: {
        enabled: true,
        basis: "weekly" as const,
        tiers: [{ id: "tier-1", afterHours: 40, rateType: "multiplier" as const, rateValue: 1.5 }],
      },
    },
  },
  "calcular-horas-jornada-partida": {
    mode: "split-shift" as const,
    defaultBreakMinutes: 0,
    showBreakDeduction: false,
    showLunchBreak: false,
    showMultipleBreaks: false,
    showOvertime: true,
    showPrintableTimesheet: true,
    timeFormat: "24h" as const,
    paymentDefaults: {
      enabled: true,
      currency: "EUR",
      hourlyRate: 12,
      overtime: { enabled: false, basis: "daily" as const },
    },
  },
};

export default function SpanishCalculatorPage({ slug }: SpanishCalculatorPageProps) {
  const content = spanishContent[slug];
  const canonicalUrl = `${SITE_URL}/es/${slug}`;
  const relatedSlugs = (Object.keys(spanishContent) as SpanishCalculatorSlug[])
    .filter((relatedSlug) => relatedSlug !== slug);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: content.h1,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: 0, priceCurrency: "EUR" },
        description: content.description,
        url: canonicalUrl,
      },
      {
        "@type": "FAQPage",
        mainEntity: content.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/es/` },
          { "@type": "ListItem", position: 2, name: content.h1, item: canonicalUrl },
        ],
      },
    ],
  };

  return (
    <div>
      <HeadInfo
        locale="es"
        page={slug}
        title={content.title}
        description={content.description}
        keywords={content.keywords}
        ogImageAlt={`${content.h1} — vista previa`}
        structuredData={structuredData}
        alternatePaths={{ es: `/es/${slug}` }}
      />

      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 2xl:px-8">
          <nav className="mb-4 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Inicio</Link>
            <span className="mx-2">/</span>
            <span>{content.h1}</span>
          </nav>

          <section className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{content.h1}</h1>
            <p className="mt-2 text-lg text-gray-600">{content.subtitle}</p>
          </section>

          <TimeCardCalculator {...calculatorProps[slug]} />

          <section className="mt-8 rounded-lg border bg-white p-6">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Una calculadora adaptada a tu jornada</h2>
            <p className="text-gray-700">{content.intro}</p>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-3 text-2xl font-semibold text-gray-900">Cómo usar la calculadora</h2>
              <ol className="list-inside list-decimal space-y-2 text-gray-700">
                {content.howToSteps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </div>
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-3 text-2xl font-semibold text-gray-900">Ejemplo de cálculo</h2>
              <p className="font-semibold text-gray-800">{content.example.title}</p>
              <p className="mt-2 text-gray-700">{content.example.calculation}</p>
              <p className="mt-2 font-semibold text-green-700">{content.example.result}</p>
            </div>
          </section>

          <section className="mt-6 rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Preguntas frecuentes</h2>
            <div className="space-y-5">
              {content.faqs.map((faq) => (
                <div key={faq.question} className="border-b border-gray-200 pb-4 last:border-0">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <p className="mt-1 text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12 mt-6 rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Calculadoras relacionadas</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {relatedSlugs.map((relatedSlug) => (
                <Link key={relatedSlug} href={`/${relatedSlug}`} className="rounded-lg border p-4 hover:border-blue-500 hover:bg-blue-50">
                  <p className="font-semibold text-gray-900">{spanishContent[relatedSlug].h1}</p>
                  <p className="mt-1 text-sm text-gray-600">{spanishContent[relatedSlug].description}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
