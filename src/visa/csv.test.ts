import { describe, expect, it } from 'vitest';
import { readCsv } from './csv';

describe('readCsv', () => {
  it('maps each data row to its header names and 1-based file line number', () => {
    const result = readCsv('passport,destination\nGE,TR\nGE,US\n', 'base');

    expect(result).toEqual({
      ok: true,
      value: {
        header: ['passport', 'destination'],
        rows: [
          { line: 2, values: { passport: 'GE', destination: 'TR' } },
          { line: 3, values: { passport: 'GE', destination: 'US' } },
        ],
      },
    });
  });

  it('handles Windows line endings and a leading byte-order mark', () => {
    const result = readCsv('﻿passport,destination\r\nGE,TR\r\n', 'base');

    expect(result).toEqual({
      ok: true,
      value: { header: ['passport', 'destination'], rows: [{ line: 2, values: { passport: 'GE', destination: 'TR' } }] },
    });
  });

  it('keeps commas inside quoted fields', () => {
    const result = readCsv('passport,note\nGE,"Tbilisi, Batumi"\n', 'corrections');

    expect(result.ok && result.value.rows[0]?.values.note).toBe('Tbilisi, Batumi');
  });

  it('skips blank lines without shifting line numbers', () => {
    const result = readCsv('passport\nGE\n\nTR\n', 'base');

    expect(result.ok && result.value.rows.map((row) => row.line)).toEqual([2, 4]);
  });

  it('reports a row with the wrong number of fields, naming the file and line', () => {
    const result = readCsv('passport,destination\nGE,TR\nGE\n', 'base');

    expect(result).toEqual({ ok: false, errors: [{ file: 'base', line: 3, message: expect.any(String) }] });
  });

  it('reports an empty file', () => {
    expect(readCsv('', 'base')).toEqual({ ok: false, errors: [{ file: 'base', line: 1, message: expect.any(String) }] });
  });
});
