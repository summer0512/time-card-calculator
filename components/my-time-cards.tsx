"use client";
import { useEffect, useState } from "react";
import { Copy, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { TimeCardListItem } from "@/lib/time-cards/types";
import { useLocale, useTranslations } from "next-intl";

export default function MyTimeCards() {
  const t = useTranslations("MyTimeCards"); const locale = useLocale(); const { data: session, isPending } = authClient.useSession();
  const [cards, setCards] = useState<TimeCardListItem[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const load = async () => { setLoading(true); setError(""); try { const response = await fetch("/api/time-cards", { cache: "no-store" }); if (!response.ok) throw new Error(); setCards((await response.json()).cards); } catch { setError(t("error")); } finally { setLoading(false); } };
  useEffect(() => { if (session?.user) void load(); }, [session?.user?.id]);
  const mutate = async (card: TimeCardListItem, action: "duplicate" | "rename" | "delete") => {
    let body: string | undefined; let method = "PATCH";
    if (action === "rename") { const title = window.prompt(t("renamePrompt"), card.title); if (!title?.trim()) return; body = JSON.stringify({ action, title: title.trim() }); }
    else if (action === "duplicate") body = JSON.stringify({ action });
    else { if (!window.confirm(t("deleteConfirm", { title: card.title }))) return; method = "DELETE"; }
    const response = await fetch(`/api/time-cards/${card.id}`, { method, headers: { "Content-Type": "application/json" }, body }); if (response.ok) await load(); else setError(t("error"));
  };
  if (isPending) return <p className="py-12 text-center text-gray-600">{t("loading")}</p>;
  if (!session?.user) return <div className="mx-auto max-w-lg py-20 text-center"><h1 className="text-3xl font-bold">{t("title")}</h1><p className="mt-3 text-gray-600">{t("signInDescription")}</p><Button className="mt-6" onClick={() => authClient.signIn.social({ provider: "google", callbackURL: window.location.href })}>{t("continueGoogle")}</Button></div>;
  return <main className="mx-auto max-w-5xl px-4 py-10"><div className="mb-8"><h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1><p className="mt-2 text-gray-600">{t("description")}</p></div>
    {error && <p role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
    {loading ? <p>{t("loading")}</p> : cards.length === 0 ? <Card><CardContent className="py-14 text-center"><h2 className="text-xl font-semibold">{t("emptyTitle")}</h2><p className="mt-2 text-gray-600">{t("emptyDescription")}</p><Button asChild className="mt-5"><Link href="/">{t("create")}</Link></Button></CardContent></Card> : <div className="grid gap-4 sm:grid-cols-2">{cards.map((card) => <Card key={card.id}><CardHeader className="flex-row items-start justify-between space-y-0"><div><h2 className="font-semibold text-gray-900">{card.title}</h2><p className="mt-1 text-sm capitalize text-gray-500">{card.periodType.replace("_", " ")}</p></div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" aria-label={t("moreActions", { title: card.title })}><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => mutate(card, "rename")}><Pencil className="mr-2 h-4 w-4" />{t("rename")}</DropdownMenuItem><DropdownMenuItem onSelect={() => mutate(card, "duplicate")}><Copy className="mr-2 h-4 w-4" />{t("duplicate")}</DropdownMenuItem><DropdownMenuItem className="text-red-600" onSelect={() => mutate(card, "delete")}><Trash2 className="mr-2 h-4 w-4" />{t("delete")}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></CardHeader><CardContent><dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-gray-500">{t("hours")}</dt><dd className="font-medium">{(card.cachedTotalMinutes / 60).toFixed(2)}</dd></div>{card.paymentEnabled && card.cachedTotalPay !== null && <div><dt className="text-gray-500">{t("pay")}</dt><dd className="font-medium">{new Intl.NumberFormat(locale, { style: "currency", currency: card.currency ?? "USD" }).format(Number(card.cachedTotalPay))}</dd></div>}<div className="col-span-2"><dt className="text-gray-500">{t("updated")}</dt><dd>{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(card.updatedAt))}</dd></div></dl><Button asChild className="mt-5 w-full"><a href={`${card.sourcePath}?card=${card.id}`}><ExternalLink className="mr-2 h-4 w-4" />{t("open")}</a></Button></CardContent></Card>)}</div>}
  </main>;
}
