import { notFound } from "next/navigation";
import SpanishCalculatorPage from "@/components/spanish-calculator-page";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "es") notFound();
  return <SpanishCalculatorPage slug="calculadora-de-horas" />;
}
