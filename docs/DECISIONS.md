# eConsul.io — Decisions Log

Each entry: date · decision · rationale. Open questions live at the bottom until resolved.

## Working agreement (2026-10-22)
- Process per feature, top-down: scope → architecture/data flow → single-responsibility components → public interfaces → state space → tests → code. No code before an agreed plan.
- Pure functional core; side effects only at encapsulated I/O boundaries.
- State-space explosion ⇒ split responsibilities before continuing.
- Pure core: input/output (and property) tests. Effectful shell/orchestrators: delegate-injected unit tests. Functional tests for wiring-heavy, branch-free compositions.
- Intention-revealing names; self-documenting code over comments.
- Claims about external facts (APIs, laws, vendors, pricing) get verified or cited; design opinions are labelled as opinions.
- Decisions recorded here, not only in chat.

## Context (2026-10-22)
- Product owner: REZ (product head). Claude: pair programmer.
- Current site econsul.io: Georgian-language visa consulting (147 countries), country pages, blog, readiness-check widget, external visa-request form, no accounts.
- New platform: helps travellers navigate regulations, travel news and visa procedures; logged-in users get a digital travel profile holding their data in one place.
- Stack: not chosen — to be decided at the architecture step.
- Later requirements (post-prototype): GDPR compliance, payments, auth, calendar.

## Step 1 — Scope decisions (2026-10-22)
- D1. Ground rules govern; "vibecoding" means REZ owns product decisions, Claude carries engineering rigor.
- D2. Business model: platform feeds the consulting service (option B) — self-serve guidance + travel profile, with handoff to eConsul consultants.
- D3. Privacy: data model designed for GDPR-grade privacy from day one; legal paperwork (policies, DPAs, registrations) deferred.
- D4. Regulations/news source: mix of licensed data provider and in-house curation.
- D5. Coverage: any passport × any destination.
- D6. Prototype: full real-user flows, internal use only, code on GitHub; no public launch.

## Phasing (2026-10-22)
- D7. Phase 1: public landing page + content pages. Phase 2: login + internal traveller/consultant platform. Stack must serve both phases.

## Phase 1 scope (2026-10-22)
- D8. Phase 1 site goes live publicly and replaces econsul.io (resolves Q7; D6 "internal only" applies to Phase 2 platform).
- D9. Pages: Home, Countries list, Country page (data-driven template), Blog list, Blog post, About, Contact/visa request, Privacy, Terms. Pricing: maybe, REZ deciding.
- D10. Migrate all existing content (country pages, blog).
- D11. Languages: English first; Russian and Georgian to follow. i18n built in from day one.
- D12. Visa-request form: we build our own; method TBD by REZ — on hold.
- D13. Readiness-check widget: in Phase 1.
- D14. Brand per "eConsul Brand Guidelines.pdf": fonts Nunito (Latin) + FiraGO (Georgian); palette #333132, #2C5629, #588A3D, #8BC53F, #8FD367, #BAED8F, #F3F4E6; logo = green "e"-checkmark symbol + "consul" wordmark.
- D15. Launch languages: Georgian + English together (supersedes D11 order); Russian later.
- D16. At launch the visa-request CTA links to the current external form; replaced when D12 is decided.
- D17. Readiness check = select passport + destination → visa status (visa-free / e-visa / on arrival / required). Requires visa-rules data at Phase 1 launch.
- D18. Logo extracted from brand PDF to brand/logo.svg and brand/logo-symbol.svg (vector). Light-on-dark variant not yet available.
- D19. Icon set: brand/Icons_All.pdf — ~47 icons (passport, visa, consulate, calendar, fingerprint, etc.) × 4 styles (green accent, grey, outline, white-on-dark). Vector; individual SVGs extracted when needed.
- D20. Final logo files supplied by REZ. Extracted SVGs (D18) are placeholders until then.
- D21. Brand guide defines reversed logos: on dark green (light-green symbol, light wordmark) and on mid-green (all white); plus a background pattern and symbol rationale (e-service + approval check + airplane tail). Exact reversed colors to come with REZ's logo files.
- D22. Repository: github.com/Rezoro05/eConsul-New. Brand guide PDF (543 MB) kept out of git — exceeds GitHub's 100 MB file limit.
- D23. GitHub repo is the source of truth; Claude works in the repo, pushes every change, and mirrors files to REZ's local eConsul folder.
- D24. Visa data (resolves Q6): base = Visa Requirements Dataset (maxix7, CC BY 4.0, 197×197 tourist short-stay) + eConsul consultant correction layer citing government sources. UI shows "checked <date> · source" for verified pairs; unverified pairs say "unverified — confirm with a consultant". Pre-launch: legal check or permission from Passport Index (upstream of base data).

## Step 1 summary — Phase 1 scope CLOSED (2026-10-22)
Public site replacing econsul.io, Georgian + English (Russian later), brand per guidelines.
Pages: Home, Countries list, Country page (data-driven), Blog list/post, About, Contact/visa request, Privacy, Terms (+ Pricing maybe).
Features: readiness-check widget (passport + destination → visa status, with verification provenance); visa-request CTA → existing external form at launch.
Content: migrate all existing country pages and blog posts.
Out of Phase 1: login, traveller profile, consultant platform, payments, calendar, own visa-request form.

## Step 2 — Architecture (in progress, 2026-10-22)
- D25. No CMS for now: content (pages, blog, country data, visa corrections) changes via commits to the repo.
- D26. Phase 1 site is statically generated.
- D27. Visa corrections live in data/visa/corrections.csv, editable by consultants via GitHub web UI; validated on every build (bad row ⇒ build fails).
- D28. Visa data pipeline at build time: pinned base dataset + corrections → validate → merge (correction wins, provenance kept) → one JSON per passport; widget fetches only the selected passport's file. No server.
- D29. URLs: Georgian at root, English at /en/, Russian later at /ru/. Page text one file per page per language; UI strings one dictionary per language. Old econsul.io URLs 301-redirect to new ones.
- D30. Stack: Astro + TypeScript, Vitest for tests. Next.js considered; revisit fit for Phase 2 app when we get there.
- D31. Hosting: Cloudflare Pages or Netlify (auto-deploy from GitHub) — final pick pending; Phase 2 needs EU data residency.
- D33. English content (resolves Q14): Claude drafts English translations of all migrated content; a consultant reviews before launch. Launch gated on review.
- D34. Step 3 component list approved (see ARCHITECTURE.md / step-3 discussion).
- D32. Testing (resolves Q1): pure core gets input/output tests; delegate injection/mocks only at I/O edges and orchestrators.
- D35. Launch in Georgian + English + Russian using the existing translations (resolves Q17; supersedes D15 language set; D33 translation drafting no longer needed for migrated content).
- D36. No Sanity access — migrate by downloading each page's Next.js data JSON (migration/fetch-old-site.sh, run from REZ's Terminal; Claude's networks can't reach econsul.io and the built-in browser can't save files). (Resolves Q15.)
- D37. Content stays as files in the repo for now; revisit a CMS (possibly Sanity) later (confirms D25; resolves Q16).
- D38. Images live in the repo and are served with the site; converted/resized to modern formats at build time. Revisit if repo size becomes a problem.

## Step 4 — Visa data interfaces (2026-10-22)
- D39. Corrections may add pairs absent from the base dataset.
- D40. Verified corrections go stale after 6 months: shown as "checked <date> — may be outdated" (still verified provenance, plus a stale flag computed at build time from `today`).
- D41. `verifiedBy` stays internal (repo audit trail); never shipped to the browser.
- D42. A correction identical to the base row still marks the pair verified.
- D43. Images: repo stores web-ready copies only (WebP, max 1920px; existing small WebP/AVIF copied as-is); 298 MB originals stay local and git-ignored (refines D38).
- D44. Visa pipeline signatures as in ARCHITECTURE.md § Interfaces.
- D45. Base rows with both a check date and a source are verified (and go stale like corrections); source-only base rows are unverified. A base row with a date but no source is an error.
- D46. Staleness window = 183 days fixed (supersedes "6 months" in D40). 183 days old = fresh, 184 = stale.
- D47. A max stay on a visa_required / no_admission row is a build error.
- D48. Step 5 splits (rule 6): CSV tokenizing via csv-parse behind readCsv; small field parsers; isStale separate from merge; validator = checkRow + findDuplicatePairs (validateVisaData is pure composition → functional test).
- D49. Interface adjustments found while writing tests: parsed rows carry `origin {file,line}` for error reporting; BaseRow gets `verification | null`; added parseCountriesCsv for the known-country list; mergeRules takes `today` (needed for staleness); buildVisaData takes `baseSnapshot`.
- D50. Step 7 done for the visa pipeline: 98 tests pass, type check clean; six deliberate bugs each caught by the suite.

## Findings — current econsul.io (2026-10-22, via built-in browser)
- F1. Built with Next.js; content almost certainly in Sanity CMS (Sanity document/image-ref/portable-text conventions; per-language documents linked via _translations).
- F2. Sitemap: 298 URLs. Georgian at root, English under /en/, Russian under /ru/ — same URL scheme as D29.
- F3. 28 destination pages per language (not 147). ~70–100 blog posts per language. Plus About, All destinations, Blog index, Privacy, Terms in each language.
- F4. English and Russian versions of content already exist (e.g. /en/destination/kanadis-visa is English). Affects D11/D15/D33.
- F5. Each page exposes localeAlternates (ka/en/ru paths) — usable for the redirect map and translation linking.
- F6. Raw page data for all 298 URLs saved in migration/raw/pages (Next.js pageProps JSON, all valid). 280 unique Sanity image references.
- F7. Real-data run (base dataset 2026-08-11 release, no corrections): with http sources allowed → 197 passport files, 38,612 rules, 38 verified, 0 stale; 4.7 MB total, largest file 24 KB.
- F8. Accuracy pilot (GE passport, base dataset vs Wikipedia): 22/193 requirement disagreements, 11 in the dangerous direction; neither source reliable alone (Namibia vs Seychelles); dataset contradicts eConsul's own South Korea page. Details: docs/VISA-ACCURACY.md §0, research/pilot-ge/.

## Open questions
- Q2. Any customer records outside the site (form tool, CRM)? (Content migration resolved by D10.)
- Q3. Consultant-side scope (Phase 2).
- Q5. Hosting: Cloudflare Pages vs. Netlify (D31).
- Q18. Images: 280 unique images on Sanity CDN (project 6u9g44zq, dataset production); downloaded via migration/fetch-old-images.sh.
- Q13. Logo deliverables needed: SVG (or AI), transparent background — full-color, reversed on dark green, all-white, symbol-only; pattern SVG.
- Q19. One base row (line 7205) cites an http:// source; https-only rule currently fails the whole build. Allow http for base-dataset sources (corrections stay https-only)?
- Q20. Approve docs/VISA-ACCURACY.md: claim (§1), model changes (§2), audit acceptance criteria (§4), display rules (§6); answer inputs in §9 (case history, consultant time, launch passports, legal reviewer).
