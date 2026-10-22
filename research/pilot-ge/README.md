# Pilot cross-check — Georgian passport (2026-10-22)

Compares the base dataset (maxix7/visa-requirements-dataset, 2026-08-11 release; matrix from Passport Index 2026-02-17) with Wikipedia's "Visa requirements for Georgian citizens" table (page last edited 2026-10-21 07:28 UTC).

- `wiki_ge.json` — the Wikipedia table as extracted (country, requirement, allowed stay). Source: https://en.wikipedia.org/wiki/Visa_requirements_for_Georgian_citizens — text available under CC BY-SA 4.0. Used for internal comparison only; not republished on the site.
- `compare.py` — name→ISO mapping, category mapping, comparison. Expects the base dataset cloned at /tmp/vrd.
- `result.json` — disagreements.

Neither source is ground truth. Disagreements form the verification queue; resolution requires a primary (official) source.
