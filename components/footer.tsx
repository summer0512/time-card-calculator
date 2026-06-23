"use client";

import { Clock, Github, Mail } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { toolCalculatorMap } from "@/lib/tool-calculators";
import { getLocalizedToolSlug, isLocalizedToolEnabled } from "@/lib/i18n-slugs";
import { getLocalizedToolView } from "@/lib/localized-tool-content";

const friendLinks = [
  { name: "Time Card Calculator", href: "https://link.zhihu.com/?target=https://time-card-calculator.work", follow: true },
  { name: "Morse Code Kit", href: "https://morsecodekit.com/", follow: true },
  { name: "PrintableGen", href: "https://printablegen.com/", follow: true },
  { name: "Generate Org Chart", href: "https://generateorgchart.com/", follow: true },
  { name: "Size Chart Kit", href: "https://sizechartkit.com/", follow: true },
  { name: "Device Test Tools", href: "https://devicetesttools.com/", follow: true },
  { name: "IBAN Tools", href: "https://ibantools.net/", follow: true },
  { name: "Randlyx", href: "https://randlyx.com/", follow: true },
  { name: "Subnautica Hub", href: "https://subnauticahub.com/", follow: true },
  { name: "Test Score Hub", href: "https://testscorehub.com/", follow: true },
  { name: "EasyPdfNow", href: "https://easypdfnow.com/", follow: true },
  { name: "Solarpunk Hub", href: "https://solarpunkhub.com/", follow: true }
];

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations("Footer");
  const brand = useTranslations("Header");
  const popularTools = [
    "time-card-calculator-with-lunch",
    "biweekly-time-card-calculator",
    "timesheet-calculator-with-lunch",
    "lunch-break-calculator",
    "time-punch-calculator"
  ].filter((slug) => isLocalizedToolEnabled(locale, slug as keyof typeof toolCalculatorMap)).map((slug) => {
    const canonicalSlug = slug as keyof typeof toolCalculatorMap;
    const localizedSlug = getLocalizedToolSlug(locale, canonicalSlug);
    const localized = getLocalizedToolView(locale, toolCalculatorMap[canonicalSlug], localizedSlug);
    return { name: localized.title, href: `/${localizedSlug}` };
  });
  const guideLinks = [
    { name: t("guideLunch"), href: "/guides/time-card-calculator-with-lunch" },
    { name: t("guideBreaks"), href: "/guides/time-card-calculator-with-breaks" },
    { name: t("guideBiweekly"), href: "/guides/biweekly-time-card-calculator" }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">{brand("title")}</span>
            </div>
            <div className="flex items-center text-sm text-gray-400 mb-4">
              <Mail className="h-4 w-4 mr-2" />
              info@time-card-calculator.work
            </div>
            <p className="text-sm text-gray-400 max-w-xl">
              {t("description")}
            </p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">{t("quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t("contact")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/summer0512/time-card-calculator"
                  className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  Github <Github className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3">
            <h3 className="text-lg font-semibold mb-4">{t("popularTools")}</h3>
            <ul className="space-y-2">
              {popularTools.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3">
            <h4 className="text-sm font-semibold text-white mb-2">{t("guides")}</h4>
            <div className="flex flex-wrap gap-3">
              {guideLinks.map((guide) => (
                <Link key={guide.href} href={guide.href} className="text-xs text-gray-400 hover:text-white transition-colors">
                  {guide.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-sm font-semibold text-white mb-2">{t("friendLinks")}</h4>
            <div className="flex flex-wrap gap-3">
              {friendLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  rel={link.follow ? undefined : "nofollow"}
                  target="_blank"
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-gray-400 text-sm text-center">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
