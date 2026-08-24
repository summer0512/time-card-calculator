import HeadInfo from "@/components/head-info";
import type { SupportedLocale } from "@/i18n/config";
import { getGuideAlternatePaths, getLocalizedGuide, type GuideId } from "@/lib/guides";
import { siteConfig } from "@/lib/site-config";

export default function GuideLandingPage({ locale, guideId }: { locale: SupportedLocale; guideId: GuideId }) {
  const guide = getLocalizedGuide(guideId, locale);
  if (!guide) return null;
  const canonicalUrl = `${siteConfig.url}${guide.path}`;
  const homePath = locale === "en" ? "/" : `/${locale}`;
  const graph: Record<string, unknown>[] = [
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: locale === "fr" ? "Accueil" : "Home", item: `${siteConfig.url}${homePath}` }, { "@type": "ListItem", position: 2, name: guide.h1, item: canonicalUrl }] },
    { "@type": "Article", headline: guide.h1, description: guide.description, url: canonicalUrl, inLanguage: locale },
  ];
  if (guide.faqs?.length) graph.push({ "@type": "FAQPage", mainEntity: guide.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) });
  const Article = guide.article;
  return <><HeadInfo locale={locale} page={guide.path} title={guide.title} description={guide.description} keywords={guide.keywords} ogType="article" ogImageAlt={guide.ogImageAlt} alternatePaths={getGuideAlternatePaths(guideId)} structuredData={{ "@context": "https://schema.org", "@graph": graph }} /><Article /></>;
}
