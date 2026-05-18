import HeadInfo from "@/components/head-info";
import TimeCardCalculator from "@/components/time-card-calculator";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { toolCalculators } from "@/lib/tool-calculators";
import { getLocalizedToolSlug } from "@/lib/i18n-slugs";
import { getLocalizedToolView } from "@/lib/localized-tool-content";

const relatedGuides = [
  {
    titleKey: "guideLunch",
    href: "/guides/time-card-calculator-with-lunch"
  },
  {
    titleKey: "guideBreaks",
    href: "/guides/time-card-calculator-with-breaks"
  },
  {
    titleKey: "guideBiweekly",
    href: "/guides/biweekly-time-card-calculator"
  }
] as const;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return (
    <div>
      <HeadInfo
        locale={locale}
        page=""
        title={t("title")}
        description={t("description")}
        keywords={t("keywords")}
        ogImageAlt={t("ogImageAlt")}
      />

      <main className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-8">
          <section className="mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("heroTitle")}</h1>
            <p className="text-lg text-gray-600 mt-2">{t("heroDescription")}</p>
          </section>

          <TimeCardCalculator
            mode="time-card"
            defaultBreakMinutes={30}
            showLunchBreak
            showMultipleBreaks
            showBiweekly={false}
            showOvertime
            showPrintableTimesheet
            timeFormat={locale === "de" ? "24h" : "auto"}
          />

          <section className="mt-8 bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("popularTitle")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {toolCalculators.map((tool) => {
                const localizedSlug = getLocalizedToolSlug(locale, tool.slug);
                const localizedView = getLocalizedToolView(locale, tool, localizedSlug);
                return (
                  <article key={tool.slug} className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900">{localizedView.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{localizedView.metaDescription}</p>
                    <Link href={`/${localizedSlug}`} className="inline-block mt-3 text-blue-600 hover:text-blue-700 font-medium">
                      {t("openCalculator")}
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mt-6 bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("whyTitle")}</h2>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              {(t.raw("whyItems") as string[]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mt-6 bg-white rounded-lg border p-6 mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("relatedGuides")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <p className="font-semibold text-gray-900">{t(guide.titleKey)}</p>
                  <p className="text-sm text-gray-600 mt-1">{t("guideCardDescription")}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
