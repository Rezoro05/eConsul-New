import { describe, expect, it } from 'vitest';
import { buildVisaData } from './build';
import { BASE_SNAPSHOT, TODAY } from './test-fixtures';

// Functional test: buildVisaData wires the pipeline together, so we run it end to end
// against in-memory files instead of mocking each step.

const PATHS = {
  base: 'data/visa/base.csv',
  corrections: 'data/visa/corrections.csv',
  countries: 'data/visa/countries.csv',
  outDir: 'public/visa',
};

const COUNTRIES = 'code,name_en,issues_passport,is_destination\nGE,Georgia,true,true\nTR,Turkey,true,true\nUS,United States,true,true\n';
const BASE = [
  'passport,destination,requirement,max_stay_days,verified,source',
  'GE,TR,visa_free,90,,',
  'GE,US,visa_required,,,',
  'TR,GE,visa_free,365,2026-07-16,https://www.geoconsul.gov.ge/',
].join('\n');
const CORRECTIONS = [
  'passport,destination,requirement,max_stay_days,verified_on,source_url,verified_by,note',
  'GE,US,visa_required,,2026-03-01,https://travel.state.gov/,consultant-a,',
].join('\n');

const inMemoryFiles = (files: Record<string, string>) => {
  const written = new Map<string, string>();
  return {
    readFile: async (path: string) => {
      const contents = files[path];
      if (contents === undefined) throw new Error(`missing ${path}`);
      return contents;
    },
    writeFile: async (path: string, contents: string) => {
      written.set(path, contents);
    },
    written,
  };
};

const run = (files: Record<string, string>) => {
  const io = inMemoryFiles(files);
  const result = buildVisaData({ ...io, today: TODAY, baseSnapshot: BASE_SNAPSHOT, paths: PATHS });
  return { result, written: io.written };
};

describe('buildVisaData', () => {
  it('builds one file per passport and summarises the result', async () => {
    const { result, written } = run({ [PATHS.base]: BASE, [PATHS.corrections]: CORRECTIONS, [PATHS.countries]: COUNTRIES });

    expect(await result).toEqual({ ok: true, value: { passports: 2, rules: 3, verified: 2, stale: 1 } });
    expect([...written.keys()].sort()).toEqual(['public/visa/ge.json', 'public/visa/tr.json']);
    expect(JSON.parse(written.get('public/visa/ge.json') ?? '{}').rules.US.provenance).toEqual({
      kind: 'verified',
      verifiedOn: '2026-03-01',
      sourceUrl: 'https://travel.state.gov/',
      stale: true,
    });
  });

  it('writes nothing and reports errors from every file when parsing fails', async () => {
    const badBase = BASE.replace('GE,TR,visa_free,90', 'GE,TR,visa_free,abc');
    const badCorrections = CORRECTIONS.replace('https://travel.state.gov/', 'http://travel.state.gov/');

    const { result, written } = run({ [PATHS.base]: badBase, [PATHS.corrections]: badCorrections, [PATHS.countries]: COUNTRIES });

    const outcome = await result;
    expect(outcome.ok).toBe(false);
    expect(outcome.ok ? [] : outcome.errors.map((error) => error.file).sort()).toEqual(['base', 'corrections']);
    expect(written.size).toBe(0);
  });

  it('writes nothing when the data parses but fails validation', async () => {
    const unknownCountry = CORRECTIONS.replace('GE,US', 'GE,ZZ');

    const { result, written } = run({ [PATHS.base]: BASE, [PATHS.corrections]: unknownCountry, [PATHS.countries]: COUNTRIES });

    expect(await result).toEqual({
      ok: false,
      errors: [{ file: 'corrections', line: 2, field: 'destination', message: expect.any(String) }],
    });
    expect(written.size).toBe(0);
  });
});
