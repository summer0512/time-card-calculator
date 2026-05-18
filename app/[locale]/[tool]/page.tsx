import { use } from "react";
import { notFound } from "next/navigation";
import ToolLandingPage from "@/components/tool-landing-page";
import { toolCalculatorMap } from "@/lib/tool-calculators";
import { languages } from "@/i18n/config";
import { getAllLocalizedToolSlugs, resolveLocalizedToolSlug } from "@/lib/i18n-slugs";

export default function ToolPage(props: { params: Promise<{ locale: string; tool: string }> }) {
  const params = use(props.params);
  const canonicalSlug = resolveLocalizedToolSlug(params.locale, params.tool);
  const config = canonicalSlug ? toolCalculatorMap[canonicalSlug] : undefined;

  if (!config) {
    notFound();
  }

  return <ToolLandingPage locale={params.locale} config={config} />;
}

export function generateStaticParams() {
  return languages.flatMap((language) =>
    getAllLocalizedToolSlugs(language.value).map((tool) => ({
      locale: language.value,
      tool,
    }))
  );
}
