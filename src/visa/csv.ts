import { parse } from 'csv-parse/sync';
import type { CsvRow, CsvTable, Result, RowError } from './types';

type ParsedRecord = { record: string[]; info: { lines: number } };

const tokenize = (text: string): ParsedRecord[] =>
  parse(text, { bom: true, skip_empty_lines: true, relax_column_count: true, info: true }) as ParsedRecord[];

export const readCsv = (text: string, file: string): Result<CsvTable> => {
  const [headerRecord, ...dataRecords] = tokenize(text);
  if (!headerRecord) return { ok: false, errors: [{ file, line: 1, message: 'File is empty; expected a header row' }] };

  const header = headerRecord.record;
  const rows: CsvRow[] = [];
  const errors: RowError[] = [];

  for (const { record, info } of dataRecords) {
    if (record.length !== header.length) {
      errors.push({ file, line: info.lines, message: `Expected ${header.length} fields but found ${record.length}` });
      continue;
    }
    rows.push({ line: info.lines, values: Object.fromEntries(header.map((name, index) => [name, record[index] ?? ''])) });
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: { header, rows } };
};
