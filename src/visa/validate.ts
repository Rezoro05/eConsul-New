import { checkRow, findDuplicatePairs } from './row-checks';
import type { BaseRow, CountryCode, Correction, IsoDate, RowError } from './types';

export const validateVisaData = (
  base: readonly BaseRow[],
  corrections: readonly Correction[],
  knownCountries: ReadonlySet<CountryCode>,
  today: IsoDate,
): RowError[] => [
  ...base.flatMap((row) => checkRow(row, knownCountries, today)),
  ...findDuplicatePairs(base),
  ...corrections.flatMap((row) => checkRow(row, knownCountries, today)),
  ...findDuplicatePairs(corrections),
];
