export type CountryCode = string & { readonly __brand: 'CountryCode' };
export type IsoDate = string & { readonly __brand: 'IsoDate' };

export const REQUIREMENTS = [
  'visa_free',
  'eta',
  'evisa',
  'visa_on_arrival',
  'visa_required',
  'no_admission',
] as const;
export type Requirement = (typeof REQUIREMENTS)[number];

export type Origin = { file: string; line: number };

export type Verification = { verifiedOn: IsoDate; sourceUrl: string };

export type BaseRow = {
  passport: CountryCode;
  destination: CountryCode;
  requirement: Requirement;
  maxStayDays: number | null;
  verification: Verification | null;
  origin: Origin;
};

export type Correction = {
  passport: CountryCode;
  destination: CountryCode;
  requirement: Requirement;
  maxStayDays: number | null;
  verification: Verification;
  verifiedBy: string;
  note: string | null;
  origin: Origin;
};

export type Provenance =
  | { kind: 'unverified'; baseSnapshot: IsoDate }
  | { kind: 'verified'; verifiedOn: IsoDate; sourceUrl: string; stale: boolean };

export type VisaRule = {
  passport: CountryCode;
  destination: CountryCode;
  requirement: Requirement;
  maxStayDays: number | null;
  provenance: Provenance;
};

export type RuleEntry = Omit<VisaRule, 'passport' | 'destination'>;

export type PassportFile = {
  passport: CountryCode;
  rules: Record<string, RuleEntry>;
};

export type RowError = { file: string; line: number; field?: string; message: string };

export type Result<T> = { ok: true; value: T } | { ok: false; errors: RowError[] };

export type FieldResult<T> = { ok: true; value: T } | { ok: false; message: string };

export type CsvRow = { line: number; values: Record<string, string> };
export type CsvTable = { header: string[]; rows: CsvRow[] };

export type BuildSummary = {
  passports: number;
  rules: number;
  verified: number;
  stale: number;
};
