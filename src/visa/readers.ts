import { readCsv } from './csv';
import { parseCountryCode, parseHttpsUrl, parseIsoDate, parseMaxStay, parseRequirement, parseWebUrl } from './fields';
import type { BaseRow, CountryCode, Correction, CsvRow, CsvTable, FieldResult, Result, RowError, Verification } from './types';

const BASE_COLUMNS = ['passport', 'destination', 'requirement', 'max_stay_days', 'verified', 'source'];
const CORRECTION_COLUMNS = ['passport', 'destination', 'requirement', 'max_stay_days', 'verified_on', 'source_url', 'verified_by', 'note'];
const COUNTRY_COLUMNS = ['code'];

const parseNonEmpty = (raw: string): FieldResult<string> =>
  raw.trim() !== '' ? { ok: true, value: raw.trim() } : { ok: false, message: 'Must not be empty' };

const missingColumns = (table: CsvTable, required: string[], file: string): RowError[] => {
  const missing = required.filter((column) => !table.header.includes(column));
  return missing.length > 0 ? [{ file, line: 1, message: `Missing column(s): ${missing.join(', ')}` }] : [];
};

const fieldReader = (file: string, row: CsvRow, errors: RowError[]) => <T>(column: string, parser: (raw: string) => FieldResult<T>) => {
  const parsed = parser(row.values[column] ?? '');
  if (!parsed.ok) errors.push({ file, line: row.line, field: column, message: parsed.message });
  return parsed.ok ? parsed.value : undefined;
};

const readTable = <T>(
  text: string,
  file: string,
  requiredColumns: string[],
  readRow: (row: CsvRow, errors: RowError[]) => T | undefined,
): Result<T[]> => {
  const table = readCsv(text, file);
  if (!table.ok) return table;

  const headerErrors = missingColumns(table.value, requiredColumns, file);
  if (headerErrors.length > 0) return { ok: false, errors: headerErrors };

  const errors: RowError[] = [];
  const values = table.value.rows.map((row) => readRow(row, errors));
  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: values as T[] };
};

const readBaseVerification = (row: CsvRow, errors: RowError[], file: string): Verification | null | undefined => {
  const verified = row.values.verified ?? '';
  const source = row.values.source ?? '';
  if (verified === '') return null;
  if (source === '') {
    errors.push({ file, line: row.line, field: 'source', message: 'A check date needs a source link' });
    return undefined;
  }
  const read = fieldReader(file, row, errors);
  const verifiedOn = read('verified', parseIsoDate);
  const sourceUrl = read('source', parseWebUrl);
  return verifiedOn && sourceUrl ? { verifiedOn, sourceUrl } : undefined;
};

export const parseBaseCsv = (text: string): Result<BaseRow[]> =>
  readTable(text, 'base', BASE_COLUMNS, (row, errors): BaseRow | undefined => {
    const read = fieldReader('base', row, errors);
    const passport = read('passport', parseCountryCode);
    const destination = read('destination', parseCountryCode);
    const requirement = read('requirement', parseRequirement);
    const maxStayDays = read('max_stay_days', parseMaxStay);
    const verification = readBaseVerification(row, errors, 'base');
    if (!passport || !destination || !requirement || maxStayDays === undefined || verification === undefined) return undefined;
    return { passport, destination, requirement, maxStayDays, verification, origin: { file: 'base', line: row.line } };
  });

export const parseCorrectionsCsv = (text: string): Result<Correction[]> =>
  readTable(text, 'corrections', CORRECTION_COLUMNS, (row, errors): Correction | undefined => {
    const read = fieldReader('corrections', row, errors);
    const passport = read('passport', parseCountryCode);
    const destination = read('destination', parseCountryCode);
    const requirement = read('requirement', parseRequirement);
    const maxStayDays = read('max_stay_days', parseMaxStay);
    const verifiedOn = read('verified_on', parseIsoDate);
    const sourceUrl = read('source_url', parseHttpsUrl);
    const verifiedBy = read('verified_by', parseNonEmpty);
    const note = (row.values.note ?? '').trim() || null;
    if (!passport || !destination || !requirement || maxStayDays === undefined || !verifiedOn || !sourceUrl || !verifiedBy) {
      return undefined;
    }
    return {
      passport,
      destination,
      requirement,
      maxStayDays,
      verification: { verifiedOn, sourceUrl },
      verifiedBy,
      note,
      origin: { file: 'corrections', line: row.line },
    };
  });

export const parseCountriesCsv = (text: string): Result<ReadonlySet<CountryCode>> => {
  const codes = readTable(text, 'countries', COUNTRY_COLUMNS, (row, errors) => fieldReader('countries', row, errors)('code', parseCountryCode));
  return codes.ok ? { ok: true, value: new Set(codes.value) } : codes;
};
