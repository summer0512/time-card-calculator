# Global Payment v2 + Spanish SEO Pages

## 1. Project Scope

This release contains two related pieces of work:

### Global product feature

Upgrade the existing Payment module into a reusable **Payment v2** system with configurable overtime rules.

The overtime feature must be global and reusable by:

- English pages
- Spanish pages
- Dutch pages
- Existing calculators
- Future calculators

The calculation engine must not contain locale-specific or SEO-page-specific logic.

### Spanish SEO rollout

Launch these three Spanish pages:

1. `/es/calculadora-de-horas`
2. `/es/calculadora-de-horas-extras`
3. `/es/calcular-horas-jornada-partida`

The three pages should reuse existing calculator components and the new global Payment v2 engine.

A dedicated English `/overtime-calculator` page is **not part of this release**.

However, the implementation must make it easy to create such a page later without changing the calculation engine.

---

# 2. Main Architecture Principle

Separate:

```text
Time Calculation
        ↓
Worked Hours
        ↓
Payment Engine
        ↓
Overtime Engine
        ↓
Formatted Results
```

SEO pages should only configure and present these shared systems.

Do not duplicate calculation logic inside individual locale pages.

Recommended conceptual architecture:

```text
Time Engine
│
├── Weekly Time Card
├── Single Shift
├── Multiple In/Out
└── Hours Aggregation
        │
        ▼
Payment Engine
        │
        ├── Regular Pay
        └── Overtime Engine
                │
                ├── Weekly basis
                └── Daily basis
```

---

# 3. Payment v2

Keep the existing payment functionality, but extend it with configurable overtime.

Base configuration:

```ts
type PaymentConfig = {
  enabled: boolean;
  currency: string;
  hourlyRate: number | null;

  overtime: {
    enabled: boolean;
    basis: 'weekly' | 'daily';
    tiers: OvertimeTier[];
  };
};

type OvertimeTier = {
  id: string;
  afterHours: number;
  rateType: 'multiplier' | 'fixed';
  rateValue: number;
};
```

Example:

```ts
const paymentConfig: PaymentConfig = {
  enabled: true,
  currency: 'USD',
  hourlyRate: 20,

  overtime: {
    enabled: true,
    basis: 'weekly',

    tiers: [
      {
        id: 'tier-1',
        afterHours: 40,
        rateType: 'multiplier',
        rateValue: 1.5
      },
      {
        id: 'tier-2',
        afterHours: 50,
        rateType: 'fixed',
        rateValue: 40
      }
    ]
  }
};
```

---

# 4. Tier Data Model

Do not store explicit ranges such as:

```text
0–40
40–50
50–60
60+
```

Store only threshold start points:

```text
after 40 hours
after 50 hours
after 60 hours
```

The end of each tier is derived from the next tier.

Example:

```ts
tiers = [
  { afterHours: 40, ... },
  { afterHours: 50, ... },
  { afterHours: 60, ... }
];
```

Internally this means:

```text
Regular     0–40
Tier 1     40–50
Tier 2     50–60
Tier 3     60+
```

This allows single-tier and multi-tier overtime to use exactly the same algorithm.

---

# 5. Payment UI

Existing Payment UI:

```text
Payment
Hourly Rate
Currency
```

Extend it to:

```text
Payment

Hourly Rate
$ [ 20.00 ] / h

Overtime
[ toggle ]
```

When overtime is disabled:

```text
Hourly Rate
$20.00 / h

Estimated Pay
$800.00
```

When overtime is enabled:

```text
Overtime

Calculation basis
[ Weekly ▼ ]

Overtime tiers

After [ 40 ] hours

Rate type
(●) Multiplier
    [ 1.5 ] ×

( ) Hourly rate
    $ [ 30.00 ] / h


After [ 50 ] hours

Rate type
(●) Multiplier
    [ 2.0 ] ×

( ) Hourly rate
    $ [ 40.00 ] / h


[ + Add overtime tier ]
```

The user must be able to add and remove tiers.

---

# 6. Supported Overtime Rate Types

Each tier supports two mutually exclusive rate types.

## Multiplier

Example:

```text
Base hourly rate:
$20 / h

Overtime multiplier:
1.5×
```

Effective rate:

```text
$20 × 1.5 = $30 / h
```

## Fixed hourly rate

Example:

```text
Base hourly rate:
$20 / h

Overtime hourly rate:
$35 / h
```

Effective overtime rate:

```text
$35 / h
```

Users may mix both types across multiple tiers.

Example:

```text
After 40 h → 1.5×
After 50 h → $42 / h
After 60 h → 2.5×
```

---

# 7. Overtime Basis

The data model and calculation engine must support:

```ts
basis: 'weekly' | 'daily'
```

## Weekly

Thresholds apply independently to each workweek.

Example:

```text
Hourly rate: $20

After 40 h → 1.5×
After 50 h → 2×
```

For 56 worked hours:

```text
0–40
40 h × $20
= $800

40–50
10 h × $30
= $300

50+
6 h × $40
= $240

Total
= $1,340
```

## Daily

The tier counter resets for each day.

Example:

```text
After 8 h → 1.5×
After 12 h → 2×
```

For a 14-hour workday:

```text
0–8
8 regular hours

8–12
4 tier-1 hours

12+
2 tier-2 hours
```

Daily results can then be aggregated into the pay-period total.

---

# 8. Core Tier Algorithm

There must not be separate calculation functions for:

```text
single-tier overtime
multi-tier overtime
```

Both are the same problem.

Sort tiers by:

```ts
afterHours ASC
```

For each tier:

```ts
segmentStart = tier.afterHours;

segmentEnd =
  nextTier?.afterHours ??
  Infinity;

tierHours = Math.max(
  Math.min(totalHours, segmentEnd) - segmentStart,
  0
);
```

For multiplier tiers:

```ts
effectiveRate =
  baseHourlyRate * tier.rateValue;
```

For fixed-rate tiers:

```ts
effectiveRate =
  tier.rateValue;
```

Pay:

```ts
tierPay =
  tierHours * effectiveRate;
```

---

# 9. Regular Hours

Regular hours are all hours before the first overtime threshold.

Example:

```ts
tiers = [
  { afterHours: 40, ... },
  { afterHours: 50, ... }
];
```

Then:

```text
Regular hours:
0–40
```

If total worked hours are 38:

```text
Regular = 38
Overtime = 0
```

If total worked hours are 46:

```text
Regular = 40
Tier 1 = 6
```

---

# 10. Weekly and Biweekly Calculation

Weekly overtime thresholds must always be calculated independently per week.

Example:

```text
Week 1 = 46 h
Week 2 = 38 h

Weekly threshold = 40 h
```

Correct result:

```text
Week 1:
40 regular
6 overtime

Week 2:
38 regular
0 overtime

Combined:
78 regular
6 overtime
```

Incorrect:

```text
84 total hours
80 regular
4 overtime
```

Therefore biweekly calculations should conceptually work like:

```ts
const week1 = calculateWeeklyPay(...);
const week2 = calculateWeeklyPay(...);

const result =
  combinePaymentResults(
    week1,
    week2
  );
```

Do not calculate weekly overtime against the combined two-week total.

---

# 11. Validation Rules

Overtime tiers must be validated before calculation.

## Threshold

```ts
afterHours >= 0
```

Thresholds must be unique.

User input may be entered in any order.

Example:

```text
50
40
60
```

Internally normalize to:

```text
40
50
60
```

## Multiplier

Must be:

```ts
rateValue > 0
```

Examples:

```text
1.25
1.5
2
2.5
```

## Fixed rate

Must be:

```ts
rateValue >= 0
```

## Invalid tiers

Incomplete tiers must not silently participate in calculations.

Example:

```text
After [ ]
Rate [ ]
```

Show an appropriate validation state.

---

# 12. Calculation Precision

Never calculate payment using rounded display hours.

Example:

Internal value:

```text
8.333333...
```

Display value:

```text
8.33
```

Payment must use:

```text
8.333333... × hourlyRate
```

Not:

```text
8.33 × hourlyRate
```

Pipeline:

```text
raw time values
→ precise worked duration
→ payment calculation
→ display formatting
```

Formatting happens last.

---

# 13. Payment Result Breakdown

Without overtime:

```text
Total Hours
40:00

Hourly Rate
$20.00

Estimated Pay
$800.00
```

With overtime:

```text
Total Hours
56:00

Regular Hours
40:00

Overtime Hours
16:00


Regular Pay

40 h × $20.00
$800.00


Overtime Tier 1

40–50 h
10 h × $30.00
$300.00


Overtime Tier 2

50+ h
6 h × $40.00
$240.00


Total Overtime Pay
$540.00

Estimated Total Pay
$1,340.00
```

If a tier uses a fixed rate:

```text
40–50 h

10 h × $35.00 / h
$350.00
```

Do not display a multiplier for fixed-rate tiers.

---

# 14. Localization

All labels must come from locale messages.

Do not hardcode English or Spanish labels inside the calculation engine.

Numbers and currencies must use locale-aware formatting.

Examples:

English:

```text
8.5 h
$1,340.50
```

Spanish:

```text
8,5 h
1340,50 €
```

Use the project's existing `next-intl` / `Intl.NumberFormat` infrastructure.

Do not manually replace:

```text
.
```

with:

```text
,
```

inside formatted strings.

---

# 15. Jurisdiction Rules

The overtime engine is a mathematical rule engine, not a legal compliance engine.

Do not hardcode country or state law into the core calculation logic.

Do not assume:

```text
40 hours
1.5×
```

for every user.

The user must be able to customize:

```text
threshold
rate type
rate
number of tiers
daily vs weekly basis
```

Future jurisdiction presets may configure this engine, but they must remain separate from the engine itself.

Possible future structure:

```ts
type OvertimePreset =
  | 'custom'
  | 'us-federal'
  | 'other-future-preset';
```

Presets are out of scope for this release.

---

# 16. Spanish Page 1

## `/es/calculadora-de-horas`

Purpose:

Primary Spanish hours-worked calculator.

Core search intent:

```text
calculadora de horas
calcular horas trabajadas
calculadora de horas trabajadas
calculadora horas trabajadas
calcular horas de trabajo
contador de horas trabajadas
```

Recommended H1:

```text
Calculadora de Horas
```

Recommended title direction:

```text
Calculadora de Horas – Calcula tus Horas Trabajadas
```

Primary workflow:

```text
Entrada
Salida
Descanso
→ Horas trabajadas
```

Support multiple days:

```text
Lunes
Martes
Miércoles
Jueves
Viernes
...
→ Total semanal
```

Use 24-hour time input.

Examples:

```text
08:30
14:00
16:00
19:00
```

Reuse the existing main time-card calculator.

Payment is available.

Overtime is available but defaults to:

```text
OFF
```

---

# 17. Spanish Page 2

## `/es/calculadora-de-horas-extras`

Purpose:

Dedicated overtime-focused configuration of the shared calculator.

Recommended H1:

```text
Calculadora de Horas Extras
```

Primary workflow:

```text
worked hours
+
base hourly rate
+
custom overtime rules
→
regular hours
overtime hours
regular pay
overtime pay
total estimated pay
```

On this page:

```text
Payment = visible
Overtime = ON
```

The overtime configuration should be visually prominent.

Spanish labels may include:

```text
Tarifa por hora
Horas ordinarias
Horas extra
Cálculo de horas extra
Multiplicador
Tarifa por hora extra
A partir de
Añadir tramo
Pago ordinario
Pago por horas extra
Pago total estimado
```

Example UI:

```text
Tarifa por hora
[ 12,00 € ] / h

Horas extra
[ ON ]

Cálculo
[ Semanal ▼ ]


A partir de
[ 40 ] horas

Tipo de tarifa

(●) Multiplicador
    [ 1,5 ] ×

( ) Tarifa por hora
    [ 15,00 € ] / h


[ + Añadir tramo ]
```

Do not make the page dependent on a specific hardcoded overtime threshold or multiplier.

---

# 18. Spanish Page 3

## `/es/calcular-horas-jornada-partida`

Purpose:

Spanish localization of the existing multiple-in/multiple-out use case.

Reuse the existing:

```text
time-card-calculator-with-multiple-in-and-out
```

calculation model.

Default UI should demonstrate a split workday.

Example:

```text
Tramo 1

Entrada
09:00

Salida
14:00


Tramo 2

Entrada
16:00

Salida
19:00
```

Result:

```text
Primer tramo
5:00

Segundo tramo
3:00

Horas trabajadas
8:00
```

Allow:

```text
+ Añadir tramo
```

Additional periods:

```text
Entrada 3
Salida 3

Entrada 4
Salida 4
```

Calculation:

```text
sum(valid work segments)
```

Payment is available.

Overtime is available but defaults to:

```text
OFF
```

If enabled:

```text
work segments
→ daily/weekly worked hours
→ overtime engine
→ payment engine
```

---

# 19. Spanish Routing and SEO Infrastructure

Add localized routes for:

```text
/es/calculadora-de-horas
/es/calculadora-de-horas-extras
/es/calcular-horas-jornada-partida
```

Ensure each page has:

```text
localized pathname
localized metadata
localized H1
localized content
canonical URL
hreflang
sitemap entry
next-intl messages
24-hour time formatting
es-ES number formatting
es-ES currency formatting
```

---

# 20. English Product Integration

The new overtime feature must also be available in the existing English Payment UI.

However:

```text
DO NOT create /overtime-calculator
```

as part of this implementation.

English users should be able to:

```text
enable overtime
choose daily or weekly
create one or more tiers
set custom thresholds
choose multiplier or fixed hourly rate
view overtime hours
view overtime pay
view total estimated pay
```

This allows the feature to be tested through existing English calculators before making a separate SEO decision.

---

# 21. Future English SEO Page

The architecture must allow a future page such as:

```text
/overtime-calculator
```

to reuse exactly the same:

```text
Time Engine
Payment Engine
Overtime Engine
Result Components
```

A future SEO page should require only:

```text
page configuration
default UI state
metadata
content
internal links
```

and not new payment mathematics.

Do not implement this page in the current release.

---

# 22. Acceptance Tests

## Case 1 — No overtime

Input:

```text
40 h
$20 / h
```

Expected:

```text
Regular:
40 h

Estimated pay:
$800
```

## Case 2 — One multiplier tier

Input:

```text
46 h
$20 / h

After 40 h
1.5×
```

Expected:

```text
Regular:
40 × $20
= $800

Overtime:
6 × $30
= $180

Total:
$980
```

## Case 3 — Multiple multiplier tiers

Input:

```text
56 h
$20 / h

After 40 h → 1.5×
After 50 h → 2×
```

Expected:

```text
40 × $20 = $800
10 × $30 = $300
6 × $40 = $240

Total = $1,340
```

## Case 4 — Fixed overtime rate

Input:

```text
46 h
$20 / h

After 40 h
$35 / h
```

Expected:

```text
40 × $20
= $800

6 × $35
= $210

Total
= $1,010
```

## Case 5 — Mixed tiers

Input:

```text
58 h
$20 / h

After 40 h → 1.5×
After 50 h → $45 / h
```

Expected:

```text
40 × $20
10 × $30
8 × $45
```

## Case 6 — Biweekly

Input:

```text
Week 1 = 46 h
Week 2 = 38 h

Weekly tier:
After 40 h → 1.5×
```

Expected:

```text
Regular = 78 h
Overtime = 6 h
```

Not:

```text
Regular = 80 h
Overtime = 4 h
```

## Case 7 — Daily tiers

Input:

```text
14-hour day

After 8 h → 1.5×
After 12 h → 2×
```

Expected:

```text
Regular = 8 h
Tier 1 = 4 h
Tier 2 = 2 h
```

## Case 8 — Mixed rate types

Input:

```text
Base = $20 / h
Total = 65 h

After 40 → 1.5×
After 50 → $40 / h
After 60 → 2.5×
```

Expected tier allocation:

```text
Regular:
40 h

Tier 1:
10 h

Tier 2:
10 h

Tier 3:
5 h
```

## Case 9 — Spanish formatting

Internal:

```text
8.5 hours
12.5 EUR
```

Display:

```text
8,5 h
12,50 €
```

## Case 10 — Unsorted thresholds

User enters:

```text
60
40
50
```

Internal normalized order:

```text
40
50
60
```

Calculation must be identical to entering the tiers in sorted order.