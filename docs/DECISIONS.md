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

## Open questions
- Q1. Testing clarification (pure core = I/O tests; mocks only at edges) — confirmation pending.
- Q2. Any customer records outside the site (form tool, CRM)? (Content migration resolved by D10.)
- Q3. Consultant-side scope in prototype (see step-1 discussion).
- Q5. Hosting (where the site runs) — decided in step 2. Not GitHub Pages if server features are needed.
- Q13. Logo deliverables needed: SVG (or AI), transparent background — full-color, reversed on dark green, all-white, symbol-only; pattern SVG.
- Q6. Visa-rules data source — now needed for Phase 1 (D17): licensed provider vs. open dataset vs. hand-built.
