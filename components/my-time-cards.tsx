"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  Copy,
  ExternalLink,
  FileClock,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  WalletCards,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { authClient } from "@/lib/auth-client";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TimeCardListItem } from "@/lib/time-cards/types";

function LoadingState({ label }: { label: string }) {
  return (
    <main className="min-h-[70vh] bg-gradient-to-b from-slate-50/80 via-white to-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <FileClock className="h-5 w-5" />
          </div>
          <div className="w-full max-w-xl space-y-3">
            <div className="h-8 w-52 animate-pulse rounded-md bg-slate-200" />
            <div className="h-4 w-full max-w-md animate-pulse rounded bg-slate-100" />
          </div>
        </div>

        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500" role="status">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{label}</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <Card key={item} className="overflow-hidden border-slate-200/80 shadow-sm">
              <CardHeader className="space-y-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 to-emerald-50/40 pb-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
                </div>
                <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
                <div className="h-10 w-full animate-pulse rounded-md bg-slate-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function MyTimeCards() {
  const t = useTranslations("MyTimeCards");
  const locale = useLocale();
  const { data: session, isPending } = authClient.useSession();

  const [cards, setCards] = useState<TimeCardListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/time-cards", { cache: "no-store" });
      if (!response.ok) throw new Error();
      setCards((await response.json()).cards);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const mutate = async (
    card: TimeCardListItem,
    action: "duplicate" | "rename" | "delete",
  ) => {
    let body: string | undefined;
    let method = "PATCH";

    if (action === "rename") {
      const title = window.prompt(t("renamePrompt"), card.title);
      if (!title?.trim()) return;
      body = JSON.stringify({ action, title: title.trim() });
    } else if (action === "duplicate") {
      body = JSON.stringify({ action });
    } else {
      if (!window.confirm(t("deleteConfirm", { title: card.title }))) return;
      method = "DELETE";
    }

    const response = await fetch(`/api/time-cards/${card.id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (response.ok) {
      await load();
    } else {
      setError(t("error"));
    }
  };

  if (isPending) {
    return <LoadingState label={t("loading")} />;
  }

  if (!session?.user) {
    return (
      <main className="min-h-[70vh] bg-gradient-to-b from-slate-50/80 via-white to-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <Card className="w-full max-w-xl overflow-hidden border-slate-200 shadow-sm">
            <CardContent className="px-6 py-12 text-center sm:px-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <FileClock className="h-7 w-7" />
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                {t("title")}
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
                {t("signInDescription")}
              </p>
              <Button
                className="mt-7 min-w-44"
                onClick={() =>
                  authClient.signIn.social({
                    provider: "google",
                    callbackURL: window.location.href,
                  })
                }
              >
                {t("continueGoogle")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (loading) {
    return <LoadingState label={t("loading")} />;
  }

  return (
    <main className="min-h-[70vh] bg-gradient-to-b from-slate-50/80 via-white to-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-200/60">
              <FileClock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {t("title")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {t("description")}
              </p>
            </div>
          </div>

          {cards.length > 0 && (
            <Button asChild className="shrink-0">
              <Link href="/">{t("create")}</Link>
            </Button>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {cards.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-white/90 shadow-sm">
            <CardContent className="px-6 py-16 text-center sm:py-20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-emerald-100 text-blue-700 ring-1 ring-blue-200/60">
                <FileClock className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-slate-900">
                {t("emptyTitle")}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                {t("emptyDescription")}
              </p>
              <Button asChild className="mt-6">
                <Link href="/">{t("create")}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {cards.map((card) => {
              const formattedPay =
                card.paymentEnabled && card.cachedTotalPay !== null
                  ? new Intl.NumberFormat(locale, {
                      style: "currency",
                      currency: card.currency ?? "USD",
                    }).format(Number(card.cachedTotalPay))
                  : null;

              const formattedDate = new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
              }).format(new Date(card.updatedAt));

              return (
                <Card
                  key={card.id}
                  className="group overflow-hidden border-slate-200/90 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <CardHeader className="flex-row items-start justify-between space-y-0 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-white to-emerald-50/50 px-5 py-5">
                    <div className="min-w-0 pr-3">
                      <h2 className="truncate text-lg font-semibold text-slate-900">
                        {card.title}
                      </h2>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-xs font-medium capitalize text-slate-600 shadow-sm">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                        {card.periodType.replaceAll("_", " ")}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 shrink-0 rounded-full p-0 text-slate-500 hover:bg-white hover:text-slate-900"
                          aria-label={t("moreActions", { title: card.title })}
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => mutate(card, "rename")}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("rename")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => mutate(card, "duplicate")}>
                          <Copy className="mr-2 h-4 w-4" />
                          {t("duplicate")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onSelect={() => mutate(card, "delete")}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>

                  <CardContent className="p-5">
                    <dl className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                        <dt className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Clock3 className="h-3.5 w-3.5 text-blue-600" />
                          {t("hours")}
                        </dt>
                        <dd className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900">
                          {(card.cachedTotalMinutes / 60).toFixed(2)}
                        </dd>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                        <dt className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <WalletCards className="h-3.5 w-3.5 text-emerald-600" />
                          {t("pay")}
                        </dt>
                        <dd className="mt-1.5 truncate text-xl font-semibold tracking-tight text-slate-900">
                          {formattedPay ?? "—"}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{t("updated")}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-medium text-slate-700">{formattedDate}</span>
                    </div>

                    <Button asChild className="mt-5 w-full">
                      <NextLink href={`${card.sourcePath}?card=${encodeURIComponent(card.id)}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {t("open")}
                      </NextLink>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
