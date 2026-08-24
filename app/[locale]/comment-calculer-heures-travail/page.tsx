import { notFound } from "next/navigation";
import GuideLandingPage from "@/components/guide-landing-page";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "fr") notFound();
  return <GuideLandingPage locale="fr" guideId="calculate-work-hours" />;
}
