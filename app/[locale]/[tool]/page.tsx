import { use } from "react";
import { notFound } from "next/navigation";
import ToolLandingPage from "@/components/tool-landing-page";
import { toolCalculatorMap, toolCalculators, ToolSlug } from "@/lib/tool-calculators";

export default function ToolPage(props: { params: Promise<{ locale: string; tool: string }> }) {
  const params = use(props.params);
  const config = toolCalculatorMap[params.tool as ToolSlug];

  if (!config) {
    notFound();
  }

  return <ToolLandingPage locale={params.locale} config={config} />;
}

export function generateStaticParams() {
  return toolCalculators.map((item) => ({ tool: item.slug }));
}
