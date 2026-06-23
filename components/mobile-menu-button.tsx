"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { toolCalculatorMap } from "@/lib/tool-calculators";
import { getLocalizedToolSlug, isLocalizedToolEnabled } from "@/lib/i18n-slugs";
import { getLocalizedToolView } from "@/lib/localized-tool-content";
import { LanguageToggle } from "@/components/language-toggle";

export default function MobileMenuButton() {
  const locale = useLocale();
  const t = useTranslations("Nav");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lunchSlug = getLocalizedToolSlug(locale, "time-card-calculator-with-lunch");
  const biweeklySlug = getLocalizedToolSlug(locale, "biweekly-time-card-calculator");
  const timesheetSlug = getLocalizedToolSlug(locale, "timesheet-calculator-with-lunch");
  const punchSlug = getLocalizedToolSlug(locale, "time-punch-calculator");
  const toolMenuItems = [
    ["time-card-calculator-with-lunch", lunchSlug],
    ["biweekly-time-card-calculator", biweeklySlug],
    ["timesheet-calculator-with-lunch", timesheetSlug],
    ["time-punch-calculator", punchSlug],
  ] as const;
  const menuItems = [
    { name: t("home"), href: "/" },
    ...toolMenuItems
      .filter(([canonicalSlug]) => isLocalizedToolEnabled(locale, canonicalSlug))
      .map(([canonicalSlug, localizedSlug]) => ({
        name: getLocalizedToolView(locale, toolCalculatorMap[canonicalSlug], localizedSlug).title,
        href: `/${localizedSlug}`,
      })),
    { name: t("guides"), href: "/guides/time-card-calculator-with-lunch" },
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
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
