import { describe, expect, it } from 'vitest';
import { checkRow, findDuplicatePairs } from './row-checks';
import { KNOWN_COUNTRIES, TODAY, aBaseRow, aCorrection, code, date } from './test-fixtures';

describe('checkRow', () => {
  it('passes a valid row', () => {
    expect(checkRow(aBaseRow(), KNOWN_COUNTRIES, TODAY)).toEqual([]);
  });

  it('reports an unknown passport', () => {
    const errors = checkRow(aBaseRow({ passport: code('ZZ') }), KNOWN_COUNTRIES, TODAY);

    expect(errors).toEqual([{ file: 'base', line: 2, field: 'passport', message: expect.any(String) }]);
  });

  it('reports an unknown destination', () => {
    const errors = checkRow(aBaseRow({ destination: code('ZZ') }), KNOWN_COUNTRIES, TODAY);

    expect(errors).toEqual([{ file: 'base', line: 2, field: 'destination', message: expect.any(String) }]);
  });

  it('reports a passport travelling to its own country', () => {
    const errors = checkRow(aBaseRow({ destination: code('GE') }), KNOWN_COUNTRIES, TODAY);

    expect(errors).toEqual([{ file: 'base', line: 2, field: 'destination', message: expect.any(String) }]);
  });

  it.each(['visa_required', 'no_admission'] as const)('reports a maximum stay on a %s row', (requirement) => {
    const errors = checkRow(aBaseRow({ requirement, maxStayDays: 30 }), KNOWN_COUNTRIES, TODAY);

    expect(errors).toEqual([{ file: 'base', line: 2, field: 'max_stay_days', message: expect.any(String) }]);
  });

  it('allows no maximum stay on a visa_required row', () => {
    expect(checkRow(aBaseRow({ requirement: 'visa_required', maxStayDays: null }), KNOWN_COUNTRIES, TODAY)).toEqual([]);
  });

  it('reports a check date in the future', () => {
    const correction = aCorrection({ verification: { verifiedOn: date('2026-10-23'), sourceUrl: 'https://gov.example/' } });

    expect(checkRow(correction, KNOWN_COUNTRIES, TODAY)).toEqual([
      { file: 'corrections', line: 2, field: 'verified_on', message: expect.any(String) },
    ]);
  });

  it('allows a check date of today', () => {
    const correction = aCorrection({ verification: { verifiedOn: TODAY, sourceUrl: 'https://gov.example/' } });

    expect(checkRow(correction, KNOWN_COUNTRIES, TODAY)).toEqual([]);
  });

  it('reports every problem on the same row', () => {
    const errors = checkRow(aBaseRow({ passport: code('ZZ'), requirement: 'no_admission', maxStayDays: 10 }), KNOWN_COUNTRIES, TODAY);

    expect(errors.map((error) => error.field)).toEqual(['passport', 'max_stay_days']);
  });
});

describe('findDuplicatePairs', () => {
  it('finds nothing when every pair is unique', () => {
    expect(findDuplicatePairs([aBaseRow(), aBaseRow({ destination: code('US') })])).toEqual([]);
  });

  it('reports each repeat of a pair, pointing at the first occurrence', () => {
    const rows = [
      aBaseRow({ origin: { file: 'base', line: 2 } }),
      aBaseRow({ origin: { file: 'base', line: 7 } }),
      aBaseRow({ origin: { file: 'base', line: 9 } }),
    ];

    expect(findDuplicatePairs(rows)).toEqual([
      { file: 'base', line: 7, message: expect.stringContaining('line 2') },
      { file: 'base', line: 9, message: expect.stringContaining('line 2') },
    ]);
  });

  it('treats GE→TR and TR→GE as different pairs', () => {
    expect(findDuplicatePairs([aBaseRow(), aBaseRow({ passport: code('TR'), destination: code('GE') })])).toEqual([]);
  });
});
