"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TimeCardShareDialog({ cardId, open, onOpenChange, onDisabled }: {
  cardId: string | null; open: boolean; onOpenChange: (open: boolean) => void; onDisabled?: () => void;
}) {
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
      .then(({ sharePath }) => setShareUrl(new URL(sharePath, window.location.origin).toString()))
      .catch((cause) => { if (!(cause instanceof DOMException && cause.name === "AbortError")) setError(t("error")); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [cardId, open, t]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); }
    catch { setError(t("copyError")); }
  };
  const stop = async () => {
    if (!cardId || !window.confirm(t("stopSharingConfirm"))) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/time-cards/${encodeURIComponent(cardId)}/share`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setShareUrl(""); onOpenChange(false); onDisabled?.();
    } catch { setError(t("error")); }
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
