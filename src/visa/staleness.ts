import type { IsoDate } from './types';

export const MAX_VERIFICATION_AGE_DAYS = 183;

const MILLISECONDS_PER_DAY = 86_400_000;

const toUtcDayNumber = (date: IsoDate): number => Date.parse(`${date}T00:00:00Z`) / MILLISECONDS_PER_DAY;

export const isStale = (verifiedOn: IsoDate, today: IsoDate): boolean =>
  toUtcDayNumber(today) - toUtcDayNumber(verifiedOn) > MAX_VERIFICATION_AGE_DAYS;
