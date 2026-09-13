"use client";

import type { SupportedLocale } from "@/i18n/config";

import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/routing";
import { useState } from "react";
import {
  Clock,
  ChevronDown,
  UserRound,
  UserCircle,
  LoaderCircle
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import MobileMenuButton from "./mobile-menu-button";
import { useLocale, useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toolCalculators } from "@/lib/tool-calculators";
import { getLocalizedToolSlug, isLocalizedToolEnabled } from "@/lib/i18n-slugs";
import { getLocalizedToolView } from "@/lib/localized-tool-content";
import { LanguageToggle } from "@/components/language-toggle";
import { getGuidesForLocale } from "@/lib/guides";

export default function Header() {
  const locale = useLocale();
  const t = useTranslations("Nav");
  const brand = useTranslations("Header");
  const myTimeCards = useTranslations("MyTimeCards");
  const pathname = usePathname();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuItems = [
    { name: t("home"), href: "/" },
    { name: t("contact"), href: "/contact" }
  ];
  const guideItems = getGuidesForLocale(locale as SupportedLocale).map((guide) => ({
    name: guide.title,
    href: guide.path,
  }));

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname.endsWith("/");
    }
    return pathname.includes(href);
  };

  const isToolsActive = toolCalculators.some((item) =>
    pathname.includes(`/${getLocalizedToolSlug(locale as SupportedLocale, item.slug)}`) || pathname.includes(`/${item.slug}`)
  );
  const isGuidesActive = guideItems.some((item) => pathname.includes(item.href));

  const handleSignIn = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.href
      });
    } catch {
      setIsSigningIn(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">{brand("title")}</span>
          </Link>

          <nav className="hidden md:flex space-x-3">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(item.href) ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600"
                )}
              >
                {item.name}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                    isToolsActive ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600"
                  )}
                >
                  {t("calculators")}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 max-h-96 overflow-auto">
                {toolCalculators.filter((item) => isLocalizedToolEnabled(locale as SupportedLocale, item.slug)).map((item) => {
                  const localizedSlug = getLocalizedToolSlug(locale as SupportedLocale, item.slug)!;
                  const localizedView = getLocalizedToolView(locale as SupportedLocale, item, localizedSlug);
                  return (
                    <DropdownMenuItem key={item.slug} asChild>
                      <Link
                        href={`/${localizedSlug}`}
                        onClick={(event) => {
                          if (typeof window === "undefined") return;
                          const currentUrl = new URL(window.location.href);
                          const targetUrl = new URL(event.currentTarget.href);
                          if (currentUrl.searchParams.has("card") && currentUrl.pathname === targetUrl.pathname) {
                            event.preventDefault();
                            window.history.pushState({}, "", `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`);
                            window.dispatchEvent(new PopStateEvent("popstate"));
                          }
                        }}
                        className={cn(
                          "w-full px-2 py-2 text-sm cursor-pointer",
                          isActive(`/${localizedSlug}`)
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        )}
                      >
                        {localizedView.title}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {guideItems.length > 0 && <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                    isGuidesActive ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600"
                  )}
                >
                  {t("guides")}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                {guideItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <a
                      href={item.href}
                      className={cn(
                        "w-full px-2 py-2 text-sm cursor-pointer",
                        isActive(item.href)
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      )}
                    >
                      {item.name}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <LanguageToggle />
            </div>
            <div className="hidden md:block">
              {isSessionPending ? (
                <button
                  type="button"
                  disabled
                  aria-busy="true"
                  className="flex cursor-wait items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700"
                >
                  <LoaderCircle
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span>{myTimeCards("loading")}</span>
                </button>
              ) : session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <UserCircle className="h-5 w-5" />
                      <span className="max-w-28 truncate">
                        {session.user.name}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer"
                    >
                      <Link href="/my-time-cards">
                        {t("myTimeCards")}
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={isSigningOut}
                      className={cn(
                        "flex items-center gap-2",
                        isSigningOut ? "cursor-wait" : "cursor-pointer"
                      )}
                      onSelect={async (event) => {
                        event.preventDefault();

                        if (isSigningOut) return;

                        setIsSigningOut(true);

                        try {
                          await authClient.signOut();
                        } catch {
                          setIsSigningOut(false);
                        }
                      }}
                    >
                      {isSigningOut && (
                        <LoaderCircle
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      )}
                      {t("signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  type="button"
                  disabled={isSigningIn}
                  aria-busy={isSigningIn}
                  onClick={handleSignIn}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600",
                    isSigningIn
                      ? "cursor-wait"
                      : "cursor-pointer"
                  )}
                >
                  {isSigningIn ? (
                    <LoaderCircle
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <UserRound className="h-4 w-4" />
                  )}

                  {t("signIn")}
                </button>
              )}
            </div>
            <MobileMenuButton />
          </div>
        </div>
      </div>
    </header>
  );
}
