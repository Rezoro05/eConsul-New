import type { BaseRow, CountryCode, Correction, IsoDate } from './types';

export const code = (value: string) => value as CountryCode;
export const date = (value: string) => value as IsoDate;

export const GEORGIA = code('GE');
export const TURKEY = code('TR');
export const UNITED_STATES = code('US');
export const JAPAN = code('JP');

export const KNOWN_COUNTRIES: ReadonlySet<CountryCode> = new Set([GEORGIA, TURKEY, UNITED_STATES, JAPAN]);

export const BASE_SNAPSHOT = date('2026-02-17');
export const TODAY = date('2026-10-22');

export const aBaseRow = (overrides: Partial<BaseRow> = {}): BaseRow => ({
  passport: GEORGIA,
  destination: TURKEY,
  requirement: 'visa_free',
  maxStayDays: 90,
  verification: null,
  origin: { file: 'base', line: 2 },
  ...overrides,
});

export const aCorrection = (overrides: Partial<Correction> = {}): Correction => ({
  passport: GEORGIA,
  destination: TURKEY,
  requirement: 'visa_free',
  maxStayDays: 90,
  verification: { verifiedOn: date('2026-10-01'), sourceUrl: 'https://www.mfa.gov.tr/visa-information' },
  verifiedBy: 'consultant-a',
  note: null,
  origin: { file: 'corrections', line: 2 },
  ...overrides,
});
