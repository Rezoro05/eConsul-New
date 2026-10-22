import { isStale } from './staleness';
import type { BaseRow, Correction, IsoDate, Provenance, Verification, VisaRule } from './types';

const verifiedProvenance = ({ verifiedOn, sourceUrl }: Verification, today: IsoDate): Provenance => ({
  kind: 'verified',
  verifiedOn,
  sourceUrl,
  stale: isStale(verifiedOn, today),
});

const pairKey = (row: { passport: string; destination: string }) => `${row.passport}→${row.destination}`;

const toRule = (
  { passport, destination, requirement, maxStayDays }: BaseRow | Correction,
  provenance: Provenance,
): VisaRule => ({ passport, destination, requirement, maxStayDays, provenance });

export const mergeRules = (
  base: readonly BaseRow[],
  corrections: readonly Correction[],
  baseSnapshot: IsoDate,
  today: IsoDate,
): VisaRule[] => {
  const rulesByPair = new Map<string, VisaRule>();

  for (const row of base) {
    const provenance: Provenance = row.verification
      ? verifiedProvenance(row.verification, today)
      : { kind: 'unverified', baseSnapshot };
    rulesByPair.set(pairKey(row), toRule(row, provenance));
  }

  for (const correction of corrections) {
    rulesByPair.set(pairKey(correction), toRule(correction, verifiedProvenance(correction.verification, today)));
  }

  return [...rulesByPair.values()];
};
