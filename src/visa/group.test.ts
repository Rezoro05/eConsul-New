import { describe, expect, it } from 'vitest';
import { groupByPassport } from './group';
import type { VisaRule } from './types';
import { BASE_SNAPSHOT, code } from './test-fixtures';

const aRule = (passport: string, destination: string): VisaRule => ({
  passport: code(passport),
  destination: code(destination),
  requirement: 'visa_free',
  maxStayDays: 90,
  provenance: { kind: 'unverified', baseSnapshot: BASE_SNAPSHOT },
});

describe('groupByPassport', () => {
  it('returns no files for no rules', () => {
    expect(groupByPassport([])).toEqual([]);
  });

  it('puts every destination for one passport in one file, keyed by destination', () => {
    expect(groupByPassport([aRule('GE', 'TR'), aRule('GE', 'US')])).toEqual([
      {
        passport: 'GE',
        rules: {
          TR: { requirement: 'visa_free', maxStayDays: 90, provenance: { kind: 'unverified', baseSnapshot: BASE_SNAPSHOT } },
          US: { requirement: 'visa_free', maxStayDays: 90, provenance: { kind: 'unverified', baseSnapshot: BASE_SNAPSHOT } },
        },
      },
    ]);
  });

  it('sorts files by passport and destinations alphabetically, whatever the input order', () => {
    const files = groupByPassport([aRule('TR', 'US'), aRule('GE', 'US'), aRule('GE', 'JP'), aRule('TR', 'GE')]);

    expect(files.map((file) => [file.passport, Object.keys(file.rules)])).toEqual([
      ['GE', ['JP', 'US']],
      ['TR', ['GE', 'US']],
    ]);
  });
});
