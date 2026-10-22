import { groupByPassport } from './group';
import { mergeRules } from './merge';
import { parseBaseCsv, parseCorrectionsCsv, parseCountriesCsv } from './readers';
import type { BuildSummary, IsoDate, Result, RowError, VisaRule } from './types';
import { validateVisaData } from './validate';
import { writePassportFiles, type WriteFile } from './write';

export type BuildVisaDataOptions = {
  readFile: (path: string) => Promise<string>;
  writeFile: WriteFile;
  today: IsoDate;
  baseSnapshot: IsoDate;
  paths: { base: string; corrections: string; countries: string; outDir: string };
};

const errorsOf = (...results: Result<unknown>[]): RowError[] => results.flatMap((result) => (result.ok ? [] : result.errors));

const summarise = (rules: VisaRule[], passports: number): BuildSummary => ({
  passports,
  rules: rules.length,
  verified: rules.filter((rule) => rule.provenance.kind === 'verified').length,
  stale: rules.filter((rule) => rule.provenance.kind === 'verified' && rule.provenance.stale).length,
});

export const buildVisaData = async ({ readFile, writeFile, today, baseSnapshot, paths }: BuildVisaDataOptions): Promise<Result<BuildSummary>> => {
  const [baseText, correctionsText, countriesText] = await Promise.all([
    readFile(paths.base),
    readFile(paths.corrections),
    readFile(paths.countries),
  ]);

  const base = parseBaseCsv(baseText);
  const corrections = parseCorrectionsCsv(correctionsText);
  const countries = parseCountriesCsv(countriesText);
  if (!base.ok || !corrections.ok || !countries.ok) return { ok: false, errors: errorsOf(base, corrections, countries) };

  const validationErrors = validateVisaData(base.value, corrections.value, countries.value, today);
  if (validationErrors.length > 0) return { ok: false, errors: validationErrors };

  const rules = mergeRules(base.value, corrections.value, baseSnapshot, today);
  const files = groupByPassport(rules);
  await writePassportFiles(files, paths.outDir, writeFile);

  return { ok: true, value: summarise(rules, files.length) };
};
