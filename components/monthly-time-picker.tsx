"use client";

import { useId, useState } from "react";
import { Clock3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { normalizeTimeTo24Hour } from "@/lib/time-cards/time";

export default function MonthlyTimePicker({ label, value, onChange }: {
  label: string; value: string; onChange: (value: string) => void;
}) {
  const id = useId();
  const t = useTranslations("MonthlyCalculator");
  const [open, setOpen] = useState(false);
  const normalized = normalizeTimeTo24Hour(value);
  const [hour, minute] = (normalized || "09:00").split(":");
  return <div className="min-w-0 space-y-1.5">
    <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
    <div className="relative">
      <Input id={id} value={value} placeholder="09:00" maxLength={12} aria-invalid={!!value && !normalized}
        className="h-10 pr-10 tabular-nums" onChange={event => onChange(event.target.value)}
        onBlur={() => { if (normalized) onChange(normalized); }} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8 text-blue-600" aria-label={`${t("chooseTime")}: ${label}`}><Clock3 className="h-4 w-4" /></Button></PopoverTrigger>
        <PopoverContent align="end" className="w-64 space-y-4 rounded-xl border-blue-100 p-4" aria-label={`${t("chooseTime")}: ${label}`}>
          <div className="flex items-center justify-between"><span className="text-sm font-medium">{label}</span><span className="font-semibold tabular-nums text-blue-700">{hour}:{minute}</span></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><span id={`${id}-hour`} className="text-xs font-medium text-slate-500">{t("hour")}</span>
              <Select value={hour} onValueChange={next => onChange(`${next}:${minute}`)}><SelectTrigger aria-labelledby={`${id}-hour`}><SelectValue /></SelectTrigger><SelectContent className="max-h-60">{Array.from({ length: 24 }, (_, n) => String(n).padStart(2, "0")).map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1.5"><span id={`${id}-minute`} className="text-xs font-medium text-slate-500">{t("minute")}</span>
              <Select value={minute} onValueChange={next => onChange(`${hour}:${next}`)}><SelectTrigger aria-labelledby={`${id}-minute`}><SelectValue /></SelectTrigger><SelectContent className="max-h-60">{Array.from({ length: 60 }, (_, n) => String(n).padStart(2, "0")).map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <Button type="button" className="w-full" onClick={() => setOpen(false)}>{t("done")}</Button>
        </PopoverContent>
      </Popover>
    </div>
  </div>;
}
