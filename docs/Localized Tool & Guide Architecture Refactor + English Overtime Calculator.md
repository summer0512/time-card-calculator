# Localized Tool & Guide Architecture Refactor + English Overtime Calculator

## Overview

This task has **three main workstreams** and should be completed as one coherent architecture cleanup.

### Main Task 1
Refactor the existing Spanish calculator pages so that all localized calculator landing pages use the existing shared dynamic tool route and `ToolLandingPage`.

This includes:

- removing `SpanishCalculatorPage`;
- removing the dedicated Spanish calculator route implementations;
- preserving all existing Spanish public URLs and SEO content;
- improving `ToolLandingPage` and the supporting localization layer so locale-specific calculator behavior is data-driven;
- fixing language switching so a tool only exposes languages in which that specific tool actually exists;
- making related tools, hreflang/alternate paths, guides, currencies, schema, and localized paths use the same availability model.

### Main Task 2
Add the new English calculator page:

```text
/time-card-calculator-with-overtime
```

and model it as the English version of the same canonical tool as the existing Spanish page:

```text
/es/calculadora-de-horas-extras
```

The English page must reuse the existing payment/overtime functionality.

### Main Task 3
Consolidate the existing English and French guide pages into a shared guide architecture.

Preserve all existing public guide URLs.

The objective is to eliminate duplicated 180–350+ line guide page implementations while keeping calculator pages and informational guide pages as separate page types.

---

# 1. Core Architecture Principle

Use this principle when making implementation decisions:

> **Share rendering and business logic; localize URLs, content, page availability, and defaults through configuration.**

A new localized version of an existing calculator should normally require:

1. a localized slug;
2. localized SEO/content;
3. optional locale/tool calculator overrides.

It should **not** require:

- a new page component;
- a new calculator engine;
- a new copy of `ToolLandingPage`;
- another `locale === "xx"` branch inside the renderer.

Likewise, a new guide should normally require guide content/configuration rather than another 300-line custom `page.tsx`.

---

# 2. Preserve Existing Public URLs

This is an architecture refactor, **not an SEO URL migration**.

Do not change existing public URLs unless absolutely required by existing project constraints.

The following Spanish URLs must remain unchanged:

```text
/es/calculadora-de-horas
/es/calculadora-de-horas-extras
/es/calcular-horas-jornada-partida
```

The following English guide URLs must remain unchanged:

```text
/guides/biweekly-time-card-calculator
/guides/time-card-calculator-with-breaks
/guides/time-card-calculator-with-lunch
```

The following French guide URL must remain unchanged:

```text
/fr/comment-calculer-heures-travail
```

The new English overtime page should be:

```text
/time-card-calculator-with-overtime
```

Do not introduce `/en/` into existing default-English URLs if the current routing architecture hides the default locale.

Do not create unnecessary 301 migrations solely for directory consistency.

---

# 3. Final High-Level Architecture

The final conceptual architecture should be:

```text
                         Localized URL
                              │
                ┌─────────────┴─────────────┐
                │                           │
              Tools                       Guides
                │                           │
       canonical tool ID           canonical guide ID
                │                           │
       localized tool data         localized guide data
                │                           │
        ToolLandingPage             GuideLandingPage
                │                           │
      TimeCardCalculator            Article content
```

Both page types should share reusable infrastructure for:

```text
Locale typing
Site configuration
Localized paths
Locale availability
Language-switch destinations
Alternate/hreflang generation
Localized internal links
```

But calculator and guide rendering must remain separate.

---

# Main Task 1 — Refactor Localized Calculator Architecture

# 4. Use `[locale]/[tool]` as the Shared Calculator Route

The existing route:

```text
app/[locale]/[tool]/page.tsx
```

already follows the correct conceptual flow:

```text
localized slug
→ canonical slug
→ toolCalculatorMap
→ ToolLandingPage
```

This should become the single route architecture for localized calculator landing pages.

All three existing Spanish calculators should be migrated into this system.

After migration, remove the dedicated Spanish calculator page implementations.

---

# 5. Remove `SpanishCalculatorPage`

Remove:

```text
components/spanish-calculator-page.tsx
```

but only after migrating all of its responsibilities.

Do **not** simply delete the component and route Spanish pages into the current `ToolLandingPage` without preserving:

- Spanish SEO content;
- Spanish calculator defaults;
- Spanish currency behavior;
- 24-hour time formatting;
- payment behavior;
- overtime behavior;
- page-specific calculator modes;
- existing FAQs/examples;
- related-page behavior where applicable.

The current Spanish content should remain localized data.

The current Spanish calculator behavior should become localized calculator configuration.

---

# 6. Remove Dedicated Spanish Tool Route Implementations

After the shared dynamic route can successfully render the pages, remove the dedicated implementations for:

```text
app/[locale]/calculadora-de-horas/
app/[locale]/calculadora-de-horas-extras/
app/[locale]/calcular-horas-jornada-partida/
```

Their public URLs must continue returning `200` through:

```text
app/[locale]/[tool]/page.tsx
```

No redirects should be introduced because the URLs are not changing.

---

# 7. Canonical Tool Identity vs Localized Slug

Internally, tools should have one canonical identity.

Example:

```text
canonical tool:
time-card-calculator-with-overtime

English slug:
time-card-calculator-with-overtime

Spanish slug:
calculadora-de-horas-extras
```

These are not separate calculators.

They are localized versions of the same logical tool.

Do not model the Spanish overtime page as an unrelated tool simply because its public slug is different.

The same principle should be applied to the other existing Spanish calculator pages.

For each Spanish page:

- reuse an existing canonical tool ID when it genuinely represents the same calculator;
- otherwise create a suitable canonical tool identity;
- do not force unrelated tools together merely to reduce configuration.

---

# 8. Clean Up Slug / Path Terminology

Avoid ambiguous variables such as:

```text
config.slug
localizedView.slug
canonicalPath
```

when their semantic meaning is unclear.

Prefer explicit terminology:

```text
canonicalSlug
localizedSlug
localizedPath
canonicalUrl
```

Example:

```text
canonicalSlug
time-card-calculator-with-overtime

localizedSlug
calculadora-de-horas-extras

localizedPath
/es/calculadora-de-horas-extras

canonicalUrl
https://time-card-calculator.work/es/calculadora-de-horas-extras
```

Introduce or improve helpers so callers do not manually concatenate locale prefixes and slugs.

Recommended capability:

```ts
getLocalizedToolPath(
  locale,
  canonicalSlug
): string | null
```

Reuse existing helpers where possible instead of creating redundant versions.

---

# 9. Add Explicit Tool Availability by Locale

This is a required architectural change.

The system must distinguish:

```text
The website supports Spanish.
```

from:

```text
This specific calculator has a Spanish version.
```

Introduce reliable APIs equivalent to:

```ts
isToolAvailableInLocale(
  canonicalSlug,
  locale
): boolean
```

and:

```ts
getAvailableToolLocales(
  canonicalSlug
): Locale[]
```

Availability should ideally be derived from the authoritative localized tool registry / slug / content configuration.

Do not maintain several unrelated duplicated availability lists.

A locale counts as available only if the tool has a real localized page that can render successfully.

An English fallback must **not** automatically make a tool available in another locale.

---

# 10. Fix the Language Switcher

This is a required regression fix.

Current problematic example:

```text
/de/stundenrechner-monat
```

If Spanish is selected, the application may construct:

```text
/es/stundenrechner-monat
```

which does not exist.

This must no longer be possible.

## Required Tool-Page Behavior

When the current page is a calculator/tool page:

1. resolve the current localized slug to the canonical tool;
2. get the actual locales available for that canonical tool;
3. show only those locales in the language switcher;
4. resolve the target locale back to the correct localized path.

Never switch languages by only replacing the locale prefix while preserving the current slug.

The correct model is:

```text
current localized URL
→ canonical tool
→ target locale
→ target localized slug/path
```

Example:

```text
/time-card-calculator-with-overtime
```

switch to Spanish:

```text
/es/calculadora-de-horas-extras
```

Spanish overtime page switching to English:

```text
/es/calculadora-de-horas-extras
→
/time-card-calculator-with-overtime
```

Example:

```text
/de/stundenrechner-monat
```

If no Spanish version exists:

```text
Spanish must not appear in the language switcher.
```

The application must never offer:

```text
/es/stundenrechner-monat
```

---

# 11. Do Not Break Language Switching on Other Page Types

Do not globally replace the current language-switch implementation with tool-specific assumptions.

Existing behavior for pages such as:

```text
homepage
privacy
terms
contact
other generic localized pages
```

must continue working.

Use route-type-aware behavior.

Conceptually:

```text
if current route is a known tool:
    use canonical-tool localized alternatives

else if current route is a known guide:
    use canonical-guide localized alternatives

else:
    preserve the existing generic locale-switch behavior
```

Do not guess alternate URLs for localized tools or guides.

---

# 12. Strongly Type Locale

Avoid:

```ts
locale: string
```

for localized calculator/page infrastructure.

Reuse the project's existing locale type if one exists.

Otherwise derive it from the authoritative locale configuration, e.g.:

```ts
type Locale =
  (typeof languages)[number]["value"];
```

Use the same type in:

```text
ToolLandingPage
tool slug helpers
tool availability helpers
calculator config resolver
guide resolver
language-switch resolution
```

Do not introduce competing locale type definitions.

---

# 13. Move Calculator Locale Logic Out of `ToolLandingPage`

`ToolLandingPage` should not contain growing logic such as:

```ts
locale === "de"
locale === "fr"
locale === "es"
locale === "pt-br"
```

for calculator behavior.

Create a dedicated resolver.

Suggested file:

```text
lib/localized-calculator-config.ts
```

Suggested capability:

```ts
resolveLocalizedCalculatorProps(
  locale,
  toolConfig
)
```

The final calculator props should conceptually be resolved in this order:

```text
canonical tool calculator config
        +
locale-wide defaults
        +
locale + tool-specific overrides
```

`ToolLandingPage` should eventually render something as simple as:

```tsx
const calculatorProps =
  resolveLocalizedCalculatorProps(locale, config);

<TimeCardCalculator {...calculatorProps} />
```

---

# 14. Locale-Wide Calculator Defaults

Centralize common locale behavior.

Conceptual example only:

```ts
const localeDefaults = {
  en: {
    timeFormat: "auto",
    currencyCode: "USD",
  },

  es: {
    timeFormat: "24h",
    currencyCode: "EUR",
  },

  de: {
    timeFormat: "24h",
    currencyCode: "EUR",
  },

  fr: {
    timeFormat: "24h",
    currencyCode: "EUR",
  },

  "pt-br": {
    timeFormat: "24h",
    currencyCode: "BRL",
  },
};
```

Use the project's actual supported locale set.

Do not add unsupported locales merely because they appear in this example.

---

# 15. Distinguish Currency Code and Display Value

Where required, distinguish:

```text
currency code:
USD
EUR
BRL
```

from UI display values:

```text
$
€
R$
```

Structured data should use valid ISO currency codes.

Do not use:

```text
R$
```

as Schema.org `priceCurrency`.

Keep compatibility with the existing calculator currency model rather than rewriting the entire currency system if unnecessary.

---

# 16. Add Locale + Tool-Specific Overrides

Some calculators require behavior that cannot be expressed through locale-wide defaults.

The existing Spanish overtime page is the main example.

Support configuration conceptually like:

```ts
toolLocaleOverrides = {
  es: {
    "time-card-calculator-with-overtime": {
      ...
    }
  },

  en: {
    "time-card-calculator-with-overtime": {
      ...
    }
  }
};
```

Use the project's existing calculator prop types.

Do not create untyped configuration blobs.

---

# 17. Preserve Existing Spanish Overtime Defaults

The Spanish page:

```text
/es/calculadora-de-horas-extras
```

must preserve its existing behavior:

```text
time format: 24-hour

payment enabled

currency: EUR

payment presentation: popover

payment settings open by default

overtime enabled

overtime basis: weekly

tier 1 starts after 40 hours

tier 1 rate type: multiplier

tier 1 rate: 1.5×
```

Preserve the existing hourly-rate default unless there is a clear existing project-level reason to change it.

This refactor is not intended to redesign the Spanish product.

---

# 18. Correctly Merge Nested Calculator Configuration

Do not rely only on:

```ts
{
  ...baseConfig,
  ...override
}
```

because calculator settings contain nested objects.

Important nested structures include:

```text
paymentDefaults
paymentDefaults.overtime
paymentDefaults.overtime.tiers
```

A partial locale override must not accidentally erase unrelated base configuration.

Implement an explicit merge strategy.

For arrays such as overtime tiers:

```text
replace intentionally
```

rather than automatically concatenating values.

Add tests or at least direct validation for nested payment/overtime merge behavior.

---

# 19. Improve `ToolLandingPage` Locale Independence

After the refactor, adding a future locale should normally **not require changing `ToolLandingPage.tsx`**.

Remove direct calculator-related locale branching from the component.

Keep normal UI translation behavior such as:

```ts
useTranslations("ToolPage")
```

That is appropriate.

Localized SEO/page content can continue being supplied through something equivalent to:

```ts
getLocalizedToolView(...)
```

The goal is not to remove localization from the page.

The goal is to remove **locale-specific business logic** from the renderer.

---

# 20. Localize Breadcrumb Structured Data

Visible breadcrumb translation and structured-data breadcrumb translation should agree.

Do not hardcode:

```text
Home
https://time-card-calculator.work/
```

for every locale.

Examples:

```text
English:
Home
/

Spanish:
Inicio
/es

French:
Accueil
/fr
```

Reuse existing translations/helpers where possible.

Avoid creating another hardcoded locale-name map inside `ToolLandingPage`.

---

# 21. Fix Structured Data Currency

Do not hardcode:

```text
priceCurrency: "USD"
```

for every localized calculator page.

Resolve the value from localized page/calculator configuration.

Examples:

```text
English overtime:
USD

Spanish overtime:
EUR

pt-BR localized calculator:
BRL
```

Use ISO codes.

---

# 22. Localize Open Graph Alt Text

Do not generate hybrid-language strings such as:

```text
Calculadora de Horas Extras tool preview
```

Move the generic suffix/pattern into the translation system.

Conceptual translation:

```text
en:
{title} tool preview

es:
Vista previa de {title}

fr:
Aperçu de {title}
```

Use existing i18n conventions.

---

# 23. Make Related Calculators Locale-Aware

Do not assume every canonical related tool exists in the current locale.

Before rendering a related calculator:

```ts
isToolAvailableInLocale(
  relatedCanonicalSlug,
  locale
)
```

must be true.

Related tool URLs must be generated through the localized path resolver.

Do not create guessed URLs such as:

```text
/es/<english-tool-slug>
```

unless that exact localized page is intentionally registered.

---

# 24. Tool Alternate Paths / Hreflang

Generate tool alternate URLs from actual availability.

For overtime:

```text
en:
/time-card-calculator-with-overtime

es:
/es/calculadora-de-horas-extras
```

If French and German overtime pages do not exist yet:

```text
do not emit French or German alternate URLs
```

The same source of truth should ideally power:

```text
tool language switcher
tool alternatePaths / hreflang
related-tool path resolution
```

This prevents these systems from drifting apart.

---

# 25. Avoid Duplicate Tool Localization Sources of Truth

Do not independently maintain all of these if they can be derived from the same registry:

```text
localized slug map
tool availability map
language-switcher map
hreflang map
localized path map
```

Prefer one authoritative tool localization source from which the following can be derived:

```text
localized slug
localized path
available locales
alternate paths
language-switch targets
```

Consistency requirements:

> If a locale appears as a tool language-switch option, the target URL must return `200`.

> If a locale appears in tool hreflang, that localized page must actually exist.

---

# 26. Suggested Tool Helper APIs

Reuse current helpers whenever possible.

The architecture should provide capabilities equivalent to:

```ts
getLocalizedToolSlug(
  locale,
  canonicalSlug
)

resolveLocalizedToolSlug(
  locale,
  localizedSlug
)

getLocalizedToolPath(
  locale,
  canonicalSlug
)

isToolAvailableInLocale(
  canonicalSlug,
  locale
)

getAvailableToolLocales(
  canonicalSlug
)

getToolAlternatePaths(
  canonicalSlug
)

resolveLocalizedCalculatorProps(
  locale,
  toolConfig
)
```

Names may differ.

Do not duplicate existing functions solely to match this document.

---

# 27. Optional Tool Page Resolver

If `ToolLandingPage` would otherwise need to call many separate helpers, introduce:

```text
lib/resolve-tool-page.ts
```

Possible API:

```ts
resolveToolPage(
  locale,
  config
)
```

Possible output:

```ts
{
  canonicalSlug,
  localizedSlug,
  localizedPath,
  view,
  calculatorProps,
  alternatePaths,
  relatedTools,
  guide,
  schemaCurrency,
}
```

Do not over-engineer this abstraction if a smaller solution is cleaner.

---

# Main Task 2 — Add English Time Card Calculator with Overtime

# 28. Create the Canonical Overtime Tool

Create or formalize the canonical tool identity:

```text
time-card-calculator-with-overtime
```

It currently has at least two localized versions:

```text
English:
/time-card-calculator-with-overtime

Spanish:
/es/calculadora-de-horas-extras
```

Both pages must use:

```text
same canonical tool
same TimeCardCalculator implementation
same payment/overtime calculation engine
different localized SEO content/configuration
```

---

# 29. English Overtime Calculator Defaults

The new English page should immediately present the overtime workflow.

Required default behavior:

```text
Payment enabled

Overtime enabled

Payment presentation uses the existing popover behavior

Payment/overtime settings open by default

Currency = USD

Overtime basis = weekly

Tier 1 begins after 40 hours

Tier 1 rate type = multiplier

Tier 1 multiplier = 1.5×
```

Do not implement another overtime calculation system.

Reuse the existing production-ready payment/overtime feature.

For default hourly rate:

- preserve an existing product default if the application already defines one;
- otherwise avoid inventing an arbitrary US wage solely for SEO.

---

# 30. English Overtime SEO Positioning

Primary intent:

```text
Time Card Calculator with Overtime
```

Recommended H1:

```text
Time Card Calculator with Overtime
```

Recommended subtitle direction:

```text
Calculate regular hours, overtime hours, and total pay with customizable overtime thresholds and rates.
```

Create normal English localized SEO content using the same architecture as other tools.

The page should naturally cover:

```text
regular hours
overtime hours
weekly overtime
overtime threshold
overtime multiplier
overtime hourly rate
hourly pay
regular pay
overtime pay
total pay
custom overtime tiers
```

Do not overstuff keywords.

---

# 31. Do Not Create Additional Overtime Variant Pages

Do not create URLs such as:

```text
/time-card-calculator-with-overtime-and-lunch
/weekly-time-card-calculator-with-overtime
/biweekly-time-card-calculator-with-overtime
/overtime-time-card-calculator
/time-clock-calculator-with-overtime
```

The new overtime page should cover these closely related variations where appropriate.

The goal is one strong overtime landing page, not another set of near-duplicate SEO pages.

---

# 32. English/Spanish Overtime Language Switching

English:

```text
/time-card-calculator-with-overtime
```

should offer Spanish because a real Spanish equivalent exists.

Selecting Spanish must navigate directly to:

```text
/es/calculadora-de-horas-extras
```

Spanish should offer English and navigate directly to:

```text
/time-card-calculator-with-overtime
```

No redirect chain.

No guessed slug.

No 404.

If overtime does not yet exist in another locale:

```text
that locale should not appear as an overtime-page language option
```

---

# 33. Overtime Internal Linking

Add the new English overtime tool to appropriate existing calculator relationships.

Relevant candidate clusters include:

```text
time card
biweekly time card
timesheet
lunch / break calculators
```

Do not add the page indiscriminately to every calculator.

The overtime page itself should link to a small set of genuinely related tools.

Related links must respect locale availability.

---

# 34. Overtime Discoverability

Ensure:

```text
/time-card-calculator-with-overtime
```

is not orphaned.

Use the project's existing mechanisms to include it in appropriate:

```text
calculator listings
related calculator links
sitemap generation
static generation
```

Do not introduce a special navigation system solely for this page.

---

# 35. Preserve Existing Analytics

Reuse existing calculator analytics.

Do not create duplicate analytics events solely because the page is:

```text
English
Spanish
overtime-specific
```

If existing events already capture:

```text
locale
path
payment state
overtime state
```

preserve that behavior.

Analytics redesign is out of scope.

---

# Main Task 3 — Consolidate English and French Guides

# 36. Current Guides to Consolidate

Existing English guides:

```text
/guides/biweekly-time-card-calculator
/guides/time-card-calculator-with-breaks
/guides/time-card-calculator-with-lunch
```

Existing French guide:

```text
/fr/comment-calculer-heures-travail
```

These currently use independent page implementations.

The goal is to preserve their content/search intent/public URLs while consolidating their rendering architecture.

---

# 37. Keep Guides Separate from Calculator Landing Pages

Do not migrate informational guides into `ToolLandingPage`.

The architecture should remain:

```text
Calculator page
→ ToolLandingPage

Informational article / guide
→ GuideLandingPage
```

This separation is intentional.

Calculator and article pages have different:

```text
search intent
structured data
content shape
layout needs
CTA behavior
```

---

# 38. Create a Shared `GuideLandingPage`

Introduce a reusable component such as:

```text
components/guide-landing-page.tsx
```

It should handle shared guide-page concerns, including:

```text
HeadInfo
canonical URL
alternatePaths where applicable
breadcrumb UI
BreadcrumbList schema
Article schema
optional FAQPage schema
hero
guide body rendering
calculator CTA
related calculator links
optional related guide links
```

Do not create separate:

```text
EnglishGuidePage
FrenchGuidePage
GermanGuidePage
```

components.

---

# 39. Create a Canonical Guide Registry

Guides should have canonical identity independent from localized URL.

Conceptually:

```ts
type GuideId =
  | "biweekly-time-card"
  | "time-card-with-breaks"
  | "time-card-with-lunch"
  | "calculate-work-hours";
```

Exact names are flexible.

A guide entry should conceptually support:

```ts
{
  id: "...",

  locales: {
    en: {
      path: "...",
      seo: {...},
      content: {...}
    },

    fr: {
      path: "...",
      seo: {...},
      content: {...}
    }
  }
}
```

Do not assume every guide has every locale.

---

# 40. Preserve Guide Public URLs

The refactor must not move:

```text
/guides/time-card-calculator-with-lunch
```

to:

```text
/en/guides/...
```

The French guide should not be moved from:

```text
/fr/comment-calculer-heures-travail
```

to:

```text
/fr/guides/comment-calculer-heures-travail
```

solely for symmetry.

Internal architecture and external URL structure do not have to be identical.

---

# 41. English Guide Routing

The three current English guide directories may be consolidated into:

```text
app/guides/[guide]/page.tsx
```

provided that the existing URLs remain exactly unchanged.

The dynamic route should resolve:

```text
English guide slug
→ canonical guide ID
→ localized guide data
→ GuideLandingPage
```

Provide `generateStaticParams()` if required by the current build/static-generation architecture.

Do not introduce `/en/guides/...`.

---

# 42. French Guide Routing

The French guide has a special existing URL:

```text
/fr/comment-calculer-heures-travail
```

Do not perform a large routing rewrite merely to make this visually match `/guides/...`.

If necessary, keep a **thin route adapter** at the existing path:

```tsx
export default function Page() {
  return (
    <GuideLandingPage
      locale="fr"
      guideId="calculate-work-hours"
    />
  );
}
```

A small route adapter is acceptable.

The problem to eliminate is the independent ~189-line page implementation, not the existence of an exact route file.

---

# 43. Preserve Existing Guide Content During Migration

Do not use this architecture task as an excuse to rewrite all article content.

Preserve existing:

```text
titles
descriptions
headings
paragraphs
examples
tips
troubleshooting content
FAQs
search intent
CTA meaning
```

unless required to fix:

```text
an objectively broken link
incorrect metadata
incorrect structured data
incorrect locale output
```

SEO copy rewriting is out of scope.

---

# 44. Use Structured Guide Content Rather Than Duplicated Layout

The existing English guides share substantial layout patterns.

Extract content from layout.

Use a typed structure capable of representing the blocks currently needed by the guides.

Potential block types include:

```ts
type GuideBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | CalloutBlock
  | CardGridBlock
  | ExampleBlock;
```

The exact structure is flexible.

Do not build a general-purpose CMS.

Only support the content patterns actually required by the existing four guide pages.

Prefer TypeScript data/config where it improves type safety.

Do not store giant raw HTML strings merely to avoid building a small renderer.

---

# 45. Preserve Useful Guide Presentation

This refactor is not a visual redesign.

The shared renderer should retain the existing semantic presentation, including concepts such as:

```text
hero
content cards
callouts
examples
lists
tips
troubleshooting
conclusion
CTA
```

Minor visual normalization is acceptable if required to share the renderer.

Do not substantially redesign all guide pages as part of this task.

---

# 46. Standardize Guide Structured Data

Use the shared guide renderer to provide consistent:

```text
Article schema
BreadcrumbList schema
FAQPage schema when FAQs exist
```

Populate:

```text
headline
description
URL
inLanguage
FAQ questions/answers
```

from localized guide data.

Do not duplicate schema construction in every guide route.

---

# 47. Guide Locale Availability

Introduce guide equivalents of the tool availability concept.

Capabilities should be equivalent to:

```ts
isGuideAvailableInLocale(
  guideId,
  locale
)

getAvailableGuideLocales(
  guideId
)

getLocalizedGuidePath(
  guideId,
  locale
)
```

Only expose real localized guide versions.

Do not generate fictional localized guide URLs.

---

# 48. Guide Language Switching

If the global language switcher is visible on a known guide page, it must behave like the tool switcher:

```text
current localized guide
→ canonical guide ID
→ actual target locale version
```

Only languages with real versions of the same canonical guide should appear.

Do not switch:

```text
/fr/comment-calculer-heures-travail
```

to guessed URLs such as:

```text
/comment-calculer-heures-travail
/es/comment-calculer-heures-travail
/de/comment-calculer-heures-travail
```

unless those pages actually exist.

---

# 49. Guide Alternate Paths / Hreflang

Guide hreflang/alternate URLs should use real guide availability.

If a guide currently exists only in English:

```text
do not invent French/Spanish/German alternates
```

If a future equivalent is added:

```text
same canonical guide ID
+
localized path
```

should automatically allow generation of the alternate relationship.

The same guide registry should ideally power:

```text
guide language switcher
guide alternatePaths
localized guide path resolution
```

---

# 50. Guide → Calculator Links Must Use Canonical Tool IDs

Do not keep hardcoded localized calculator URLs inside guide content where avoidable.

Instead of data containing:

```text
/time-card-calculator-with-lunch
```

prefer:

```ts
relatedTool:
  "time-card-calculator-with-lunch"
```

where the value is the canonical tool identity.

Resolve the actual URL through:

```ts
getLocalizedToolPath(
  locale,
  canonicalTool
)
```

This should be used for:

```text
primary calculator CTA
secondary calculator CTA
related calculator cards
```

Only render the CTA when the tool actually exists in that locale.

---

# 51. Refactor `ToolLandingPage` → Guide Links

The current tool page should not contain language-specific maps such as:

```text
deGuideTitleMap
frGuideTitleMap
```

or assume every guide URL is:

```text
/guides/{english-guide-slug}
```

Replace this with a resolver.

Capability equivalent to:

```ts
resolveLocalizedGuideForTool(
  locale,
  canonicalTool
)
```

Possible result:

```ts
{
  id,
  title,
  path
}
```

or:

```ts
null
```

If there is no localized guide for the current locale:

```text
do not render a broken or misleading guide link
```

---

# 52. Shared Site Configuration

Remove repeated constants such as:

```ts
const SITE_URL =
  "https://time-card-calculator.work";
```

from page-specific components where possible.

Use the project's existing site configuration if available.

If no shared source exists, introduce one small authoritative site config.

Do not create multiple new site-config files.

---

# 53. Suggested Guide Helper APIs

The final architecture should provide capabilities equivalent to:

```ts
resolveGuideBySlug(
  locale,
  localizedSlug
)

getLocalizedGuidePath(
  guideId,
  locale
)

isGuideAvailableInLocale(
  guideId,
  locale
)

getAvailableGuideLocales(
  guideId
)

getGuideAlternatePaths(
  guideId
)

resolveLocalizedGuideForTool(
  locale,
  canonicalToolId
)
```

Again, reuse existing helpers where appropriate.

---

# 54. Language Switcher Architecture

After this refactor, language switching should conceptually behave as follows:

```text
Current pathname
       │
       ├── known calculator page
       │      ↓
       │  canonical tool
       │      ↓
       │  available localized tool paths
       │
       ├── known guide page
       │      ↓
       │  canonical guide
       │      ↓
       │  available localized guide paths
       │
       └── other normal page
              ↓
          existing generic behavior
```

Do not allow the switcher to construct a localized tool/guide URL by blindly replacing the locale prefix.

---

# 55. Static Generation and Sitemap

Ensure the existing static-generation and sitemap systems include:

```text
/time-card-calculator-with-overtime

/es/calculadora-de-horas

/es/calculadora-de-horas-extras

/es/calcular-horas-jornada-partida

/guides/biweekly-time-card-calculator

/guides/time-card-calculator-with-breaks

/guides/time-card-calculator-with-lunch

/fr/comment-calculer-heures-travail
```

Use existing generation mechanisms.

Do not create a second sitemap system.

If guide routing changes internally, public sitemap URLs must remain unchanged.

---

# 56. SEO Regression Requirements

For migrated calculator pages verify:

```text
canonical URL
title
meta description
keywords where currently used
H1
hreflang / alternate paths
breadcrumb schema
SoftwareApplication schema
FAQ schema
currency
OG metadata
internal links
```

For migrated guide pages verify:

```text
canonical URL
title
meta description
keywords where currently used
H1
Article schema
FAQ schema where applicable
BreadcrumbList schema
hreflang / alternate paths
calculator CTA links
```

Do not silently change existing search intent.

---

# 57. Route and Language-Switch Test Matrix

At minimum validate the following.

## English overtime

```text
/time-card-calculator-with-overtime
```

Expected:

```text
200
English content
USD
payment enabled
overtime enabled
weekly basis
40-hour threshold
1.5× first tier
settings open by default
Spanish switch available
```

Spanish switch target:

```text
/es/calculadora-de-horas-extras
```

---

## Spanish overtime

```text
/es/calculadora-de-horas-extras
```

Expected:

```text
200
existing Spanish content preserved
24-hour time
EUR
payment enabled
overtime enabled
weekly basis
40-hour threshold
1.5× first tier
English switch available
```

English target:

```text
/time-card-calculator-with-overtime
```

---

## Existing Spanish calculator

```text
/es/calculadora-de-horas
```

Expected:

```text
200
same URL
shared ToolLandingPage
existing Spanish content preserved
existing calculator behavior preserved
```

---

## Existing Spanish split-shift calculator

```text
/es/calcular-horas-jornada-partida
```

Expected:

```text
200
same URL
shared ToolLandingPage
split-shift behavior preserved
```

---

## German monthly calculator

```text
/de/stundenrechner-monat
```

Expected:

```text
200
```

If Spanish equivalent does not exist:

```text
Spanish must not appear as a switch destination.
```

Never navigate to:

```text
/es/stundenrechner-monat
```

---

## English lunch guide

```text
/guides/time-card-calculator-with-lunch
```

Expected:

```text
200
same URL
existing content preserved
shared GuideLandingPage
valid calculator CTA
correct Article metadata/schema
```

---

## English breaks guide

```text
/guides/time-card-calculator-with-breaks
```

Expected:

```text
200
same URL
existing content preserved
shared GuideLandingPage
```

---

## English biweekly guide

```text
/guides/biweekly-time-card-calculator
```

Expected:

```text
200
same URL
existing content preserved
shared GuideLandingPage
```

---

## French guide

```text
/fr/comment-calculer-heures-travail
```

Expected:

```text
200
same URL
existing French content preserved
shared GuideLandingPage
French calculator CTA paths remain valid
correct French canonical
correct Article / FAQ / breadcrumb structured data
```

---

# 58. Build Validation

Before finishing:

1. run the repository's existing lint command;
2. run the existing typecheck command if available;
3. run the production build;
4. fix all issues introduced by this change.

Do not invent new npm scripts if equivalent scripts already exist.

Also verify that all generated localized paths resolve correctly in the production build.

---

# 59. Regression Checks

Check representative existing calculator pages for:

```text
English
Spanish
German
French
Portuguese-Brazil
```

where applicable.

Verify:

```text
slug resolution
static params
page rendering
calculator defaults
related calculator links
guide links
canonical URLs
alternate URLs
language switching
home links
schema
```

No currently valid localized tool URL should become a 404 because of this refactor.

---

# 60. Important Non-Goals

Do **not**:

- redesign `TimeCardCalculator`;
- rewrite the overtime calculation engine;
- redesign payment logic;
- create separate English/Spanish calculator components;
- create new near-duplicate overtime SEO pages;
- mass-translate existing calculators;
- mass-create guide translations;
- rewrite all existing guide copy;
- change existing Spanish URLs;
- change existing guide URLs;
- introduce `/en/` to default-English URLs;
- refactor privacy/terms/contact merely for architectural symmetry;
- build a general CMS;
- create fictional localized URLs;
- expose languages in the switcher that would lead to 404;
- perform unrelated analytics redesign;
- perform unrelated site-wide UI redesign.

Keep the scope focused on these three workstreams.

---

# 61. Recommended Implementation Order

To minimize regressions, implement in this sequence.

## Phase 1 — Localization infrastructure

Implement or improve:

```text
Locale type
localized tool paths
tool availability
tool alternate paths
localized calculator config resolver
language-switch target resolution
```

Add tests/validation before deleting existing Spanish routes.

---

## Phase 2 — Migrate Spanish calculators

Register:

```text
calculadora-de-horas
calculadora-de-horas-extras
calcular-horas-jornada-partida
```

in the shared localized tool architecture.

Confirm all three render through `ToolLandingPage`.

Preserve SEO and calculator behavior.

Then remove:

```text
SpanishCalculatorPage
dedicated Spanish calculator page implementations
```

---

## Phase 3 — Add English overtime

Add:

```text
/time-card-calculator-with-overtime
```

as the English version of the overtime canonical tool.

Configure English overtime/payment defaults.

Verify English ↔ Spanish switching.

Add appropriate internal links and sitemap/static-generation support.

---

## Phase 4 — Guide architecture

Create:

```text
GuideLandingPage
canonical guide registry
localized guide path/availability helpers
```

Migrate the three English guides without changing URLs.

Migrate the French guide content into the same renderer.

Keep a thin French route adapter if necessary to preserve:

```text
/fr/comment-calculer-heures-travail
```

---

## Phase 5 — Connect guides and tools

Replace hardcoded:

```text
guide → calculator URLs
calculator → guide title/path maps
```

with canonical-ID-based localized resolution.

Remove:

```text
deGuideTitleMap
frGuideTitleMap
English-only guide path assumptions
```

---

## Phase 6 — SEO and switcher validation

Validate:

```text
alternatePaths
hreflang
language switcher
related calculators
related guides
canonical URLs
structured data
currency
breadcrumbs
```

using the actual localized availability registry.

---

## Phase 7 — Build/regression pass

Run:

```text
lint
typecheck
production build
representative route tests
```

Then remove any now-unused components/config/imports.

---

# 62. Definition of Done

The task is complete only when all of the following are true.

## Calculator Architecture

- All three existing Spanish calculator URLs are handled through the shared localized tool architecture.
- `SpanishCalculatorPage` has been removed.
- The old dedicated Spanish calculator implementations have been removed.
- Existing Spanish SEO content is preserved.
- Existing Spanish calculator behavior is preserved.
- `ToolLandingPage` no longer contains growing locale-specific calculator branches.
- Calculator defaults and page-specific overrides are configuration-driven.
- Nested payment/overtime configuration merges safely.
- Locale types are strongly typed where appropriate.

## Tool Availability / Switching

- Tool availability is explicitly modeled.
- Tool language switching resolves through canonical tool identity.
- Tool language switcher only shows real localized versions.
- `/de/stundenrechner-monat` can no longer offer a Spanish destination that 404s.
- Related calculators only link to available localized tools.
- Tool hreflang/alternate paths only include real localized pages.

## English Overtime

- `/time-card-calculator-with-overtime` returns `200`.
- It uses the shared `TimeCardCalculator`.
- Payment is enabled.
- Overtime is enabled.
- USD is the default currency.
- Weekly overtime is the default basis.
- First overtime tier begins after 40 hours.
- First overtime tier uses a 1.5× multiplier.
- Payment/overtime settings are open by default.
- English ↔ Spanish overtime switching works directly.
- The page is included in normal internal linking/static generation/sitemap behavior.

## Guide Architecture

- The three English guides use a shared `GuideLandingPage`.
- The French guide uses the same shared guide renderer.
- Existing guide public URLs are unchanged.
- Existing guide content/search intent is preserved.
- Guide metadata/schema is centralized.
- Guide → calculator links resolve through canonical tool IDs.
- Tool → guide links resolve through localized guide data.
- Hardcoded German/French guide title maps are removed.
- Guide language switching exposes only real localized guide versions.
- Guide alternate/hreflang URLs only include real versions.

## SEO / Technical

- Breadcrumbs are locale-aware.
- Schema currency is locale-aware and uses ISO codes.
- OG alt text is localized.
- Canonicals remain correct.
- No fictional localized URLs are emitted.
- Existing valid localized routes remain valid.
- No new redirect chains are introduced unnecessarily.
- No migrated page becomes an orphan.

## Quality

- Existing lint passes.
- Existing typecheck passes if available.
- Production build passes.
- No unused legacy Spanish/guide rendering code remains.
- No major unrelated refactor has been introduced.

---

# Final Design Rule

After this task, use the following rule for future localized content:

> **A localized calculator is a canonical tool plus a localized slug, localized content, availability, and optional calculator overrides.**

> **A localized guide is a canonical guide plus a localized path, localized content, and availability.**

> **Renderers are shared. URLs and content are localized. Availability is explicit. Language switching never guesses URLs.**

This architecture should allow future locale expansion without adding more page-component forks or creating broken cross-language URLs.