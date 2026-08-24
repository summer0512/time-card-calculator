import { notFound } from "next/navigation";
import GuideLandingPage from "@/components/guide-landing-page";
import { resolveEnglishGuideSlug } from "@/lib/guides";

export default async function GuidePage({ params }: { params: Promise<{ locale: string; guide: string }> }) {
  const { locale, guide } = await params;
  const guideId = resolveEnglishGuideSlug(guide);
  if (locale !== "en" || !guideId) notFound();
  return <GuideLandingPage locale="en" guideId={guideId} />;
}
export function generateStaticParams() { return ["biweekly-time-card-calculator", "time-card-calculator-with-breaks", "time-card-calculator-with-lunch"].map((guide) => ({ locale: "en", guide })); }
