"use client";

import Decimal from "decimal.js";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  OvertimeBasis,
  OvertimeRateType,
  PaymentValidationError,
  PaymentValidationCode,
} from "@/lib/payment";
import { parseLocalizedDecimal } from "@/lib/payment";

export interface EditableOvertimeTier {
  id: string;
  afterHours: string;
  rateType: OvertimeRateType;
  rateValue: string;
}

export interface PaymentSettingsLabels {
  includePaymentInformation: string;
  hourlyPayRate: string;
  currency: string;
  overtime: string;
  calculationBasis: string;
  weekly: string;
  daily: string;
  overtimeTiers: string;
  tier: string;
  after: string;
  hours: string;
  rateType: string;
  multiplier: string;
  fixedHourlyRate: string;
  addOvertimeTier: string;
  removeOvertimeTier: string;
  validationMessages: Record<PaymentValidationCode, string>;
}

interface PaymentSettingsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  hourlyRate: string;
  onHourlyRateChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (value: string) => void;
  overtimeAvailable: boolean;
  overtimeEnabled: boolean;
  onOvertimeEnabledChange: (enabled: boolean) => void;
  basis: OvertimeBasis;
  onBasisChange: (basis: OvertimeBasis) => void;
  tiers: EditableOvertimeTier[];
  onTiersChange: (tiers: EditableOvertimeTier[]) => void;
  errors: PaymentValidationError[];
  labels: PaymentSettingsLabels;
}

const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "BRL"];

export default function PaymentSettings({
  enabled,
  onEnabledChange,
  hourlyRate,
  onHourlyRateChange,
  currency,
  onCurrencyChange,
  overtimeAvailable,
  overtimeEnabled,
  onOvertimeEnabledChange,
  basis,
  onBasisChange,
  tiers,
  onTiersChange,
  errors,
  labels,
}: PaymentSettingsProps) {
  const errorFor = (path: string) => {
    const error = errors.find((item) => item.path === path);
    return error ? labels.validationMessages[error.code] : null;
  };

  const updateTier = (index: number, updates: Partial<EditableOvertimeTier>) => {
    onTiersChange(tiers.map((tier, tierIndex) =>
      tierIndex === index ? { ...tier, ...updates } : tier));
  };

  const addTier = () => {
    const previousThreshold = parseLocalizedDecimal(tiers.at(-1)?.afterHours ?? "");
    const afterHours = previousThreshold !== null && Number.isFinite(previousThreshold)
      ? new Decimal(previousThreshold).plus(10).toString()
      : "40";
    onTiersChange([
      ...tiers,
      {
        id: `tier-${crypto.randomUUID()}`,
        afterHours,
        rateType: "multiplier",
        rateValue: "1.5",
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="includePayment"
          checked={enabled}
          onCheckedChange={(checked) => onEnabledChange(checked === true)}
        />
        <Label htmlFor="includePayment" className="font-semibold text-blue-700">
          {labels.includePaymentInformation}
        </Label>
      </div>

      {enabled && (
        <>
          <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-3">
            <div>
              <Label htmlFor="basePay">{labels.hourlyPayRate}</Label>
              <Input
                id="basePay"
                inputMode="decimal"
                value={hourlyRate}
                onChange={(event) => onHourlyRateChange(event.target.value)}
                className="mt-1 h-9"
              />
              {errorFor("hourlyRate") && (
                <p className="mt-1 text-xs text-red-600">{errorFor("hourlyRate")}</p>
              )}
            </div>
            <div>
              <Label>{labels.currency}</Label>
              <Select value={currency} onValueChange={onCurrencyChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currencyCode) => (
                    <SelectItem key={currencyCode} value={currencyCode}>{currencyCode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {overtimeAvailable && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeOvertime"
                  checked={overtimeEnabled}
                  onCheckedChange={(checked) => onOvertimeEnabledChange(checked === true)}
                />
                <Label htmlFor="includeOvertime" className="font-semibold text-blue-700">
                  {labels.overtime}
                </Label>
              </div>

              {overtimeEnabled && (
                <>
                  <div>
                    <Label>{labels.calculationBasis}</Label>
                    <Select value={basis} onValueChange={(value) => onBasisChange(value as OvertimeBasis)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">{labels.weekly}</SelectItem>
                        <SelectItem value="daily">{labels.daily}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-900">{labels.overtimeTiers}</p>
                    {errorFor("overtime.tiers") && (
                      <p className="text-xs text-red-600">{errorFor("overtime.tiers")}</p>
                    )}
                    {tiers.map((tier, index) => {
                      const tierPath = `overtime.tiers.${index}`;
                      return (
                        <div key={tier.id} className="space-y-3 rounded-lg border bg-gray-50 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">{labels.tier} {index + 1}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onTiersChange(tiers.filter((_, tierIndex) => tierIndex !== index))}
                              className="h-8 text-gray-500 hover:text-red-600"
                              aria-label={`${labels.removeOvertimeTier} ${index + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div>
                            <Label htmlFor={`${tier.id}-threshold`}>{labels.after}</Label>
                            <div className="mt-1 flex items-center gap-2">
                              <Input
                                id={`${tier.id}-threshold`}
                                inputMode="decimal"
                                value={tier.afterHours}
                                onChange={(event) => updateTier(index, { afterHours: event.target.value })}
                              />
                              <span className="text-sm text-gray-600">{labels.hours}</span>
                            </div>
                            {errorFor(`${tierPath}.afterHours`) && (
                              <p className="mt-1 text-xs text-red-600">{errorFor(`${tierPath}.afterHours`)}</p>
                            )}
                          </div>

                          <fieldset className="space-y-2">
                            <legend className="text-sm font-medium">{labels.rateType}</legend>
                            <label className="flex cursor-pointer items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name={`${tier.id}-rate-type`}
                                checked={tier.rateType === "multiplier"}
                                onChange={() => updateTier(index, { rateType: "multiplier" })}
                              />
                              {labels.multiplier}
                            </label>
                            <label className="flex cursor-pointer items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name={`${tier.id}-rate-type`}
                                checked={tier.rateType === "fixed"}
                                onChange={() => updateTier(index, { rateType: "fixed" })}
                              />
                              {labels.fixedHourlyRate}
                            </label>
                          </fieldset>

                          <div className="flex items-center gap-2">
                            <Input
                              aria-label={tier.rateType === "multiplier" ? labels.multiplier : labels.fixedHourlyRate}
                              inputMode="decimal"
                              value={tier.rateValue}
                              onChange={(event) => updateTier(index, { rateValue: event.target.value })}
                            />
                            <span className="text-sm text-gray-600">
                              {tier.rateType === "multiplier" ? "×" : `${currency}/h`}
                            </span>
                          </div>
                          {errorFor(`${tierPath}.rateValue`) && (
                            <p className="text-xs text-red-600">{errorFor(`${tierPath}.rateValue`)}</p>
                          )}
                        </div>
                      );
                    })}

                    <Button type="button" variant="outline" size="sm" onClick={addTier} className="w-full">
                      <Plus className="mr-1 h-4 w-4" />
                      {labels.addOvertimeTier}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
