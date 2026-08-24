/**
 * The brand kit from the product contract §2, as tokens.
 *
 * The field is bright and offices are not, so both schemes exist from day one.
 * Light leans on cream and sand; dark leans on forest, which is the brand's own
 * near-black rather than a generic grey.
 */
export const brand = {
  forest: '#0e2b1e',
  leaf: '#a6c443',
  deepLeaf: '#176034',
  cream: '#faf7f1',
  sand: '#f4efe4',
  ink: '#23241f',
  /** Reserved: an approved river is always this blue on a map. */
  river: '#3b82f6',
} as const;

export type Scheme = {
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  accent: string;
  danger: string;
};

export const light: Scheme = {
  background: brand.cream,
  surface: '#ffffff',
  border: '#e4ddcd',
  text: brand.ink,
  textMuted: '#6b6a63',
  primary: brand.forest,
  onPrimary: brand.cream,
  accent: brand.deepLeaf,
  danger: '#b42318',
};

export const dark: Scheme = {
  background: brand.forest,
  surface: '#14382a',
  border: '#215240',
  text: brand.cream,
  textMuted: '#9fb3a8',
  primary: brand.leaf,
  onPrimary: brand.forest,
  accent: brand.leaf,
  danger: '#f97066',
};
