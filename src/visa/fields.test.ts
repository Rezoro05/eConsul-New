import { describe, expect, it } from 'vitest';
import { parseCountryCode, parseHttpsUrl, parseIsoDate, parseMaxStay, parseRequirement } from './fields';
import { REQUIREMENTS } from './types';

const failed = { ok: false, message: expect.any(String) };

describe('parseCountryCode', () => {
  it('accepts an uppercase ISO alpha-2 code', () => {
    expect(parseCountryCode('GE')).toEqual({ ok: true, value: 'GE' });
  });

  it.each(['ge', 'GEO', 'G1', '', ' GE'])('rejects %j', (raw) => {
    expect(parseCountryCode(raw)).toEqual(failed);
  });
});

describe('parseRequirement', () => {
  it.each(REQUIREMENTS)('accepts %s', (requirement) => {
    expect(parseRequirement(requirement)).toEqual({ ok: true, value: requirement });
  });

  it.each(['visa free', 'VISA_FREE', '', 'covid ban'])('rejects %j', (raw) => {
    expect(parseRequirement(raw)).toEqual(failed);
  });
});

describe('parseMaxStay', () => {
  it('treats an empty value as no stated limit', () => {
    expect(parseMaxStay('')).toEqual({ ok: true, value: null });
  });

  it('accepts a positive whole number of days', () => {
    expect(parseMaxStay('90')).toEqual({ ok: true, value: 90 });
  });

  it.each(['0', '-5', '7.5', 'abc', '90 days'])('rejects %j', (raw) => {
    expect(parseMaxStay(raw)).toEqual(failed);
  });
});

describe('parseIsoDate', () => {
  it('accepts a real calendar date in YYYY-MM-DD form', () => {
    expect(parseIsoDate('2026-07-15')).toEqual({ ok: true, value: '2026-07-15' });
  });

  it('accepts 29 February in a leap year', () => {
    expect(parseIsoDate('2028-02-29')).toEqual({ ok: true, value: '2028-02-29' });
  });

  it.each(['2026-02-30', '2026-02-29', '2026-13-01', '15/07/2026', '2026-7-15', ''])('rejects %j', (raw) => {
    expect(parseIsoDate(raw)).toEqual(failed);
  });
});

describe('parseHttpsUrl', () => {
  it('accepts an https URL', () => {
    const url = 'https://www.gdrfad.gov.ae/en/node/2086';
    expect(parseHttpsUrl(url)).toEqual({ ok: true, value: url });
  });

  it.each(['http://example.gov', 'ftp://example.gov', 'www.example.gov', 'https://', ''])('rejects %j', (raw) => {
    expect(parseHttpsUrl(raw)).toEqual(failed);
  });
});
