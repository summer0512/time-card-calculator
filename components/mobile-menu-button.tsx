"use client";

import type { SupportedLocale } from "@/i18n/config";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { toolCalculatorMap } from "@/lib/tool-calculators";
import { getLocalizedToolSlug, isLocalizedToolEnabled } from "@/lib/i18n-slugs";
import { getLocalizedToolView } from "@/lib/localized-tool-content";
import { LanguageToggle } from "@/components/language-toggle";
import { getGuidesForLocale } from "@/lib/guides";

export default function MobileMenuButton() {
  const locale = useLocale();
  const t = useTranslations("Nav");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lunchSlug = getLocalizedToolSlug(locale as SupportedLocale, "time-card-calculator-with-lunch")!;
  const biweeklySlug = getLocalizedToolSlug(locale as SupportedLocale, "biweekly-time-card-calculator")!;
  const timesheetSlug = getLocalizedToolSlug(locale as SupportedLocale, "timesheet-calculator-with-lunch")!;
  const punchSlug = getLocalizedToolSlug(locale as SupportedLocale, "time-punch-calculator")!;
  const toolMenuItems = [
    ["time-card-calculator-with-lunch", lunchSlug],
    ["biweekly-time-card-calculator", biweeklySlug],
    ["timesheet-calculator-with-lunch", timesheetSlug],
    ["time-punch-calculator", punchSlug],
  ] as const;
  const guideItems = getGuidesForLocale(locale as SupportedLocale);
  const menuItems = [
    { name: t("home"), href: "/" },
    ...toolMenuItems
      .filter(([canonicalSlug]) => isLocalizedToolEnabled(locale as SupportedLocale, canonicalSlug))
      .map(([canonicalSlug, localizedSlug]) => ({
        name: getLocalizedToolView(locale as SupportedLocale, toolCalculatorMap[canonicalSlug], localizedSlug).title,
        href: `/${localizedSlug}`,
      })),
    ...guideItems.map((guide) => ({ name: guide.title, href: guide.path, exactPath: true })),
    { name: t("contact"), href: "/contact" }
  ];

  return (
    <>
      <div className="md:hidden">
        <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t shadow-lg">
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <LanguageToggle />
            </div>
            {menuItems.map((item) => "exactPath" in item ? (
              <a key={item.name} href={item.href} className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                {item.name}
              </a>
            ) : (
              <Link key={item.name} href={item.href} className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
