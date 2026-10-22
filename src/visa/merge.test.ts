import { describe, expect, it } from 'vitest';
import { mergeRules } from './merge';
import { BASE_SNAPSHOT, TODAY, aBaseRow, aCorrection, code, date } from './test-fixtures';

const FRESH_CHECK = { verifiedOn: date('2026-10-01'), sourceUrl: 'https://www.mfa.gov.tr/visa-information' };
const OLD_CHECK = { verifiedOn: date('2026-01-10'), sourceUrl: 'https://www.mfa.gov.tr/visa-information' };

describe('mergeRules', () => {
  it('returns nothing for empty inputs', () => {
    expect(mergeRules([], [], BASE_SNAPSHOT, TODAY)).toEqual([]);
  });

  it('marks a base-only pair as unverified, stamped with the base snapshot date', () => {
    expect(mergeRules([aBaseRow()], [], BASE_SNAPSHOT, TODAY)).toEqual([
      {
        passport: 'GE',
        destination: 'TR',
        requirement: 'visa_free',
        maxStayDays: 90,
        provenance: { kind: 'unverified', baseSnapshot: BASE_SNAPSHOT },
      },
    ]);
  });

  it('keeps a base row that carries its own check as verified', () => {
    const [rule] = mergeRules([aBaseRow({ verification: FRESH_CHECK })], [], BASE_SNAPSHOT, TODAY);

    expect(rule?.provenance).toEqual({ kind: 'verified', ...FRESH_CHECK, stale: false });
  });

  it('lets a correction override the base requirement and stay', () => {
    const base = [aBaseRow({ requirement: 'visa_free', maxStayDays: 90 })];
    const corrections = [aCorrection({ requirement: 'evisa', maxStayDays: 30, verification: FRESH_CHECK })];

    expect(mergeRules(base, corrections, BASE_SNAPSHOT, TODAY)).toEqual([
      {
        passport: 'GE',
        destination: 'TR',
        requirement: 'evisa',
        maxStayDays: 30,
        provenance: { kind: 'verified', ...FRESH_CHECK, stale: false },
      },
    ]);
  });

  it('marks a pair verified even when the correction matches the base exactly', () => {
    const [rule] = mergeRules([aBaseRow()], [aCorrection({ verification: FRESH_CHECK })], BASE_SNAPSHOT, TODAY);

    expect(rule?.provenance.kind).toBe('verified');
  });

  it('adds a pair that exists only in the corrections', () => {
    const rules = mergeRules([], [aCorrection({ destination: code('JP') })], BASE_SNAPSHOT, TODAY);

    expect(rules.map((rule) => [rule.passport, rule.destination, rule.provenance.kind])).toEqual([['GE', 'JP', 'verified']]);
  });

  it('flags a check older than 183 days as stale', () => {
    const [rule] = mergeRules([], [aCorrection({ verification: OLD_CHECK })], BASE_SNAPSHOT, TODAY);

    expect(rule?.provenance).toEqual({ kind: 'verified', ...OLD_CHECK, stale: true });
  });

  it('never exposes who verified a correction', () => {
    const [rule] = mergeRules([], [aCorrection({ verifiedBy: 'consultant-a', note: 'internal' })], BASE_SNAPSHOT, TODAY);

    expect(JSON.stringify(rule)).not.toMatch(/consultant-a|internal/);
  });

  it('keeps pairs untouched by corrections alongside corrected ones', () => {
    const base = [aBaseRow(), aBaseRow({ destination: code('US'), requirement: 'visa_required', maxStayDays: null })];
    const rules = mergeRules(base, [aCorrection()], BASE_SNAPSHOT, TODAY);

    expect(rules.map((rule) => [rule.destination, rule.provenance.kind]).sort()).toEqual([
      ['TR', 'verified'],
      ['US', 'unverified'],
    ]);
  });
});
