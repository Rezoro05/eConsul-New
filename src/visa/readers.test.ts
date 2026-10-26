import { describe, expect, it } from 'vitest';
import { parseBaseCsv, parseCorrectionsCsv, parseCountriesCsv } from './readers';

const BASE_HEADER = 'passport,destination,requirement,max_stay_days,verified,source';
const CORRECTIONS_HEADER = 'passport,destination,requirement,max_stay_days,verified_on,source_url,verified_by,note';

describe('parseBaseCsv', () => {
  it('reads an unverified row', () => {
    const result = parseBaseCsv(`${BASE_HEADER}\nGE,TR,visa_free,90,,\n`);

    expect(result).toEqual({
      ok: true,
      value: [
        {
          passport: 'GE',
          destination: 'TR',
          requirement: 'visa_free',
          maxStayDays: 90,
          verification: null,
          origin: { file: 'base', line: 2 },
        },
      ],
    });
  });

  it('reads a row with both a check date and a source as verified', () => {
    const result = parseBaseCsv(`${BASE_HEADER}\nAL,AE,visa_required,,2026-07-16,https://www.gdrfad.gov.ae/en/node/2086\n`);

    expect(result.ok && result.value[0]?.verification).toEqual({
      verifiedOn: '2026-07-16',
      sourceUrl: 'https://www.gdrfad.gov.ae/en/node/2086',
    });
  });

  it('accepts an http source link in the base dataset, which we do not control', () => {
    const result = parseBaseCsv(`${BASE_HEADER}\nRU,BY,visa_free,,2026-07-15,http://en.kremlin.ru/acts/news/80315\n`);

    expect(result.ok && result.value[0]?.verification?.sourceUrl).toBe('http://en.kremlin.ru/acts/news/80315');
  });

  it('treats a row with a source but no check date as unverified', () => {
    const result = parseBaseCsv(`${BASE_HEADER}\nAD,CN,visa_free,30,,https://www.fmprc.gov.cn/eng/\n`);

    expect(result.ok && result.value[0]?.verification).toBeNull();
  });

  it('rejects a row with a check date but no source', () => {
    const result = parseBaseCsv(`${BASE_HEADER}\nGE,TR,visa_free,90,2026-07-16,\n`);

    expect(result).toEqual({ ok: false, errors: [{ file: 'base', line: 2, field: 'source', message: expect.any(String) }] });
  });

  it('reports every invalid field across all rows, not just the first', () => {
    const result = parseBaseCsv(`${BASE_HEADER}\nge,TR,visa_free,90,,\nGE,TR,maybe,abc,,\n`);

    expect(result.ok ? [] : result.errors.map(({ line, field }) => ({ line, field }))).toEqual([
      { line: 2, field: 'passport' },
      { line: 3, field: 'requirement' },
      { line: 3, field: 'max_stay_days' },
    ]);
  });

  it('rejects a file whose header lacks a required column', () => {
    const result = parseBaseCsv('passport,destination,requirement\nGE,TR,visa_free\n');

    expect(result).toEqual({ ok: false, errors: [{ file: 'base', line: 1, message: expect.stringContaining('max_stay_days') }] });
  });

  it('accepts a header-only file as zero rows', () => {
    expect(parseBaseCsv(`${BASE_HEADER}\n`)).toEqual({ ok: true, value: [] });
  });
});

describe('parseCorrectionsCsv', () => {
  it('reads a complete correction', () => {
    const csv = `${CORRECTIONS_HEADER}\nGE,TR,visa_free,90,2026-10-01,https://www.mfa.gov.tr/visa-information,consultant-a,Checked MFA page\n`;

    expect(parseCorrectionsCsv(csv)).toEqual({
      ok: true,
      value: [
        {
          passport: 'GE',
          destination: 'TR',
          requirement: 'visa_free',
          maxStayDays: 90,
          verification: { verifiedOn: '2026-10-01', sourceUrl: 'https://www.mfa.gov.tr/visa-information' },
          verifiedBy: 'consultant-a',
          note: 'Checked MFA page',
          origin: { file: 'corrections', line: 2 },
        },
      ],
    });
  });

  it('treats an empty note as no note', () => {
    const csv = `${CORRECTIONS_HEADER}\nGE,TR,visa_free,90,2026-10-01,https://www.mfa.gov.tr/,consultant-a,\n`;

    const result = parseCorrectionsCsv(csv);

    expect(result.ok && result.value[0]?.note).toBeNull();
  });

  it.each([
    ['verified_on', 'GE,TR,visa_free,90,,https://www.mfa.gov.tr/,consultant-a,'],
    ['source_url', 'GE,TR,visa_free,90,2026-10-01,,consultant-a,'],
    ['source_url', 'GE,TR,visa_free,90,2026-10-01,http://www.mfa.gov.tr/,consultant-a,'],
    ['verified_by', 'GE,TR,visa_free,90,2026-10-01,https://www.mfa.gov.tr/,,'],
  ])('rejects a correction with a missing or invalid %s', (field, row) => {
    const result = parseCorrectionsCsv(`${CORRECTIONS_HEADER}\n${row}\n`);

    expect(result).toEqual({ ok: false, errors: [{ file: 'corrections', line: 2, field, message: expect.any(String) }] });
  });
});

describe('parseCountriesCsv', () => {
  it('returns the set of known country codes', () => {
    const result = parseCountriesCsv('code,name_en,issues_passport,is_destination\nGE,Georgia,true,true\nTR,Turkey,true,true\n');

    expect(result.ok && [...result.value].sort()).toEqual(['GE', 'TR']);
  });

  it('rejects an invalid country code', () => {
    const result = parseCountriesCsv('code,name_en,issues_passport,is_destination\nGEO,Georgia,true,true\n');

    expect(result).toEqual({ ok: false, errors: [{ file: 'countries', line: 2, field: 'code', message: expect.any(String) }] });
  });
});
