import { describe, expect, it } from 'vitest';
import { validateVisaData } from './validate';
import { KNOWN_COUNTRIES, TODAY, aBaseRow, aCorrection, code } from './test-fixtures';

// validateVisaData only composes checkRow and findDuplicatePairs (no branching of its own),
// so it gets a functional test of the combined behaviour rather than mocked delegates.
describe('validateVisaData', () => {
  it('returns no errors for valid data, including a correction that overrides a base pair', () => {
    expect(validateVisaData([aBaseRow()], [aCorrection()], KNOWN_COUNTRIES, TODAY)).toEqual([]);
  });

  it('collects row problems and duplicates from both files', () => {
    const base = [aBaseRow(), aBaseRow({ origin: { file: 'base', line: 3 } })];
    const corrections = [aCorrection({ destination: code('ZZ') })];

    const errors = validateVisaData(base, corrections, KNOWN_COUNTRIES, TODAY);

    expect(errors.map(({ file, line, field }) => ({ file, line, field }))).toEqual([
      { file: 'base', line: 3, field: undefined },
      { file: 'corrections', line: 2, field: 'destination' },
    ]);
  });

  it('reports duplicates within corrections but not a base/correction overlap', () => {
    const corrections = [aCorrection(), aCorrection({ origin: { file: 'corrections', line: 5 } })];

    const errors = validateVisaData([aBaseRow()], corrections, KNOWN_COUNTRIES, TODAY);

    expect(errors).toEqual([{ file: 'corrections', line: 5, message: expect.any(String) }]);
  });
});
