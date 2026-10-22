import type { CountryCode, PassportFile, RuleEntry, VisaRule } from './types';

const byCode = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export const groupByPassport = (rules: readonly VisaRule[]): PassportFile[] => {
  const entriesByPassport = new Map<CountryCode, [CountryCode, RuleEntry][]>();

  for (const { passport, destination, ...entry } of rules) {
    const entries = entriesByPassport.get(passport) ?? [];
    entries.push([destination, entry]);
    entriesByPassport.set(passport, entries);
  }

  return [...entriesByPassport.entries()]
    .sort(([a], [b]) => byCode(a, b))
    .map(([passport, entries]) => ({
      passport,
      rules: Object.fromEntries(entries.sort(([a], [b]) => byCode(a, b))),
    }));
};
