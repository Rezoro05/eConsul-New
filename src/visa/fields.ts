import { REQUIREMENTS, type CountryCode, type FieldResult, type IsoDate, type Requirement } from './types';

const ok = <T>(value: T): FieldResult<T> => ({ ok: true, value });
const fail = (message: string): FieldResult<never> => ({ ok: false, message });

const ISO_ALPHA_2 = /^[A-Z]{2}$/;
const POSITIVE_WHOLE_NUMBER = /^[1-9]\d*$/;
const ISO_DATE_SHAPE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseCountryCode = (raw: string): FieldResult<CountryCode> =>
  ISO_ALPHA_2.test(raw) ? ok(raw as CountryCode) : fail(`"${raw}" is not an uppercase two-letter country code`);

export const parseRequirement = (raw: string): FieldResult<Requirement> =>
  (REQUIREMENTS as readonly string[]).includes(raw)
    ? ok(raw as Requirement)
    : fail(`"${raw}" is not one of ${REQUIREMENTS.join(', ')}`);

export const parseMaxStay = (raw: string): FieldResult<number | null> => {
  if (raw === '') return ok(null);
  return POSITIVE_WHOLE_NUMBER.test(raw) ? ok(Number(raw)) : fail(`"${raw}" is not a positive whole number of days`);
};

const isRealCalendarDate = (year: number, month: number, day: number): boolean => {
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day;
};

export const parseIsoDate = (raw: string): FieldResult<IsoDate> => {
  const match = ISO_DATE_SHAPE.exec(raw);
  if (!match) return fail(`"${raw}" is not a date in YYYY-MM-DD form`);
  const [, year, month, day] = match.map(Number) as [number, number, number, number];
  return isRealCalendarDate(year, month, day) ? ok(raw as IsoDate) : fail(`"${raw}" is not a real calendar date`);
};

const parseUrlWithProtocols = (raw: string, protocols: readonly string[], description: string): FieldResult<string> => {
  try {
    const url = new URL(raw);
    return protocols.includes(url.protocol) && url.hostname !== '' ? ok(raw) : fail(`"${raw}" is not ${description}`);
  } catch {
    return fail(`"${raw}" is not a valid link`);
  }
};

export const parseHttpsUrl = (raw: string): FieldResult<string> => parseUrlWithProtocols(raw, ['https:'], 'an https link');

export const parseWebUrl = (raw: string): FieldResult<string> => parseUrlWithProtocols(raw, ['http:', 'https:'], 'a web link');
