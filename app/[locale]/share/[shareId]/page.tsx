import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import SharedTimeCardView from "@/components/shared-time-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { withDatabase } from "@/lib/server/database";
import { getSharedTimeCard } from "@/lib/server/time-cards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shared Time Card", robots: { index: false, follow: false, nocache: true } };

export default async function SharedTimeCardPage({ params }: { params: Promise<{ locale: string; shareId: string }> }) {
  const { locale, shareId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(shareId)) notFound();
  const card = await withDatabase((db) => getSharedTimeCard(db, shareId));
  if (!card) notFound();
  const t = await getTranslations({ locale, namespace: "TimeCardShare" });
  return <main className="min-h-[70vh] bg-gradient-to-b from-slate-50 via-white to-white py-8">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 2xl:px-8">
      <section className="mb-5"><h1 className="text-3xl font-bold text-slate-900">{t("sharedTitle")}</h1><p className="mt-2 text-slate-600">{t("sharedDescription")}</p><p className="mt-1 text-sm text-slate-500">{t("lastUpdated", { date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(card.updatedAt)) })}</p></section>
      <SharedTimeCardView card={card} locale={locale} labels={{ readOnly: t("readOnly"), start: t("start"), end: t("end"), breaks: t("breaks"), dailyTotal: t("dailyTotal"), totalHours: t("totalHours"), totalPay: t("totalPay"), reportHeader: t("reportHeader"), notes: t("notes") }} />
      <div className="mt-6 text-center"><Button asChild><Link href="/">{t("createYourOwn")}</Link></Button></div>
    </div>
  </main>;
}
