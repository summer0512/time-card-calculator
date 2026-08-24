"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { languages, type SupportedLocale } from "@/i18n/config";
import { getAvailableToolLocales, getLocalizedToolSlug, resolveLocalizedToolSlug } from "@/lib/i18n-slugs";
import { getAvailableGuideLocales, getLocalizedGuidePath, resolveGuideByPath } from "@/lib/guides";

export function LanguageToggle() {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).at(-1) ?? "";
  const canonicalTool = resolveLocalizedToolSlug(locale, slug);
  const localizedPathname = locale === "en" || pathname.startsWith(`/${locale}/`) ? pathname : `/${locale}${pathname}`;
  const canonicalGuide = resolveGuideByPath(localizedPathname);
  const availableLocales = canonicalTool ? getAvailableToolLocales(canonicalTool) : canonicalGuide ? getAvailableGuideLocales(canonicalGuide.id) : languages.map(({ value }) => value);

  const handleLocaleChange = (newLocale: string) => {
    const targetLocale = newLocale as SupportedLocale;
    if (canonicalTool) {
      const targetSlug = getLocalizedToolSlug(targetLocale, canonicalTool);
      if (targetSlug) router.push(`/${targetSlug}`, { locale: targetLocale });
      return;
    }
    if (canonicalGuide) {
      const target = getLocalizedGuidePath(canonicalGuide.id, targetLocale);
      if (target) {
        const localePrefix = targetLocale === "en" ? "" : `/${targetLocale}`;
        const internalPath = localePrefix && target.startsWith(localePrefix) ? target.slice(localePrefix.length) || "/" : target;
        router.push(internalPath, { locale: targetLocale });
      }
      return;
    }
    router.replace(pathname, { locale: targetLocale });
  };

  return <Select value={locale} onValueChange={handleLocaleChange}>
    <SelectTrigger className="w-[140px] flex gap-2"><Languages className="h-4 w-4" /><SelectValue /></SelectTrigger>
    <SelectContent>{languages.filter(({ value }) => availableLocales.includes(value)).map((lang) => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}</SelectContent>
  </Select>;
}
