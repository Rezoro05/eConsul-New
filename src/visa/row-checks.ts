import type { BaseRow, CountryCode, IsoDate, Origin, RowError } from './types';

type CheckableRow = Pick<BaseRow, 'passport' | 'destination' | 'requirement' | 'maxStayDays' | 'origin'> & {
  verification: { verifiedOn: IsoDate } | null;
};

type PairedRow = Pick<BaseRow, 'passport' | 'destination' | 'origin'>;

const REQUIREMENTS_WITHOUT_STAY = new Set(['visa_required', 'no_admission']);

const errorAt = ({ file, line }: Origin, field: string, message: string): RowError => ({ file, line, field, message });

const destinationProblem = (row: CheckableRow, known: ReadonlySet<CountryCode>): string | null => {
  if (!known.has(row.destination)) return `Unknown destination "${row.destination}"`;
  if (row.destination === row.passport) return 'Destination is the passport’s own country';
  return null;
};

export const checkRow = (row: CheckableRow, known: ReadonlySet<CountryCode>, today: IsoDate): RowError[] => {
  const errors: RowError[] = [];
  if (!known.has(row.passport)) errors.push(errorAt(row.origin, 'passport', `Unknown passport "${row.passport}"`));

  const destinationMessage = destinationProblem(row, known);
  if (destinationMessage) errors.push(errorAt(row.origin, 'destination', destinationMessage));

  if (row.maxStayDays !== null && REQUIREMENTS_WITHOUT_STAY.has(row.requirement)) {
    errors.push(errorAt(row.origin, 'max_stay_days', `A maximum stay makes no sense for "${row.requirement}"`));
  }

  if (row.verification && row.verification.verifiedOn > today) {
    errors.push(errorAt(row.origin, 'verified_on', `Check date ${row.verification.verifiedOn} is in the future`));
  }

  return errors;
};

export const findDuplicatePairs = (rows: readonly PairedRow[]): RowError[] => {
  const firstLineByPair = new Map<string, number>();
  const errors: RowError[] = [];

  for (const { passport, destination, origin } of rows) {
    const pair = `${passport}→${destination}`;
    const firstLine = firstLineByPair.get(pair);
    if (firstLine === undefined) firstLineByPair.set(pair, origin.line);
    else errors.push({ file: origin.file, line: origin.line, message: `${pair} already appears on line ${firstLine}` });
  }

  return errors;
};
