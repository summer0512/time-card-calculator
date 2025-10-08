import { use } from "react";
import { useTranslations } from "next-intl";
import HeadInfo from "@/components/head-info";
import { Link } from "@/i18n/routing";

type PolicySection = {
  id: string;
  heading: string;
  paragraphs?: string[];
  items?: string[];
};

export default function PrivacyPage(props: { params: Promise<{ locale: string }> }) {
  const params = use(props.params);
  const t = useTranslations("PrivacyPage");

  const intro = (t.raw("intro") as string[] | undefined) ?? [];
  const sections = (t.raw("sections") as PolicySection[] | undefined) ?? [];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <HeadInfo
        locale={params.locale}
        page="privacy"
        title={t("title")}
        description={t("description")}
        keywords={t("keywords")}
      />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <article className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 sm:p-12">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{t("heading")}</h1>
            <p className="text-sm text-gray-500">
              {t("lastUpdatedLabel")}: {" "}
              <span className="font-medium text-gray-700">{t("lastUpdatedValue")}</span>
            </p>
            <div className="mt-6 space-y-4">
              {intro.map((paragraph, index) => (
                <p key={`intro-${index}`} className="text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </header>

          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">{section.heading}</h2>
                {section.paragraphs?.map((paragraph, index) => (
                  <p key={`${section.id}-paragraph-${index}`} className="text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
                {section.items && section.items.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {section.items.map((item, index) => (
                      <li key={`${section.id}-item-${index}`}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
            <section id="contact" className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">{t("contact.heading")}</h2>
              <p className="text-gray-700 leading-relaxed">{t("contact.description")}</p>
              <Link
                href="/contact"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t("contact.linkLabel")}
              </Link>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}
