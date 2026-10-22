# Architecture — Phase 1 (public site)

Agreed in step 2 (see DECISIONS.md D25–D32).

## Shape
Static site built by Astro from files in this repo. No server, no CMS, no database in Phase 1.
Every push to `main` → host builds → static files deployed.

## Data flow

```
content/  (Markdown, one file per page per language)  ─┐
i18n/     (UI strings per language)                     ├─► Astro build ─► static HTML (ka at /, en at /en/)
data/countries (country metadata)                       ─┘
                                                              │
data/visa/base.csv        (pinned open dataset, CC BY 4.0)    │
data/visa/corrections.csv (consultant-verified overrides) ─► visa pipeline ─► /visa/<PASSPORT>.json
                                                              │                      │
                                                              │       readiness-check widget fetches one file
redirects (old econsul.io URLs → new) ────────────────────────┴─► host redirect rules
```

## Visa pipeline (build time)
read files (edge) → parse → validate → merge (correction wins; provenance = verified | unverified) → group by passport → write JSON (edge).
Parse/validate/merge/group are pure functions. Invalid data fails the build.

## Boundaries (side effects live only here)
- File reads/writes in the build pipeline
- Widget's fetch of a passport JSON file
- Host redirect/deploy config

## Phase 2 compatibility
Astro server-rendered routes (via host adapter) for login, profile, consultant screens. Personal data hosted in the EU. Fit to be re-evaluated before Phase 2 starts.

## Components (step 3, D34)
Visa data (build): base reader · corrections reader · validator · merger · grouper · file writer (I/O) · pipeline runner (functional test).
Readiness check (browser): loader (I/O) · lookup · result formatter · widget.
Languages: link builder · translator · country names (Intl.DisplayNames, ka coverage to verify) · language switcher.
Content & pages: content schemas · page templates (Home, Countries, Country, Blog list, Blog post, About, Contact, Privacy, Terms) · shared layout.
Migration (one-off): old-site importer · redirect builder.
