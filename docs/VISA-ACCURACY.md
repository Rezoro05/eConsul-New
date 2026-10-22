# Visa answer accuracy — claim definition and audit design

**Status:** proposal for approval (2026-10-22). No code until §1–§4 are agreed.
**Why this exists:** the visa pipeline (D28, D50) is proven to move data faithfully. Nothing yet shows the data is *true*. A wrong "visa-free" can get a traveller turned away at the airport; this document defines what our answer claims, how we measure whether it's right, and what evidence — other than us — decides.

---

## 0. Evidence gathered before designing (pilot, 2026-10-22)

| Finding | Evidence |
|---|---|
| The base dataset and an independent source disagree on the **requirement** for **22 of 193** destinations for Georgian passports (11.4%, 95% CI 7.6–16.7%). | `research/pilot-ge/` — base dataset vs Wikipedia table edited 2026-10-21 |
| **11 of 193** (5.7%, 95% CI 3.2–9.9%) disagree in the **dangerous direction**: the dataset says less is needed. | Chad, Côte d'Ivoire, Djibouti, El Salvador, Ethiopia, Guyana, South Korea, Liberia, Namibia, Seychelles, Vanuatu |
| A further 4 disagree only on maximum stay. | Armenia, Dominican Republic, Kyrgyzstan, Serbia |
| **Neither source is reliable alone.** Namibia: the dataset ("visa on arrival") matches the 23 Sep 2025 change adding Georgia to Namibia's visa-on-arrival list; Wikipedia ("visa required") is out of date. Seychelles: the dataset says "visa-free", but every traveller must obtain a Travel Authorisation before flying. | Namibia: law-firm report citing Namibia's Ministry of Home Affairs (primary page still to be located). Seychelles: Air Seychelles travel information. |
| **The widget would contradict eConsul's own content.** The dataset says South Korea = e-visa for Georgians; eConsul's own South Korea page (published 2026-07-27) describes a consulate C-3 visa with interview. | `migration/raw/pages/en/destination/` |
| The model can't express **passport type**: since 6 Mar 2026 the EU requires visas from holders of Georgian diplomatic/service/official passports (one year), and has warned it may extend this to all Georgian citizens. Ordinary passports remain visa-free. | European Commission press release IP/26/564; Caucasian Knot, 6 Mar 2026 |
| **ETIAS is not operating and has no launch date** (the "last quarter of 2026" line was removed from the official site in July 2026). | SchengenVisaInfo, 19 Oct 2026 (secondary; reports the official page) |
| The model can't express **conditional rules** that matter to eConsul's customers, e.g. visa-free entry for holders of a valid US/UK/Schengen visa or residence (Wikipedia lists Mexico, Costa Rica, El Salvador, Guatemala, Honduras, Kosovo, Turks and Caicos, Anguilla for Georgians). | Wikipedia table (to be verified per country against primary sources) |

**Conclusion from the pilot:** showing unverified dataset answers as definitive is not acceptable. To *prove* the unverified dataset has ≤2% error for one passport would need a clean random sample of ~189 checked pairs (≈280 if one error turns up); the pilot already suggests the rate is higher. The design below therefore verifies what matters and presents everything else cautiously.

---

## 1. The claim — what an answer asserts

An answer on eConsul.io asserts, and the UI states in one line beneath it:

> For an **ordinary passport** of the selected country, travelling for **tourism**, a **short stay**, arriving **directly**, holding **no other visas or residence permits** (unless the traveller says otherwise — §2), this is the **entry permission** required, and the **maximum stay** if one applies.

Explicitly **not** claimed: diplomatic/service/official passports; work, study, transit, business; passport validity rules, return tickets, funds, health requirements; dual nationality (the traveller chooses one passport).

Standing caveats shown where relevant:
- **EU/Schengen destinations:** "ETIAS is announced but not yet operating" (until it is).
- **Systemic watch items** (e.g. EU review of visa-free travel for Georgians) shown as a banner on affected answers when active.

## 2. Data model changes (proposal)

Separating two things the current single `requirement` field conflates:

1. **Permission** — keep the six values (compatible with the dataset).
2. **Pre-travel authorisation flag** — `requiresPreTravelAuthorisation: boolean`. (Seychelles: permission = visa-free, but authorisation required. Today this is lost.)

Adding **conditions**: a rule may carry zero or more alternatives:

```
conditions: [{ ifHolds: 'valid_visa' | 'permanent_residence' | 'residence_permit',
               issuedBy: ['US','GB','CA','SCHENGEN', …],
               multipleEntry?: boolean,
               then: { permission, maxStayDays } , sourceUrl, verifiedOn }]
```

The widget asks one optional question: *"Do you hold a valid visa or residence permit from the US, UK, Canada or a Schengen country?"* Answers show both: "Without: visa required · With a valid US visa: visa-free, 180 days".

Conditions come **only from consultant verification** (no open dataset encodes them). Rule-6 note: conditions multiply the state space, so applying them will be a separate pure component (`applyTravellerConditions(rule, traveller)`), not more branches in `mergeRules`.

## 3. Prioritise by real demand

**Rawest material:** eConsul's case history, aggregated only — counts of (passport, destination, purpose, outcome, refusal reason) by year. No names or documents leave the case system.

**Interim proxy available now:** the 28 destinations eConsul already has pages for (Algeria, US, Aruba, Australia, Bahrain, Bangladesh, UK, Japan, India, Indonesia, Ireland, Canada, Kenya, Morocco, Nepal, Niger, Nigeria, Oman, Philippines, Saint Martin, Saudi Arabia, Singapore, South Africa, South Korea, Sri Lanka, Taiwan, Vietnam, Zambia) plus the EU/Schengen block.

**Priority score** for the checking queue = demand × direction-of-risk, where a disagreement in which some source says *less* is needed than another ranks highest.

## 4. Accuracy audit protocol

**Primary sources (only these resolve a pair):** destination government immigration/foreign-ministry pages; official e-visa/ETA portals; laws, gazettes and regulations (e.g. Regulation (EU) 2018/1806 for Schengen visa lists); published bilateral agreements. **Signals, not proof:** Wikipedia, airlines, the base dataset, news, law-firm notes.

**Tiers (for each launch passport — Georgian first):**
- **Tier A — census:** every eConsul destination + EU/Schengen + every pair in the disagreement queue in the dangerous direction. All verified before launch.
- **Tier B — sample:** a random sample of the remaining pairs, size fixed in advance (proposal: 190), to *estimate* the dataset's error rate. Its result decides how unverified answers are worded, not whether we launch.

**Each check records:** permission, pre-travel authorisation, max stay, conditions, source URL, an archived copy of the source (Wayback snapshot or saved PDF), date, checker.

**Two checkers, blind:** two consultants check each Tier A pair independently. Agreement measured with Cohen's κ on the permission value; **target κ ≥ 0.8**. Disagreements go to a senior reviewer, whose decision and reasoning are recorded.

**Acceptance criteria (set now, before any audit result):**
1. Tier A: 100% of pairs verified by two checkers with a primary source.
2. Tier A: zero unresolved checker disagreements.
3. Tier B: error rate reported with a 95% Wilson interval; if the upper bound on *dangerous-direction* error exceeds 2%, unverified permissive answers are never shown as definitive (§6) — expected outcome per the pilot.

**Effort estimate (to confirm with consultants):** Tier A ≈ 50 pairs × 2 checkers × ~10 min ≈ 17 hours per passport, plus the senior review.

## 5. Keep it true after launch

- **Cross-source comparison, scheduled:** re-run the pilot comparison per launch passport monthly; new disagreements enter the queue.
- **Source monitoring:** for every verified pair, the cited page is fetched on a schedule and compared with the archived copy; a change opens a re-check task. The 183-day staleness rule (D46) stays as a backstop.
- **Systemic watch list:** EU visa-suspension decisions for Georgia; ETIAS start; UK ETA; changes to Regulation (EU) 2018/1806. One event can invalidate many pairs at once, so these drive banners and bulk re-checks.
- **Outcome feedback:** consultants log real outcomes (approved/refused/denied boarding) against the rule shown; any contradiction opens a re-check.

## 6. Design for the expensive error

Strictness order: visa-free < visa on arrival < ETA < e-visa < visa required < no admission. **The costly error is showing a less strict answer than reality.**

| Situation | What the traveller sees |
|---|---|
| Verified, fresh | The answer + "checked ‹date› · source" |
| Verified, stale (>183 days) | The answer + "checked ‹date› — may be outdated"; if the answer is visa-free or on arrival, consultant button made prominent |
| Unverified, independent sources agree | "Likely: ‹answer›" + "not yet verified by eConsul" + consultant button |
| Unverified, sources **disagree** | Show the **stricter** answer, labelled "sources disagree", + consultant button. Never present the more permissive one as the answer. |
| Conditional rule exists | Both answers ("without / with a valid US/UK/Schengen visa") |
| Systemic watch item active | Banner on affected answers |

## 7. What, other than us, shows it is right

| Evidence | Shows |
|---|---|
| A primary-source citation + archived copy for every verified pair | The claim traces to the authority that sets the rule |
| Agreement between two blind checkers (κ ≥ 0.8) | Verification is repeatable, not one person's reading |
| Tier B error rate with confidence interval | How far unverified answers can be trusted — measured, not assumed |
| Falling disagreement count across independent sources | The data is converging over time |
| Real customer outcomes logged by consultants | The rule matched what actually happened at the border/consulate |
| Spot checks against the IATA Travel Centre (manual; terms of use to be checked before any automation) | Agreement with what airlines enforce at boarding |
| Legal review of the claim wording, disclaimer and data rights (Passport Index-derived base data; Wikipedia used only as an internal signal, CC BY-SA 4.0) | The product's claims and data use are defensible |

## 8. Impact on what's built

The existing pipeline stays valid. Additions, each to go through steps 4–7: an independent-source reader + comparison (`disputed` flag and stricter-value selection), the permission/pre-travel-authorisation split, conditions + `applyTravellerConditions`, and a verification record format with archive links. The corrections CSV (D27) grows columns for authorisation flag, archive URL and second checker.

## 9. Needed from REZ

1. **Case history:** where does it live (CRM, spreadsheet, form tool)? Can you export aggregated counts as in §3?
2. **Consultants:** can two consultants give ~17 hours each per launch passport for blind checks, plus a senior reviewer?
3. **Launch passports to audit:** Georgian only first, or also Russian / Armenian / Azerbaijani / Ukrainian?
4. **Approve** the claim (§1), the model changes (§2), the acceptance criteria (§4) and the display rules (§6) — or change them.
5. **Legal reviewer:** who?
6. **Q19:** allow http links for base-dataset sources?

## Sources
- European Commission, IP/26/564 — suspension for Georgian diplomatic/service/official passports: https://ec.europa.eu/commission/presscorner/detail/en/ip_26_564
- Caucasian Knot, 6 Mar 2026: https://www.eng.kavkaz-uzel.eu/articles/73369
- Regulation (EU) 2018/1806 (consolidated): https://eur-lex.europa.eu/eli/reg/2018/1806/2023-05-15/eng
- SchengenVisaInfo, "ETIAS has no launch date", 19 Oct 2026: https://schengenvisainfo.com/news/etias-has-no-launch-date-after-years-of-delays/
- EEAS ETIAS page (Apr 2025, "last quarter of 2026"): https://www.eeas.europa.eu/eeas/coming-visa-free-country-and-travelling-europe_en
- IATA Timatic: https://www.iata.org/en/publications/timatic/ · IATA Travel Centre: https://www.iatatravelcentre.com/
- Wikipedia, Visa requirements for Georgian citizens (edited 2026-10-21): https://en.wikipedia.org/wiki/Visa_requirements_for_Georgian_citizens
- Namibia visa-on-arrival expansion (EIG Law): https://eiglaw.com/namibia-expands-visa-on-arrival-access-to-36-additional-countries
- Air Seychelles travel information: https://www.airseychelles.com/en/travel-information
- Base dataset: https://github.com/maxix7/visa-requirements-dataset
