# Time Card Calculator — Accounts & Saved Time Cards V1

## 1. Overview

Upgrade `time-card-calculator.work` from a fully anonymous calculator into a lightweight account-enabled product that allows users to save, reopen, edit, duplicate, rename, and delete their time cards.

The existing calculator must remain fully usable without authentication.

Authentication is required only for persistent user features such as:

- saving a time card,
- accessing saved time cards,
- updating an existing saved time card,
- duplicating a saved time card,
- renaming a saved time card,
- deleting a saved time card.

The primary user value is:

> Fill out a time card now, save it, and come back later to continue editing it.

Do not expand V1 into a general workforce-management or payroll SaaS product.

---

# 2. Critical Architecture Constraint: Shared Neon Database

The existing Neon PostgreSQL database is a **multi-application database**.

Multiple independent applications use the same physical Neon database.

Therefore, `time-card-calculator.work` MUST use its own dedicated PostgreSQL schema.

The required schema name is:

```text
time_card_calculator
```

This is a hard architectural requirement.

Do not place this application's tables in:

```text
public
```

Do not reuse tables belonging to another application.

Do not share the authentication tables of another application.

Do not modify tables belonging to another application.

---

# 3. Required Database Namespace

All database objects owned by `time-card-calculator.work` must live inside:

```text
time_card_calculator
```

The V1 tables must therefore be:

```text
time_card_calculator.user
time_card_calculator.account
time_card_calculator.session
time_card_calculator.verification

time_card_calculator.time_card
time_card_calculator.time_card_row
```

Conceptually:

```text
One Neon Database
│
├── public
│   └── unrelated/shared database objects
│
├── app_a
│   └── ...
│
├── app_b
│   └── ...
│
├── app_c
│   └── ...
│
└── time_card_calculator
    ├── user
    ├── account
    ├── session
    ├── verification
    ├── time_card
    └── time_card_row
```

Future tables belonging to this product must also remain inside the same schema.

For example:

```text
time_card_calculator.user_preferences
```

Do not create:

```text
public.user
public.account
public.time_card
```

for this application.

---

# 4. Database Isolation Requirements

The implementation MUST NOT:

- modify unrelated schemas,
- modify unrelated tables,
- migrate unrelated applications,
- rename unrelated database objects,
- delete unrelated database objects,
- reuse another application's `user` table,
- reuse another application's Better Auth tables,
- rely on another application's database schema.

All migrations created for this project must target only:

```text
time_card_calculator
```

unless an existing project-specific migration metadata mechanism explicitly requires otherwise.

Database isolation is a release-blocking requirement.

---

# 5. PostgreSQL Schema Creation

The migration must explicitly create the schema if it does not already exist:

```sql
CREATE SCHEMA IF NOT EXISTS "time_card_calculator";
```

All subsequent database objects must be schema-qualified.

For example:

```sql
CREATE TABLE "time_card_calculator"."time_card" (...);
```

Do not rely solely on:

```sql
SET search_path = ...
```

to determine table ownership.

Schema ownership should be explicit in both:

- Drizzle definitions,
- generated/manual migrations.

---

# 6. Drizzle Schema Requirement

If the project uses Drizzle ORM, define the PostgreSQL schema explicitly.

Recommended pattern:

```ts
import { pgSchema } from 'drizzle-orm/pg-core';

export const timeCardCalculatorSchema = pgSchema(
  'time_card_calculator'
);
```

All application tables should be created from this schema object.

Example:

```ts
export const user = timeCardCalculatorSchema.table('user', {
  // fields
});

export const timeCard = timeCardCalculatorSchema.table('time_card', {
  // fields
});
```

Do not define these application tables using plain `pgTable()` if that would place them in `public`.

The implementation should not depend on connection-level `search_path` configuration for correctness.

---

# 7. Better Auth Database Isolation

Use Better Auth for authentication.

V1 authentication provider:

```text
Google OAuth
```

The Better Auth tables must also live inside:

```text
time_card_calculator
```

Required tables:

```text
time_card_calculator.user
time_card_calculator.account
time_card_calculator.session
time_card_calculator.verification
```

Better Auth must be configured to use the schema-backed Drizzle table definitions.

Do not allow Better Auth to create or query:

```text
public.user
public.account
public.session
public.verification
```

Do not rely blindly on generated Better Auth schema or migration output.

Before applying generated authentication migrations:

1. inspect the installed Better Auth version,
2. inspect the actual Better Auth schema requirements,
3. inspect existing Drizzle field mappings,
4. ensure all tables use `time_card_calculator`,
5. ensure generated migrations do not touch unrelated schemas.

The installed Better Auth version is the source of truth for required authentication fields.

Do not invent fields based on examples from another Better Auth version.

---

# 8. Project Goal

The V1 product should support:

- anonymous calculator usage,
- Google sign-in,
- saving the current calculator,
- persistent user-owned time cards,
- reopening saved time cards,
- editing saved time cards,
- duplicating saved time cards,
- renaming saved time cards,
- soft-deleting saved time cards,
- a `My Time Cards` page.

The calculator itself remains the primary product.

Accounts are an optional persistence layer around the existing calculator.

---

# 9. Core Product Principle: Anonymous First

Users must continue to be able to:

- open calculator pages,
- enter work hours,
- configure breaks,
- configure lunch,
- configure multiple in/out punches where supported,
- configure payment,
- configure overtime,
- calculate totals,
- print,
- use existing calculator functionality,

without signing in.

Do not introduce:

- mandatory registration,
- login walls,
- account prompts before calculator interaction,
- forced authentication before calculations.

Authentication should become relevant when the user wants to save persistent data.

---

# 10. Authentication Scope

V1 supports only:

```text
Google OAuth
```

Do not implement in V1:

- email/password,
- magic links,
- passkeys,
- Microsoft login,
- Apple login,
- username/password accounts.

Keep authentication intentionally simple.

---

# 11. Required Technical Stack

This project must use the same validated account/database deployment architecture already proven in production on the reference Cloudflare Workers application.

Required stack:

```text
Next.js
TypeScript
Cloudflare Workers
OpenNext for Cloudflare
Cloudflare Hyperdrive in production
Direct Neon DATABASE_URL in local development only
Neon PostgreSQL
pg Client (request/event scoped; never a cross-request Pool)
Drizzle ORM using drizzle-orm/node-postgres
Better Auth
Google OAuth only for V1
```

This is not a list of interchangeable options. Codex should implement this architecture directly unless an existing repository constraint makes one item technically impossible, in which case it must stop and explain the conflict rather than silently substituting another database driver, auth framework, pooling strategy, or deployment model.

Production database traffic must go through the Cloudflare Hyperdrive binding. Local Next.js development must connect directly to Neon through `DATABASE_URL`.

Do not introduce a second ORM, authentication framework, database driver architecture, or application-level production connection pool.

The production runtime must be treated as a Cloudflare Workers runtime, not as a conventional long-lived Node.js server. Local `next dev` behavior is not sufficient evidence that a server-side API is safe in production.

## 11A. Validated Environment Split

The environment split is fixed:

```text
Local development
Next.js / Node.js
    -> DATABASE_URL
    -> direct Neon PostgreSQL

Production
Cloudflare Workers / OpenNext
    -> HYPERDRIVE binding
    -> env.HYPERDRIVE.connectionString
    -> Cloudflare Hyperdrive pooling
    -> Neon PostgreSQL
```

Do not use Hyperdrive as a requirement for ordinary local `next dev`.

Do not use the raw Neon `DATABASE_URL` as the normal production Worker connection path.

Do not create a production fallback that silently bypasses Hyperdrive when the `HYPERDRIVE` binding is missing. A missing production Hyperdrive binding is a deployment/configuration error and should fail clearly.

## 11B. Version and Dependency Discipline

Reuse the dependency pattern from the already-validated implementation where practical. Do not combine the account-system work with opportunistic upgrades of Better Auth, `pg`, Drizzle, OpenNext, Wrangler, or Next.js.

### Better Auth version is pinned

For this implementation, use the same Better Auth release already validated in the reference Cloudflare Workers + Hyperdrive + Neon deployment:

```text
better-auth = 1.6.29
```

Do not intentionally upgrade or downgrade Better Auth while implementing Accounts V1.

If `time-card-calculator.work` already has a different Better Auth version, align it to `1.6.29` before generating or finalizing the authentication schema, unless an existing repository constraint makes that impossible. If such a constraint exists, stop and explain it instead of silently adapting the schema to another Better Auth release.

Any Better Auth companion/adapter packages used by the repository must remain compatible with the pinned `1.6.29` release and should follow the same dependency combination as the validated reference implementation where available.

Do not use examples, generated schema, or migration output from a different Better Auth release as the source of truth.

Do not run a generator through an unpinned `@latest` command for this work. Schema generation/verification must use repository-pinned tooling compatible with Better Auth `1.6.29`, or the schema must be defined explicitly from the validated `1.6.29` contract below.

---

# 12. Authentication Tables

Better Auth owns these four authentication tables:

```text
time_card_calculator.user
time_card_calculator.account
time_card_calculator.session
time_card_calculator.verification
```

Do not add calculator-specific fields directly to the Better Auth `user` table unless technically required by the authentication library.

Calculator business data belongs in separate business tables.

---

# 13. Business Tables

V1 requires two primary business tables:

```text
time_card_calculator.time_card
time_card_calculator.time_card_row
```

Total V1 core table count:

```text
6
```

They are:

```text
Authentication
--------------
user
account
session
verification

Business
--------
time_card
time_card_row
```

All six live inside:

```text
time_card_calculator
```

---

# 14. Relationship Model

Conceptually:

```text
user
 │
 │ 1:N
 ▼
time_card
 │
 │ 1:N
 ▼
time_card_row
```

A user may have many saved time cards.

A time card may have many rows.

Typical row count:

```text
Weekly:   7 rows
Biweekly: 14 rows
```

Custom calculator variants may have other row counts.

---

# 15. `time_card` Table

Recommended logical schema:

```text
time_card
---------
id
user_id

title
report_header
notes

calculator_type
source_path

period_type
period_start
period_end

payment_enabled
currency
hourly_rate

settings

cached_total_minutes
cached_total_pay

schema_version

created_at
updated_at
deleted_at
```

Physical table:

```text
time_card_calculator.time_card
```

---

# 16. `time_card.id`

Primary key.

Use the project's established ID convention.

UUID is acceptable.

Do not use a globally predictable sequential identifier if the project already has a safer ID strategy.

Authorization must never depend on IDs being difficult to guess.

---

# 17. `time_card.user_id`

Required.

Foreign key to:

```text
time_card_calculator.user.id
```

The server must derive this value from the authenticated session.

Never trust a client-supplied `user_id`.

Every saved time card belongs to exactly one authenticated user.

---

# 18. `time_card.title`

User-facing saved-record name.

Examples:

```text
Aug 24 – Aug 30, 2026
Aug 24 – Sep 6, 2026
John — Week 34
August Payroll Hours
```

This is the name displayed on:

```text
/my-time-cards
```

It is separate from the calculator's report header.

---

# 19. `time_card.report_header`

Maps to the existing calculator input:

```text
Report header (employee name / date range)
```

Store this as a dedicated column.

Recommended type:

```text
text
```

Do not store it only inside JSONB.

Do not use it as the saved-card title.

---

# 20. `time_card.notes`

Maps to the existing calculator input:

```text
Notes or signature details
```

This is a whole-time-card property.

It is NOT a per-day or per-row notes field.

Recommended type:

```text
text
```

Do not add `time_card_row.notes` in V1.

---

# 21. `calculator_type`

Identifies the logical calculator configuration.

Possible examples:

```text
time-card-calculator
time-card-calculator-with-lunch
time-card-calculator-with-overtime
multiple-in-out
military-time
```

Use the project's existing calculator identity abstraction if one already exists.

Do not create arbitrary duplicate concepts if there is already a calculator type or variant system.

---

# 22. `source_path`

Store the public calculator route from which the record originated.

Examples:

```text
/
```

```text
/time-card-calculator-with-overtime
```

```text
/time-card-calculator-with-lunch
```

```text
/es/calculadora-de-horas
```

This allows a saved record to reopen in the correct calculator interface.

Do not assume all cards originate from or should reopen on the homepage.

---

# 23. `period_type`

Suggested values:

```text
weekly
biweekly
custom
```

Reuse existing internal types where possible.

Do not create incompatible parallel representations.

---

# 24. `period_start`

Nullable date.

Store when a real calendar start date is known.

Use PostgreSQL `date`, not a locale-formatted string.

---

# 25. `period_end`

Nullable date.

Store when a real calendar end date is known.

---

# 26. Payment Fields

Persist stable payment metadata directly on `time_card`.

Fields:

```text
payment_enabled
currency
hourly_rate
```

---

# 27. `payment_enabled`

Boolean.

Maps to:

```text
Include payment information
```

---

# 28. `currency`

Use an ISO currency code.

Examples:

```text
USD
EUR
GBP
CAD
AUD
```

Recommended type:

```text
varchar(3)
```

Do not store presentation text such as:

```text
$
USD $
US Dollars
```

---

# 29. `hourly_rate`

Nullable.

Recommended PostgreSQL type:

```text
numeric(12,4)
```

Do not use PostgreSQL floating-point types for persisted monetary values.

---

# 30. `settings`

Use PostgreSQL:

```text
JSONB
```

This stores evolving calculator configuration.

The database schema should not require a migration every time a calculator setting is added.

Example:

```json
{
  "timeFormat": "12h",
  "overtime": {
    "enabled": true,
    "basis": "weekly",
    "tiers": [
      {
        "after": 40,
        "rateType": "multiplier",
        "rate": 1.5
      }
    ]
  }
}
```

Potential settings include:

- 12h/24h time format,
- overtime enabled,
- overtime calculation basis,
- overtime tiers,
- rounding,
- week start,
- calculator-specific options,
- future stable UI settings.

Do not move stable queryable metadata unnecessarily into JSONB.

---

# 31. Overtime Representation

Do not create a dedicated `overtime_tier` table in V1.

Overtime belongs inside:

```text
time_card.settings
```

Example:

```json
{
  "overtime": {
    "enabled": true,
    "basis": "weekly",
    "tiers": [
      {
        "after": 40,
        "rateType": "multiplier",
        "rate": 1.5
      },
      {
        "after": 60,
        "rateType": "multiplier",
        "rate": 2
      }
    ]
  }
}
```

If the existing UI supports hourly-rate overtime:

```json
{
  "after": 40,
  "rateType": "hourlyRate",
  "rate": 52.5
}
```

The persistence model must follow the actual calculator model.

Do not create a second independent overtime engine.

---

# 32. `schema_version`

Required integer.

Initial value:

```text
1
```

Purpose:

Saved calculator state will evolve over time.

Future application versions may need to migrate or normalize older records before loading them.

Example:

```text
schema_version = 1
```

Do not assume today's serialized calculator format will never change.

---

# 33. Cached Summary Fields

Add:

```text
cached_total_minutes
cached_total_pay
```

These exist to make `/my-time-cards` fast.

They are not the authoritative source of calculation results.

---

# 34. `cached_total_minutes`

Integer.

Example:

```text
2400
```

means:

```text
40 hours
```

Use integer minutes rather than floating-point hours.

---

# 35. `cached_total_pay`

Nullable numeric.

Recommended:

```text
numeric(14,4)
```

This can be displayed on `My Time Cards`.

It must be treated as cached data.

---

# 36. Calculation Source of Truth

Do not persist calculated outputs as authoritative business data.

Authoritative inputs are:

```text
time_card configuration
+
time_card rows
+
punches
+
breaks
+
payment configuration
+
overtime rules
```

Derived outputs include:

```text
Daily Total
Total Paid Hours
Total Break Time
Average Daily Paid Time
Weekly Totals
Overtime Summary
Regular Pay
Overtime Pay
Total Pay
```

When opening a saved time card:

1. load saved inputs,
2. deserialize them into the calculator,
3. run the existing calculation engine,
4. display newly calculated totals.

This prevents stale calculated values if the calculation engine is fixed or improved later.

---

# 37. `time_card_row` Table

Recommended logical structure:

```text
time_card_row
-------------
id
time_card_id

position
work_date
day_label

punches
breaks

created_at
updated_at
```

Physical table:

```text
time_card_calculator.time_card_row
```

---

# 38. `time_card_row.id`

Primary key.

Use the project's normal ID convention.

---

# 39. `time_card_row.time_card_id`

Required foreign key to:

```text
time_card_calculator.time_card.id
```

Permanent deletion of the parent in future cleanup processes may cascade to child rows.

Normal user deletion in V1 is soft deletion of the parent.

---

# 40. `position`

Required integer.

Preserves the exact row order.

For a biweekly card:

```text
0
1
2
...
13
```

Do not derive ordering from:

- weekday name,
- work date alone,
- insertion order.

---

# 41. `work_date`

Nullable PostgreSQL date.

Use when a concrete date is associated with the row.

---

# 42. `day_label`

Persist the effective row label when useful.

Examples:

```text
Monday
Week 1 - Monday
Week 2 - Tuesday
```

This helps support:

- weekly calculators,
- biweekly calculators,
- custom layouts,
- localized/calculator-specific labels.

Do not use this field as the source of ordering.

---

# 43. Punch Storage

Use JSONB for punches.

Do not create fixed database columns such as:

```text
start_time
end_time
start_time_2
end_time_2
```

The product supports or may support multiple in/out punches.

Example:

```json
[
  {
    "start": "08:00",
    "end": "12:00"
  },
  {
    "start": "13:00",
    "end": "17:00"
  }
]
```

Simple row:

```json
[
  {
    "start": "08:00",
    "end": "17:00"
  }
]
```

Store normalized internal time values where possible.

---

# 44. Time Storage Format

Recommended internal representation:

```text
HH:mm
```

Examples:

```text
08:00
17:00
```

The UI may render:

```text
8:00AM
5:00PM
```

Do not persist presentation formatting as the canonical value.

---

# 45. Break Storage

Use JSONB.

Do not create fixed columns such as:

```text
break
lunch
break_2
break_3
```

The current UI supports dynamic break columns using:

```text
+ With Break
```

Example:

```json
[
  {
    "label": "Break",
    "minutes": 30
  },
  {
    "label": "Lunch",
    "minutes": 30
  },
  {
    "label": "Break 2",
    "minutes": 15
  }
]
```

Additional break columns must not require a database migration.

---

# 46. Why Use Relational Columns + JSONB

Use relational columns for stable, searchable metadata such as:

```text
user_id
title
period
currency
hourly_rate
created_at
updated_at
```

Use JSONB for calculator state that:

- evolves frequently,
- is primarily loaded as a unit,
- does not need frequent SQL filtering,
- varies between calculator variants.

This avoids both extremes:

### Do not fully normalize every UI concept

Avoid unnecessary tables such as:

```text
time_card_break
time_card_punch
overtime_tier
```

in V1.

### Do not store the entire saved record as one opaque JSON blob

Important list/search metadata should remain queryable without loading the calculator state.

---

# 47. Index Requirements

At minimum, evaluate and add indexes for:

```text
time_card.user_id
time_card.user_id + updated_at
time_card.user_id + deleted_at
time_card_row.time_card_id
time_card_row.time_card_id + position
```

Exact combined indexes may be optimized based on generated SQL and actual query patterns.

Do not add unnecessary JSONB indexes in V1.

---

# 48. Constraints

Add appropriate database constraints.

At minimum:

```text
time_card.user_id NOT NULL
time_card.title NOT NULL
time_card.schema_version NOT NULL

time_card_row.time_card_id NOT NULL
time_card_row.position NOT NULL
```

Foreign keys must reference tables within:

```text
time_card_calculator
```

Do not accidentally create cross-schema foreign keys to another application's user table.

---

# 49. Navigation

## Logged-out state

Show:

```text
Sign in
```

Do not make it visually more prominent than the main calculator experience.

---

# 50. Logged-in Navigation

After authentication, provide access to:

```text
My Time Cards
```

and an account/avatar menu.

Suggested menu:

```text
My Time Cards
Sign out
```

Do not add unnecessary account settings in V1.

---

# 51. Calculator Save Action

Add:

```text
Save Time Card
```

to the calculator interface.

It should coexist with existing controls such as:

```text
Clear All
Print
Copy First Row
With Break
Payment
Settings
```

Do not remove or replace existing calculator functionality.

---

# 52. Anonymous Save Flow

Critical workflow:

```text
Anonymous user
    ↓
fills calculator
    ↓
Save Time Card
    ↓
Continue with Google
    ↓
Google OAuth
    ↓
return to original calculator
    ↓
restore calculator state
    ↓
save
```

The user's calculator state MUST survive authentication.

---

# 53. Pre-Authentication State Preservation

Before redirecting to Google:

1. serialize the current calculator state,
2. preserve the original calculator route,
3. persist the temporary state client-side.

Recommended:

```text
sessionStorage
```

or another appropriately short-lived mechanism.

Avoid persistent `localStorage` unless there is a clear project-specific reason.

The temporary state should include enough information to restore:

- rows,
- punches,
- breaks,
- report header,
- notes,
- weekly/biweekly state,
- payment settings,
- overtime settings,
- calculator-specific settings.

---

# 54. OAuth Return

After successful Google authentication:

1. return to the original calculator route,
2. restore the calculator state,
3. ensure all values are still present,
4. resume the save flow,
5. remove temporary OAuth-save state once it is no longer needed.

A Google OAuth redirect must never cause users to lose the time card they just entered.

This is a release-blocking requirement.

---

# 55. Anonymous Authentication Prompt

Suggested UX:

```text
Save your time card

Sign in with Google to save this time card and continue editing it later.

[Continue with Google]
```

Keep it lightweight.

Do not turn this into a registration wizard.

---

# 56. Authenticated New Save Flow

When a signed-in user saves an unsaved calculator:

Allow the user to provide or confirm:

```text
Title
```

Pre-populate a sensible default where possible.

Examples:

```text
Aug 24 – Aug 30, 2026
Aug 24 – Sep 6, 2026
Weekly Time Card
Biweekly Time Card
```

Suggested actions:

```text
Cancel
Save Time Card
```

After success:

- remain on the calculator,
- keep current inputs,
- associate the current editor state with the newly created `time_card.id`,
- future saves should update the same record.

---

# 57. Existing Saved Card

When editing a saved card, change the primary persistence action to something like:

```text
Save Changes
```

Saving changes must update the existing record.

It must NOT create a new record.

Retain:

```text
id
user_id
created_at
```

Update:

```text
calculator state
updated_at
cached totals
```

---

# 58. My Time Cards Page

Add:

```text
/my-time-cards
```

This page requires authentication.

It is the management interface for historical saved records.

---

# 59. My Time Cards Query

Fetch:

```text
time_card.user_id = current authenticated user
AND
time_card.deleted_at IS NULL
```

Sort:

```text
updated_at DESC
```

Do not load `time_card_row` data for every list item.

The list should rely on `time_card` metadata and cached summaries.

---

# 60. My Time Cards List Content

Each item can display:

```text
Title
Weekly / Biweekly
Period
Total hours
Total pay if payment is enabled
Last updated
```

Example:

```text
Aug 24 – Sep 6, 2026

Biweekly
112.00 hours
$4,480.00
Updated Aug 25

[Open] [...]
```

---

# 61. My Time Cards Actions

Each card should support:

```text
Open
Duplicate
Rename
Delete
```

These can live in an overflow menu where appropriate.

---

# 62. Empty State

If there are no cards:

```text
No saved time cards yet.

Create a time card and save it here so you can come back and edit it later.

[Create a Time Card]
```

CTA should navigate to the primary calculator.

---

# 63. Opening a Saved Time Card

Prefer reopening saved cards inside the existing calculator.

Do not create a second calculator editor.

Possible pattern:

```text
/time-card-calculator?card=<id>
```

However, because multiple calculator routes exist, the implementation should use the stored:

```text
source_path
```

and existing routing architecture.

For example:

```text
/time-card-calculator-with-overtime?card=<id>
```

The exact URL implementation may differ based on the existing app.

Core requirement:

> There must be only one calculation/editing implementation for a given calculator.

---

# 64. Loading a Saved Record

When a saved card ID is requested:

1. resolve authenticated session,
2. fetch the `time_card`,
3. verify ownership,
4. fetch associated rows,
5. sort rows by `position ASC`,
6. deserialize saved data into existing calculator state,
7. run the normal calculation engine,
8. render the calculator.

Do not trust client-side ownership checks.

---

# 65. Duplicate

When a user duplicates a time card:

1. load original record,
2. validate ownership,
3. create a new `time_card`,
4. copy relevant parent fields,
5. create new child rows,
6. generate a new ID,
7. set fresh timestamps,
8. leave original untouched.

Copy:

- report header,
- notes,
- calculator type,
- source path,
- period type,
- period dates,
- payment settings,
- settings,
- punches,
- breaks,
- cached totals.

Suggested title:

```text
Copy of Aug 17 – Aug 23, 2026
```

or:

```text
Aug 17 – Aug 23, 2026 — Copy
```

Do not automatically shift the dates to the next week in V1.

---

# 66. Rename

Users should be able to rename a saved time card from `/my-time-cards`.

Rename only:

```text
title
updated_at
```

Do not modify:

```text
report_header
notes
rows
payment
settings
```

---

# 67. Delete

Use soft deletion.

Set:

```text
deleted_at = now()
updated_at = now()
```

Do not immediately physically delete rows.

Default queries must exclude:

```text
deleted_at IS NOT NULL
```

No restore UI is required in V1.

---

# 68. Save Transaction

Creating a card requires:

```text
1 time_card
+
N time_card_row
```

Use a database transaction.

If row creation fails, do not leave behind a partial parent record.

---

# 69. Update Transaction

Updating a time card should also be transactional.

Recommended flow:

1. authenticate,
2. load parent,
3. validate ownership,
4. update parent,
5. update or replace rows,
6. update cached totals,
7. update timestamp,
8. commit.

Because normal time cards contain only a small number of rows, replacing all child rows on save is acceptable if it significantly simplifies correctness.

Do not prematurely optimize row-level diffs unless the existing architecture already supports them cleanly.

---

# 70. Authorization

Every server-side operation involving a card must verify:

```text
time_card.user_id === authenticatedUser.id
```

This includes:

- list,
- open,
- update,
- rename,
- duplicate,
- delete.

Never trust:

```text
user_id
```

from request bodies, query strings, or client state.

---

# 71. Cross-User Access Protection

A user must never be able to access another user's card by changing:

```text
?id=...
```

or another route parameter.

Unauthorized or non-owned resources should return a non-disclosing response such as:

```text
404
```

where appropriate.

Do not expose whether another user's time card exists.

---

# 72. Required Server Operations

Implement server-side equivalents of:

```text
createTimeCard
listTimeCards
getTimeCard
updateTimeCard
renameTimeCard
duplicateTimeCard
deleteTimeCard
```

Use whichever pattern already fits the project:

- Server Actions,
- Route Handlers,
- existing service layer.

Do not introduce an unrelated API architecture solely for this feature.

---

# 73. `createTimeCard`

Responsibilities:

1. require authentication,
2. validate request,
3. derive user ID from session,
4. normalize calculator state,
5. create parent record,
6. create child rows,
7. calculate/save cached summaries,
8. return new card ID.

---

# 74. `listTimeCards`

Return only the current user's non-deleted cards.

Do not fetch child rows.

Suggested returned fields:

```text
id
title
calculator_type
source_path
period_type
period_start
period_end
payment_enabled
currency
cached_total_minutes
cached_total_pay
created_at
updated_at
```

---

# 75. `getTimeCard`

Fetch:

```text
time_card
+
time_card_row[]
```

Rows must be ordered by:

```text
position ASC
```

Validate ownership before returning data.

---

# 76. `updateTimeCard`

Update current record.

Possible fields:

```text
title
report_header
notes
period
payment settings
calculator settings
rows
cached totals
updated_at
```

Retain:

```text
id
user_id
created_at
```

---

# 77. `renameTimeCard`

Input:

```text
card ID
new title
```

Server validates ownership.

Only update:

```text
title
updated_at
```

---

# 78. `duplicateTimeCard`

Must execute entirely server-side after ownership validation.

Do not accept an arbitrary client-provided source user's data as trusted input.

---

# 79. `deleteTimeCard`

Validate ownership.

Soft-delete only.

---

# 80. Serialization Layer

Create a clear boundary between:

```text
UI calculator state
```

and:

```text
database persistence state
```

Prefer functions similar to:

```ts
serializeCalculatorState(...)
deserializeSavedTimeCard(...)
```

Do not spread Drizzle database structures throughout calculator React components.

---

# 81. Serialization Goals

Serialization should normalize:

- times,
- rows,
- punches,
- breaks,
- calculator settings,
- payment information,
- overtime settings,
- date values.

Deserialization should restore valid calculator state regardless of presentation locale.

---

# 82. Cross-Calculator Compatibility

The saved-data model should support multiple routes and variants, including:

```text
weekly
biweekly
with lunch
with breaks
multiple in/out
overtime
localized routes
future calculator variants
```

Do not build a separate database table for each calculator page.

Use:

```text
calculator_type
source_path
schema_version
settings JSONB
punches JSONB
breaks JSONB
```

to provide flexibility.

---

# 83. Locale Independence

Persist normalized values.

Good:

```text
USD
08:00
30
1.5
```

Avoid canonical persistence values such as:

```text
$35/hr
8:00AM
0:30
1,5x
```

Presentation formatting belongs in the UI.

User-entered free text such as:

```text
report_header
notes
title
```

should naturally remain as entered.

---

# 84. Money Handling

Database money/rate fields should use:

```text
numeric
```

rather than floating-point types.

Do not rely on PostgreSQL `float` for currency.

Use the calculator's existing calculation precision rules.

---

# 85. TypeScript Domain Types

Prefer reusing existing types.

If missing, introduce clear persistence-domain types similar to:

```ts
type TimePunch = {
  start: string;
  end: string;
};

type SavedBreak = {
  label: string;
  minutes: number;
};

type SavedTimeCardRow = {
  id?: string;
  position: number;
  workDate?: string | null;
  dayLabel: string;
  punches: TimePunch[];
  breaks: SavedBreak[];
};

type OvertimeTier = {
  after: number;
  rateType: 'multiplier' | 'hourlyRate';
  rate: number;
};

type TimeCardSettings = {
  timeFormat?: '12h' | '24h';
  overtime?: {
    enabled: boolean;
    basis: 'daily' | 'weekly';
    tiers: OvertimeTier[];
  };
  [key: string]: unknown;
};
```

Do not duplicate existing calculator types unnecessarily.

---

# 86. Recommended Architectural Boundary

Conceptually:

```text
Calculator UI
    │
    ▼
Calculator State
    │
    ├── Calculation Engine
    │
    └── Serialization Layer
             │
             ▼
       Persistence Service
             │
             ▼
           Drizzle
             │
             ▼
   Neon PostgreSQL
             │
             ▼
time_card_calculator schema
```

The calculator calculation engine should remain independent of Neon.

---

# 87. Migration Strategy

Use explicit migrations.

Do not depend solely on production runtime schema synchronization.

Migration must:

1. create `time_card_calculator` if necessary,
2. create Better Auth tables in that schema,
3. create `time_card`,
4. create `time_card_row`,
5. create constraints,
6. create indexes.

---

# 88. Migration Safety

Before applying migrations, inspect the generated SQL.

Confirm that it contains only expected operations against:

```text
time_card_calculator
```

Do not blindly run an auto-generated migration against the shared Neon database if it contains:

```text
DROP
ALTER
CREATE
```

operations for unrelated schemas.

---

# 89. Migration Scope Rule

Migrations for this repository must not assume ownership of the entire Neon database.

This application owns only:

```text
time_card_calculator
```

Do not write migration logic such as:

```text
drop unknown tables
synchronize entire database
rename conflicting public tables
```

---

# 90. Drizzle Migration Metadata

Follow the repository's existing migration layout where possible.

Ensure that Drizzle schema discovery/generation is scoped to this application's table definitions.

Do not include schema definitions imported from unrelated applications in the migration generation process.

If the current repository's Drizzle configuration could unintentionally inspect or manage unrelated schemas, adjust the configuration before generating migrations.

---

# 91. Better Auth Migration Safety

If using Better Auth schema generation:

- do not run generated SQL blindly,
- verify schema qualification,
- verify field names against installed Better Auth,
- verify database field mappings,
- verify indexes/unique constraints,
- ensure tables remain in `time_card_calculator`.

If the generated Better Auth output targets `public`, adapt the schema through the project's Drizzle table definitions/migrations rather than accepting that output unchanged.

For Better Auth `1.6.29`, do not "fix" snake_case database columns by adding Better Auth field overrides such as `expires_at`, `provider_id`, or `account_id`. Keep the Better Auth/Drizzle property names camelCase and map only the physical PostgreSQL column names in the Drizzle definitions. Do not use an unpinned `@latest` generator during this migration work.

---

# 92. Environment Variables and Bindings

Use the following validated environment model.

## Local development

Required local values:

```text
DATABASE_URL=<direct Neon PostgreSQL connection string>
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=<local development secret>
GOOGLE_CLIENT_ID=<Google OAuth client id>
GOOGLE_CLIENT_SECRET=<Google OAuth client secret>
```

Local development connects directly to Neon through `DATABASE_URL`.

The local database client must be closed after the request/operation to avoid leaking direct Neon connections.

## Production Cloudflare Workers

Required production runtime configuration:

```text
HYPERDRIVE=<Cloudflare Hyperdrive binding named HYPERDRIVE>
BETTER_AUTH_URL=https://time-card-calculator.work
BETTER_AUTH_SECRET=<Cloudflare secret>
GOOGLE_CLIENT_ID=<Cloudflare secret or appropriately protected runtime value>
GOOGLE_CLIENT_SECRET=<Cloudflare secret>
```

Production database traffic must use:

```text
env.HYPERDRIVE.connectionString
```

Do not configure application code to use a raw production `DATABASE_URL` as the normal Worker database path.

Do not expose the Hyperdrive connection string to browser/client bundles.

Never hard-code secrets or connection strings.

The `HYPERDRIVE` binding is runtime infrastructure and must be declared in the Cloudflare/Wrangler deployment configuration.

The production Worker should fail clearly if the `HYPERDRIVE` binding is unavailable instead of silently falling back to a direct Neon URL.

## Cloudflare compatibility requirements

The Worker deployment must use the repository's OpenNext configuration and must enable the compatibility required by the validated stack, including `nodejs_compat` when using `pg`/OpenNext in this architecture.

Keep Cloudflare Workers observability enabled for the initial rollout so OAuth callback, session, database, and runtime failures can be diagnosed without reproducing them locally.

---

# 93. Database Connection

The same Neon database connection may be shared with other applications.

That does NOT mean this application may use their tables.

Database isolation is provided by:

```text
time_card_calculator
```

The application code should explicitly address its own schema-backed tables.

---

# 94. Cloudflare Workers Database Connection Lifecycle

This is a **release-blocking production-runtime requirement**.

`time-card-calculator.work` is deployed to a Cloudflare Workers/OpenNext runtime. Treat every HTTP request, OAuth callback, Server Action/Route Handler invocation, and future scheduled/background event as an isolated Worker execution context.

Do **not** model the runtime as a conventional long-lived Node.js server.

The implementation MUST NOT keep live database I/O resources in module/global scope across requests.

Do not create or cache module-level instances such as:

```ts
const pool = new Pool(...);
const db = drizzle(pool, ...);

let database = ...;
let auth = ...;
```

when those objects retain or capture a live database client, socket, transaction, request context, or other request-bound I/O resource.

In particular, do not cache across Worker requests:

- `pg.Pool`,
- `pg.Client`,
- a Drizzle database object backed by a live `pg` connection,
- a Better Auth instance that captures a Drizzle adapter backed by a request-scoped connection,
- transactions,
- request-bound Cloudflare context objects,
- any helper object that indirectly retains one of the above.

A module-level constant is acceptable only when it is immutable configuration or pure data and does not retain live I/O state.

## Required request-scoped pattern

Use one database context per HTTP request or Worker event.

Conceptually:

```text
HTTP request / OAuth callback / Worker event
        ↓
create request-scoped database client/context
        ↓
create Drizzle database for that context
        ↓
create Better Auth from the current database when needed
        ↓
pass db/auth explicitly through the request call chain
        ↓
complete response
        ↓
perform the connection cleanup appropriate to the selected driver
```

Prefer a small boundary such as:

```ts
withDatabase(async (db) => {
  // session/auth/business operations for this request
});
```

or an equivalent repository-native request context.

The exact helper name is not important. The lifecycle is.

## One request, one database context

A route should acquire the database context once and pass it into lower layers.

Prefer:

```ts
return withDatabase(async (db) => {
  const session = await requireSession(db);
  return createTimeCard(db, session.user.id, input);
});
```

over service functions that independently create database clients:

```ts
requireSession();
createTimeCard();
listTimeCards();
```

where each helper silently opens its own connection.

Service/domain functions should accept the current database context explicitly where practical:

```ts
createTimeCard(db, ...);
listTimeCards(db, ...);
getTimeCard(db, ...);
updateTimeCard(db, ...);
renameTimeCard(db, ...);
duplicateTimeCard(db, ...);
deleteTimeCard(db, ...);
```

This keeps transactions, authorization, and connection ownership clear and prevents one request from accidentally opening several unrelated clients.

## Better Auth lifecycle

If Better Auth is configured with a Drizzle adapter backed by the request-scoped database, do not cache that Better Auth instance globally.

Prefer:

```text
request
  → current db
  → createAuth(db)
  → Better Auth handler / session lookup
```

For this project, a global Better Auth singleton is prohibited because Better Auth is configured with a Drizzle adapter backed by the request-scoped database. Always create it from the current database context.

## Hyperdrive + Neon + pg Client: required implementation pattern

Production uses Cloudflare Hyperdrive and local development uses direct `DATABASE_URL`.

Use the same validated connection lifecycle pattern:

- use `pg.Client`, not a module-level or cross-request `pg.Pool`,
- create a new Worker-side client/database context for the current HTTP request or Worker event,
- create Drizzle with `drizzle(client, {schema})`,
- pass the resulting database object explicitly through session/auth/service code,
- let Hyperdrive own production connection pooling,
- never reuse a `pg.Client` from an earlier Worker request,
- close direct local-development clients after the operation,
- keep production Hyperdrive cleanup behavior inside the database boundary rather than scattering `client.end()` calls through routes/services.

The database boundary should conceptually distinguish these two targets:

```ts
type DatabaseTarget = {
  connectionString: string;
  closeClientAfterUse: boolean;
};

// Production Worker
// connectionString = env.HYPERDRIVE.connectionString
// closeClientAfterUse = false

// Local next dev
// connectionString = process.env.DATABASE_URL
// closeClientAfterUse = true
```

A helper equivalent to the following architecture is expected:

```ts
export async function withDatabase<T>(
  operation: (db: Database) => Promise<T>,
  environment?: RuntimeDatabaseEnv,
): Promise<T> {
  const target = resolveDatabaseTarget(environment);
  const client = new Client({connectionString: target.connectionString});
  let connected = false;

  try {
    await client.connect();
    connected = true;
    const db = drizzle(client, {schema});
    return await operation(db);
  } finally {
    if (connected && target.closeClientAfterUse) {
      await client.end();
    }
  }
}
```

The exact filenames/helper names may follow repository conventions, but the lifecycle and environment split above are mandatory.

## Failure mode this requirement prevents

Cross-request reuse of live database I/O can appear to work locally and on the first request, then fail on a later OAuth callback or subsequent request with a Worker runtime hang/cancellation such as Cloudflare `1101`.

Do not treat successful local Google OAuth as sufficient validation. The callback must be tested in a production-like Worker runtime.

---

# 94A. Better Auth and Google OAuth Runtime Pattern

Use the same validated Better Auth integration pattern as the reference implementation.

Better Auth must be created from the current request-scoped Drizzle database:

```text
request
  -> withDatabase(db)
  -> createAuth(db)
  -> drizzleAdapter(db, { provider: 'pg', schema: authSchema })
  -> Better Auth handler/session lookup
```

Do not keep a module-level Better Auth singleton that captures the database adapter.

The Better Auth configuration must include:

```text
baseURL = BETTER_AUTH_URL
Google social provider enabled
email/password disabled for V1
trusted origin: https://time-card-calculator.work
trusted origin: http://localhost:3000
```

Expected Google OAuth callback URLs for the validated Better Auth route layout are:

```text
https://time-card-calculator.work/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

Verify these exact routes against the installed Better Auth route handler before final Google Console configuration. Do not invent a different callback path.

Auth callback/session/private account endpoints must never be statically cached. Use dynamic/no-store behavior where appropriate so authenticated responses are not reused across users.

## Better Auth 1.6.29 schema compatibility requirements

This project must copy the **validated Better Auth 1.6.29 + Drizzle naming pattern exactly**.

### Critical naming rule: camelCase is the Drizzle property name; snake_case is only the PostgreSQL column name

Do **not** add redundant Better Auth field-name overrides that change Better Auth/adapter field names to snake_case.

The correct mapping belongs in the Drizzle table definition itself:

```ts
export const verification = timeCardCalculatorSchema.table('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', {withTimezone: true}).notNull(),
  createdAt: timestamp('created_at', {withTimezone: true}).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', {withTimezone: true}).defaultNow().notNull(),
});
```

In this example:

```text
Drizzle / Better Auth property: expiresAt
PostgreSQL column:             expires_at
```

Better Auth and the Drizzle adapter must continue to address the schema property as `expiresAt`. The database column is snake_case because Drizzle maps the property to `timestamp('expires_at', ...)`.

Do **not** configure Better Auth to look for a Drizzle property named `expires_at`. Doing so can reproduce the runtime/schema error where Better Auth reports that `expires_at` does not exist in the `verification` Drizzle schema.

Apply the same rule consistently:

```text
TypeScript / Drizzle property        PostgreSQL column
------------------------------------------------------
emailVerified                        email_verified
createdAt                            created_at
updatedAt                            updated_at
expiresAt                            expires_at
ipAddress                            ip_address
userAgent                            user_agent
userId                               user_id
accountId                            account_id
providerId                           provider_id
accessToken                          access_token
refreshToken                         refresh_token
idToken                              id_token
accessTokenExpiresAt                 access_token_expires_at
refreshTokenExpiresAt                refresh_token_expires_at
```

These are **Drizzle property-to-database-column mappings**, not Better Auth `fields` overrides.

### Validated Better Auth 1.6.29 auth-table shape

Use the following model shape unless direct inspection of the pinned `1.6.29` package proves an exact repository-specific requirement differs:

```text
user
- id
- name
- email
- emailVerified
- image
- createdAt
- updatedAt

session
- id
- expiresAt
- token
- createdAt
- updatedAt
- ipAddress
- userAgent
- userId

account
- id
- accountId
- providerId
- userId
- accessToken
- refreshToken
- idToken
- accessTokenExpiresAt
- refreshTokenExpiresAt
- scope
- password
- createdAt
- updatedAt

verification
- id
- identifier
- value
- expiresAt
- createdAt
- updatedAt
```

The `account` table must have database-level uniqueness for the OAuth identity pair used by Better Auth `1.6.29`:

```text
(provider_id, account_id)
```

In Drizzle this should be expressed against the camelCase properties, for example:

```ts
uniqueIndex('account_provider_account_uidx').on(
  table.providerId,
  table.accountId,
);
```

Do **not** add an `issuer` column for this implementation. The validated Better Auth `1.6.29` schema identifies the OAuth account with `providerId + accountId`; examples from other Better Auth versions must not be merged into this schema.

### Better Auth adapter configuration must stay simple

The server auth configuration should pass the schema-backed Drizzle tables directly to the adapter:

```ts
database: drizzleAdapter(database, {
  provider: 'pg',
  schema: authSchema,
}),
```

Do not add snake_case field remapping in the Better Auth configuration merely to mirror PostgreSQL column names. Drizzle already owns that mapping.

Before applying migrations, compare the final Drizzle auth schema against the installed/pinned Better Auth `1.6.29` package and the validated reference schema. Any mismatch is release-blocking.

---

# 95. Cloudflare Workers Runtime API Compatibility

This is also a **release-blocking production-runtime requirement**.

Cloudflare Workers are not a full traditional Node.js server environment. `nodejs_compat` and a Next.js `runtime = 'nodejs'` declaration do not guarantee that every Node API is implemented or that a normal local filesystem exists at request time.

Do not use server APIs at Worker request time merely because they work under local `next dev`.

## Runtime filesystem access is prohibited

Do not perform request-time content/config loading with patterns such as:

```ts
import {readFileSync, readdirSync} from 'node:fs';
import {resolve} from 'node:path';

readFileSync(resolve(process.cwd(), 'content/...'));
```

Do not rely on:

- `node:fs` runtime reads/writes,
- `readFileSync`,
- `readdirSync`,
- local files addressed through `process.cwd()` at request time,
- a persistent writable filesystem,
- `child_process`,
- unsupported native Node addons,
- other Node APIs that Cloudflare Workers/OpenNext does not support in the deployed runtime.

Before adding a Node-specific server dependency, verify that the exact API it uses is supported by the current Cloudflare Workers/OpenNext deployment target.

## Bundle static data instead of reading files at runtime

Static content, templates, configuration, and lookup data required by a dynamic page should be bundled at build time.

Prefer:

```ts
import data from './data.json';
import {content} from './content';
```

or a build step that generates TypeScript/JSON consumed by the Worker bundle.

Do not make a dynamic Server Component read source files from the repository filesystem during a production request.

## Static rendering can hide runtime incompatibilities

A Node-only helper can appear safe when used by a statically generated page because it executes during build on a real Node.js machine. The same helper can fail immediately when called by a `force-dynamic` page or authenticated server route because it then executes inside Cloudflare Workers.

Therefore:

> "The homepage works in production" does not prove that the same server helper is Worker-safe.

Audit every code path that can execute at request time, especially:

- Google OAuth callback routes,
- session/auth routes,
- `/my-time-cards`,
- saved-card load/edit routes,
- dynamic Server Components,
- Server Actions,
- Route Handlers,
- any future scheduled/background Worker handler.

## Runtime configuration rule

Do not switch routes arbitrarily between Next.js Edge Runtime and Node Runtime as a workaround. Follow the repository's OpenNext/Cloudflare architecture. Regardless of the Next.js runtime declaration, code that is ultimately executed in Cloudflare Workers must use APIs supported by that deployed runtime.

## Production-like validation is mandatory

Local `next dev` is only one test environment. Before release, also validate the actual Cloudflare/OpenNext build path.

At minimum:

1. run the repository's production Cloudflare/OpenNext build,
2. run Wrangler/OpenNext preview or an equivalent production-like Worker test where available,
3. exercise dynamic pages and API routes,
4. deploy a staging/production Worker with a real `HYPERDRIVE` binding,
5. complete a real Google OAuth round trip through that deployed Worker,
6. verify session restoration on a subsequent request,
7. create, reopen, update, duplicate, rename, and delete a test time card through Hyperdrive,
8. repeat auth/session/database requests to catch cross-request connection reuse bugs,
9. inspect Worker logs for runtime errors, cancellations, and application 500 responses,
10. verify that no request-time filesystem or unsupported Node API is executed.

A local `next dev` pass and a successful build are not sufficient release evidence for this stack. The final acceptance test must exercise Cloudflare Workers + the real Hyperdrive binding + Neon + Better Auth + Google OAuth together.

When debugging, distinguish:

```text
Worker runtime cancellation / 1101
```

from:

```text
HTTP 500 returned by the application while Worker outcome is otherwise OK
```

The former may indicate an I/O lifecycle/runtime issue; the latter may indicate a normal application exception or an unsupported API surfaced through the compatibility layer.

---

# 96. Google OAuth

Configure both:

```text
local development
production
```

Production host:

```text
https://time-card-calculator.work
```

Use the callback route required by the project's installed Better Auth version.

Do not guess the callback route based on outdated documentation.

---

# 97. SEO Requirements

Do not negatively affect existing public calculator pages.

They must remain:

- public,
- anonymous,
- crawlable,
- indexable where currently intended,
- compatible with existing metadata,
- compatible with existing canonicals.

Do not require authentication to render calculator content.

---

# 98. My Time Cards SEO

`/my-time-cards` is private account functionality.

It should not become a search landing page.

Use appropriate metadata such as:

```text
noindex
```

Do not expose saved user content to search engines.

---

# 99. Authentication Pages and SEO

Authentication/callback/account routes should not accidentally become indexable public content pages.

Apply appropriate private/auth route metadata where relevant.

---

# 100. Performance

Anonymous calculator visitors must not incur unnecessary saved-card queries.

Do not load:

```text
all time cards
all time_card_rows
user history
```

just because a session exists.

History should load when needed.

---

# 101. My Time Cards Performance

The history list should query only:

```text
time_card
```

Do not load child rows until a user opens a specific card.

Cached totals exist partly for this purpose.

---

# 102. Error Handling

## Save failure

Display something similar to:

```text
We couldn't save your time card. Please try again.
```

Do not clear user inputs.

---

# 103. Authentication Failure

If Google authentication fails or is cancelled:

- preserve calculator state when possible,
- return to usable calculator state,
- do not erase user-entered data.

---

# 104. Load Failure

If the card is missing or unavailable:

```text
Time card not found.
```

Provide a route back to:

```text
My Time Cards
```

---

# 105. Mutation Failure

For:

```text
Rename
Duplicate
Delete
Save Changes
```

show an appropriate error without corrupting local calculator state.

Avoid irreversible optimistic UI unless rollback is implemented correctly.

---

# 106. Loading States

Provide loading/disabled states for:

```text
Signing in
Saving
Saving changes
Loading time card
Loading My Time Cards
Duplicating
Renaming
Deleting
```

Prevent accidental duplicate requests from repeated button clicks.

---

# 107. Responsive Design

New features must work on:

```text
desktop
tablet
mobile
```

Do not break the existing calculator toolbar.

Account controls may collapse into navigation menus on smaller screens.

---

# 108. Accessibility

New functionality should:

- use semantic buttons and links,
- support keyboard navigation,
- expose accessible names,
- preserve focus management in dialogs,
- show visible focus states,
- not rely only on color.

Example overflow-button accessible label:

```text
More actions for Aug 24 – Sep 6, 2026
```

---

# 109. User Preferences Are Out of Scope

Do not add a user-wide preferences system in V1.

Possible future table:

```text
time_card_calculator.user_preferences
```

Potential future fields:

```text
user_id
default_currency
default_hourly_rate
preferences JSONB
created_at
updated_at
```

Potential future features:

```text
Remember my currency
Remember my hourly rate
Remember my overtime rules
Remember my time format
```

Do not implement unless specifically required later.

---

# 110. Explicitly Out of Scope

Do not implement:

- email/password authentication,
- magic links,
- multiple social providers,
- organizations,
- teams,
- company workspaces,
- employee directories,
- managers,
- approval workflows,
- public shared cards,
- payroll integrations,
- subscription billing,
- premium plans,
- recurring scheduled time cards,
- real-time employee tracking,
- timer/clock-in systems,
- audit-history UI,
- restore-deleted-card UI,
- cross-product identity,
- cross-product shared users,
- user preferences.

---

# 111. Important Cross-Product Rule

Even though the Neon database is shared, users of `time-card-calculator.work` are not automatically users of other applications.

Do not attempt to unify accounts across projects.

The identity boundary for this application is:

```text
time_card_calculator.user
```

No other project's `user` table should participate in authentication for this site.

---

# 112. Testing — Database Isolation

Before considering implementation complete, verify:

- `time_card_calculator` schema exists.
- `user` exists inside `time_card_calculator`.
- `account` exists inside `time_card_calculator`.
- `session` exists inside `time_card_calculator`.
- `verification` exists inside `time_card_calculator`.
- `time_card` exists inside `time_card_calculator`.
- `time_card_row` exists inside `time_card_calculator`.
- no new corresponding tables were created in `public`,
- no unrelated schema was altered,
- no unrelated table was altered,
- Better Auth successfully reads/writes its schema-specific tables,
- Drizzle successfully reads/writes business tables in the same schema.

---

# 113. Testing — Authentication

Verify:

- Google sign-in works.
- Google sign-out works.
- session restoration works.
- anonymous calculator usage still works.
- `/my-time-cards` requires authentication.
- authentication records appear only under `time_card_calculator`.
- the Google callback succeeds in the Cloudflare/OpenNext runtime, not only in local Next.js development.
- repeated sign-in/session requests do not reuse a live database client from an earlier Worker request.
- the OAuth callback does not produce a Worker hang, runtime cancellation, or Cloudflare `1101`.
- session lookup and saved-card operations within one request use the same request-scoped database context where practical.
- no Better Auth singleton retains a request-scoped Drizzle/database connection across Worker requests.

---

# 114. Testing — Anonymous Save

Critical acceptance test:

1. sign out,
2. open calculator,
3. enter non-default data,
4. enter report header,
5. enter notes,
6. configure multiple breaks,
7. configure payment,
8. configure overtime,
9. click `Save Time Card`,
10. sign in with Google,
11. return from OAuth,
12. verify all data is intact,
13. save,
14. confirm the record appears in `My Time Cards`.

---

# 115. Testing — Weekly

Verify weekly cards persist:

- all 7 rows,
- start/end values,
- punches,
- breaks,
- labels,
- payment settings,
- report header,
- notes,
- overtime,
- totals after recalculation.

---

# 116. Testing — Biweekly

Verify biweekly cards persist:

- all 14 rows,
- Week 1 ordering,
- Week 2 ordering,
- dynamic breaks,
- report header,
- notes,
- payment,
- overtime,
- cached summary.

---

# 117. Testing — Breaks

Test:

```text
Break
Lunch
Break 2
additional dynamically-added break
```

Save.

Reload.

Verify:

- all break columns/data are restored,
- values remain correct,
- calculator totals match.

---

# 118. Testing — Multiple Punches

Where supported:

- save multiple in/out pairs,
- reload,
- verify ordering,
- verify calculation result.

---

# 119. Testing — Overtime

Test:

- overtime disabled,
- overtime enabled,
- weekly basis,
- daily basis if currently supported,
- multiplier rate,
- hourly rate,
- one tier,
- multiple tiers.

Reload and verify equivalent configuration.

---

# 120. Testing — Payment

Verify:

- payment disabled,
- payment enabled,
- hourly rate,
- currency,
- cached total pay,
- recalculated pay after reopening.

---

# 121. Testing — Update

Open an existing card.

Modify:

- a time,
- a break,
- notes,
- overtime configuration.

Save Changes.

Verify:

- same card ID,
- no duplicate card created,
- correct rows,
- updated cached totals,
- new `updated_at`.

---

# 122. Testing — Duplicate

Duplicate a card.

Verify:

- new card ID,
- same owner,
- copied rows,
- copied settings,
- copied payment configuration,
- copied notes,
- original unchanged,
- new timestamps.

---

# 123. Testing — Rename

Rename from `My Time Cards`.

Verify:

- title changes,
- report header does not change,
- calculator contents do not change.

---

# 124. Testing — Delete

Delete a card.

Verify:

- `deleted_at` is populated,
- card disappears from normal history,
- child rows remain,
- original database record is not physically removed.

---

# 125. Testing — Authorization

Use at least two test users.

Verify User A cannot:

- load User B's card,
- update User B's card,
- rename User B's card,
- duplicate User B's card,
- delete User B's card.

Do not rely on UI hiding to enforce this.

Verify at the server/data layer.

---

# 126. Testing — Migration Safety

Before production deployment:

1. inspect migration SQL,
2. verify schema creation,
3. verify all table names are qualified,
4. search migration files for unintended `public` references,
5. search migration files for unrelated schemas,
6. confirm no unrelated DROP/ALTER operations exist,
7. apply migration in a safe environment where possible,
8. inspect resulting database objects.

---

# 127. Acceptance Criteria

Implementation is complete only when all of the following are true.

### Product

1. Existing calculator remains fully usable anonymously.

2. Google authentication works.

3. Users can save a calculator.

4. Users can view saved cards at `/my-time-cards`.

5. Users can reopen saved cards.

6. Users can update saved cards.

7. Users can duplicate saved cards.

8. Users can rename saved cards.

9. Users can soft-delete saved cards.

---

### Persistence

10. Weekly rows persist correctly.

11. Biweekly rows persist correctly.

12. Dynamic breaks persist correctly.

13. Multiple punches persist correctly where supported.

14. Report header persists.

15. Notes persist.

16. Payment settings persist.

17. Overtime settings persist.

18. Multiple overtime tiers persist.

19. Stored cards can be deserialized into the existing calculator.

20. Existing calculator engine recalculates totals after load.

---

### Authentication Flow

21. Anonymous users do not lose calculator data during Google OAuth.

22. Successful OAuth returns users to the relevant calculator.

23. Save can continue after authentication.

---

### Authorization

24. Every card belongs to exactly one authenticated user.

25. Users cannot access other users' cards.

26. Client-supplied `user_id` is never trusted.

---

### Database Isolation

27. PostgreSQL schema `time_card_calculator` exists.

28. All Better Auth tables exist inside `time_card_calculator`.

29. All time-card business tables exist inside `time_card_calculator`.

30. No application authentication tables were accidentally created in `public`.

31. No application business tables were accidentally created in `public`.

32. No unrelated application tables were changed.

33. No unrelated schema was changed.

34. Better Auth uses schema-specific tables successfully.

35. Drizzle migrations are scoped to this application's database objects.

---

### SEO and Performance

36. Public calculator pages remain indexable and anonymous.

37. `/my-time-cards` is not indexed.

38. Private user data is never rendered into public SEO pages.

39. Anonymous visitors do not incur unnecessary history/database loading.

40. `/my-time-cards` does not load all row data for the list.

---

### Cloudflare Workers Runtime Safety

41. No module/global `pg.Pool`, `pg.Client`, or equivalent live database connection is reused across Worker requests.

42. No module/global Drizzle database object retains a live request-scoped connection across Worker requests.

43. Better Auth does not use a global singleton that captures a request-scoped Drizzle/database connection.

44. Each HTTP request or Worker event owns a clear database lifecycle, and lower service layers receive the current database context instead of silently creating/caching their own global connection.

45. If Hyperdrive is used, Hyperdrive owns production connection pooling and the application does not add a cross-request `pg.Pool` on top of it.

46. Google OAuth callback and session restoration succeed in a production-like Cloudflare Worker runtime without `1101`, deadlock, or runtime cancellation.

47. Dynamic Server Components, API routes, and auth routes do not execute unsupported Node APIs at Worker request time.

48. No request-time `node:fs` / `readFileSync` / repository-filesystem dependency exists in the deployed Worker path.

49. Static content/configuration required by dynamic routes is bundled or generated at build time.

50. A production Cloudflare/OpenNext build and production-like runtime test pass in addition to local `next dev` testing.

---

### Validated Stack Conformance

51. Production database access uses the Cloudflare binding named `HYPERDRIVE` and `env.HYPERDRIVE.connectionString`.

52. Production does not silently fall back to a raw Neon `DATABASE_URL` if Hyperdrive is missing.

53. Local `next dev` uses direct `DATABASE_URL` without requiring Hyperdrive.

54. Database access uses request/event-scoped `pg.Client` + `drizzle-orm/node-postgres`; no application-level cross-request `pg.Pool` is introduced.

55. Direct local Neon clients are closed after use; Hyperdrive-specific cleanup behavior remains encapsulated in the database boundary.

56. Better Auth is instantiated from the current request database context and uses `drizzleAdapter(db, {provider: 'pg', schema: authSchema})` or an equivalent validated configuration.

57. `BETTER_AUTH_URL` is `https://time-card-calculator.work` in production and the Google callback uses the verified Better Auth callback route.

58. Better Auth `trustedOrigins` includes the production origin and the local development origin.

59. Better Auth is pinned to `1.6.29`; the Drizzle schema uses camelCase properties mapped to snake_case PostgreSQL column names (for example `verification.expiresAt` -> `expires_at`) without redundant Better Auth snake_case field overrides, and the `account` table enforces `(provider_id, account_id)` uniqueness.

60. A real deployed Cloudflare Worker test verifies Hyperdrive + Neon + Better Auth + Google OAuth together, including repeated callback/session requests and saved-time-card CRUD.

---

# 128. Recommended Implementation Order

## Phase 1 — Inspect Existing Architecture

Before changing code:

1. inspect current calculator state structures,
2. inspect existing calculator variants,
3. inspect overtime model,
4. inspect payment model,
5. inspect break model,
6. inspect multiple-punch model,
7. inspect current Drizzle setup if present,
8. inspect migration configuration,
9. verify that Better Auth is pinned to `1.6.29` and inspect that exact installed package before finalizing auth schema/migrations,
10. identify all relevant calculator routes,
11. inspect the current Cloudflare Workers/OpenNext deployment path and bindings,
12. search for module/global database clients, pools, Drizzle instances, and Better Auth singletons,
13. identify every dynamic Server Component, Route Handler, Server Action, and OAuth callback that can execute in Workers,
14. search request-time server code for `node:fs`, `readFileSync`, `readdirSync`, `process.cwd()` filesystem loading, `child_process`, native addons, or other Node-only assumptions.

Do not implement a parallel state model without first understanding existing types.

Do not assume code is production-safe merely because it works in `next dev`.

---

## Phase 2 — Database Namespace

1. define `time_card_calculator` PostgreSQL schema,
2. configure Drizzle schema object,
3. verify migration generation scope,
4. ensure no unrelated database objects are managed.

---

## Phase 3 — Authentication

1. define Better Auth schema-backed tables,
2. configure Google OAuth,
3. implement request-scoped database/auth lifecycle for Worker requests,
4. configure session handling against the current request database context,
5. ensure Better Auth is not globally cached with a live request-scoped Drizzle/database connection,
6. generate/review migration,
7. verify all Auth tables live under `time_card_calculator`,
8. test sign-in/sign-out locally,
9. test the full Google OAuth callback in a production-like Cloudflare/OpenNext runtime.

---

## Phase 4 — Business Schema

Create:

```text
time_card_calculator.time_card
time_card_calculator.time_card_row
```

Add:

- constraints,
- foreign keys,
- indexes,
- schema version,
- cached summary fields.

Review generated SQL before applying it.

---

## Phase 5 — Serialization

Implement a clean adapter between:

```text
existing calculator state
```

and:

```text
saved time-card data
```

Test serialization/deserialization independently before UI integration.

---

## Phase 6 — Persistence Operations

Implement:

```text
create
list
get
update
rename
duplicate
delete
```

Add server-side ownership validation.

---

## Phase 7 — Calculator Integration

1. add `Save Time Card`,
2. support authenticated save,
3. support anonymous save + OAuth preservation,
4. support loading saved cards,
5. support `Save Changes`.

---

## Phase 8 — My Time Cards

Implement:

```text
/my-time-cards
```

Add:

- list,
- empty state,
- Open,
- Rename,
- Duplicate,
- Delete.

---

## Phase 9 — Hardening

Test:

- weekly,
- biweekly,
- breaks,
- multiple punches,
- overtime,
- payment,
- report header,
- notes,
- OAuth state preservation,
- authorization,
- responsive layout,
- SEO,
- database schema isolation,
- repeated Worker requests do not reuse global live DB connections,
- OAuth callback succeeds after the initial sign-in request,
- dynamic pages execute successfully in the Cloudflare/OpenNext runtime,
- no request-time `node:fs` or unsupported Node API is used,
- production Cloudflare/OpenNext build succeeds,
- Wrangler/OpenNext production-like preview or equivalent runtime validation succeeds.

---

# 129. Final Architecture

The expected final architecture is:

```text
time-card-calculator.work
│
├── Public Calculator Routes
│   ├── anonymous usage
│   ├── calculation engine
│   └── Save Time Card
│
├── Authentication
│   └── Google OAuth
│
├── My Time Cards
│   ├── Open
│   ├── Rename
│   ├── Duplicate
│   └── Delete
│
└── Cloudflare Workers / OpenNext Runtime
    │
    ├── Request/Event-Scoped Runtime Context
    │   ├── one database lifecycle per request/event
    │   ├── request-scoped Drizzle database
    │   ├── request-scoped Better Auth when DB-backed
    │   └── NO global live DB client/pool reuse
    │
    ├── Persistence Layer
    │   ├── serialization
    │   ├── authorization
    │   └── transactions
    │
    ├── Worker-Safe Server Code
    │   ├── no request-time filesystem reads
    │   ├── no unsupported Node APIs
    │   └── static content/config bundled at build time
    │
    ├── Drizzle ORM
    │
    ├── Cloudflare Hyperdrive (required in production)
    │   └── production connection pooling
    │
    └── Shared Neon PostgreSQL Database
        │
        ├── other application schemas
        │   └── MUST NOT TOUCH
        │
        └── time_card_calculator
            ├── user
            ├── account
            ├── session
            ├── verification
            ├── time_card
            └── time_card_row
```

---

# 130. Final Implementation Guidance

Keep V1 deliberately focused.

The target product is:

```text
Anonymous calculator
+
Google login
+
Save
+
My Time Cards
+
Open
+
Update
+
Duplicate
+
Rename
+
Delete
```

Do not turn the feature into a generalized employee-management system.

Reuse the existing calculator as:

- the editing interface,
- the state model where practical,
- the source of calculation logic.

Use PostgreSQL relational fields for stable metadata.

Use JSONB for evolving calculator configuration.

Use the dedicated PostgreSQL schema:

```text
time_card_calculator
```

for every database object owned by this application.

The shared Neon database must be treated as a multi-tenant development environment at the application level:

> `time-card-calculator.work` owns its schema, not the entire database.

No implementation decision, migration generator, authentication generator, or ORM configuration may override that isolation boundary.

The Cloudflare Worker must also be treated as a request-isolated runtime:

> `time-card-calculator.work` owns a database connection context for the current request/event, not a permanent cross-request Node.js database process.

Do not ship a global live database pool/client, a global DB-bound Better Auth singleton, or request-time server code that depends on unsupported Node filesystem/runtime APIs.

Do not ship a Better Auth version other than `1.6.29` for Accounts V1 without an explicit architecture review, and do not add Better Auth snake_case field overrides on top of the validated camelCase Drizzle schema-property pattern.

A feature is not production-ready until it has passed both local tests and a production-like Cloudflare/OpenNext runtime test.
---

# 131. Validated Stack Precedence Rule

If any earlier wording in this document can be interpreted as making Hyperdrive, `pg`, the request-scoped database lifecycle, or the Cloudflare Workers deployment model optional, this section and Sections 11/11A/92/94/94A take precedence.

The required implementation target is:

```text
Production:
Cloudflare Workers / OpenNext
  -> request-scoped pg.Client
  -> Drizzle node-postgres adapter
  -> Cloudflare Hyperdrive
  -> Neon PostgreSQL
  -> time_card_calculator schema

Authentication:
Google OAuth
  -> Better Auth
  -> request-scoped createAuth(db)
  -> same Drizzle database context

Local development:
Next.js / Node.js
  -> request-scoped pg.Client
  -> direct DATABASE_URL
  -> Neon PostgreSQL
```

This architecture has already been validated in a comparable production Cloudflare Workers application and should be replicated rather than redesigned during this V1 implementation.

