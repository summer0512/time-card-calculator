"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { trackEvent, type AnalyticsContext } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TimeCardShareDialog({ cardId, open, onOpenChange, onDisabled, analytics }: {
  analytics: AnalyticsContext;
  cardId: string | null; open: boolean; onOpenChange: (open: boolean) => void; onDisabled?: () => void;
}) {
  const { locale, calculator_type, period_type } = analytics;
  const t = useTranslations("TimeCardShare");
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !cardId) return;
    const controller = new AbortController();
    setLoading(true); setError(""); setCopied(false);
    void fetch(`/api/time-cards/${encodeURIComponent(cardId)}/share`, { method: "POST", signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then(({ sharePath }) => { if (controller.signal.aborted) return; setShareUrl(new URL(sharePath, window.location.origin).toString()); trackEvent("time_card_share_link", { locale, calculator_type, period_type }, { method: "link", operation: "generate" }); })
      .catch((cause) => { if (!(cause instanceof DOMException && cause.name === "AbortError")) { setError(t("error")); trackEvent("time_card_share_error", { locale, calculator_type, period_type }, { operation: "generate" }); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [cardId, open, t, locale, calculator_type, period_type]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); trackEvent("time_card_share_copy", analytics, { method: "clipboard", operation: "copy" }); }
    catch { setError(t("copyError")); trackEvent("time_card_share_error", analytics, { operation: "copy" }); }
  };
  const stop = async () => {
    if (!cardId || !window.confirm(t("stopSharingConfirm"))) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/time-cards/${encodeURIComponent(cardId)}/share`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      trackEvent("time_card_share_stop", analytics, { operation: "stop" });
      setShareUrl(""); onOpenChange(false); onDisabled?.();
    } catch { setError(t("error")); trackEvent("time_card_share_error", analytics, { operation: "stop" }); }
    finally { setLoading(false); }
  };

  return <Dialog open={open} onOpenChange={(value) => { if (!loading) onOpenChange(value); }}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle>{t("dialogTitle")}</DialogTitle><DialogDescription>{t("dialogDescription")}</DialogDescription></DialogHeader>
      {loading && !shareUrl ? <div className="flex items-center gap-2 py-5 text-sm text-slate-600" role="status"><Loader2 className="h-4 w-4 animate-spin" />{t("creatingLink")}</div> : <div className="space-y-3">
        <div className="flex gap-2"><Input value={shareUrl} readOnly aria-label={t("shareLink")} /><Button type="button" onClick={copy} disabled={!shareUrl}><>{copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}{copied ? t("copied") : t("copyLink")}</></Button></div>
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      </div>}
      <DialogFooter className="sm:justify-between"><Button type="button" variant="destructive" onClick={stop} disabled={loading || !shareUrl}>{t("stopSharing")}</Button><Button type="button" variant="outline" onClick={() => window.open(shareUrl, "_blank", "noopener,noreferrer")} disabled={!shareUrl}><ExternalLink className="mr-1 h-4 w-4" />{t("openLink")}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
