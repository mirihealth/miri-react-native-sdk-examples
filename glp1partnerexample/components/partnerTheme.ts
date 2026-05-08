// Pretend customer brand: "MetaPath Health" — a fictional virtual GLP-1 clinic
// shipping their own branded patient app. The patient is on tirzepatide via
// mail-order, sees prescribers virtually, tracks weight + side effects.
//
// This palette is deliberately distinct from nutritionistexample's warm
// terracotta/cream — clinical blue + coral here vs. earthy nutrition tones
// there — so customers browsing both examples see two recognisably different
// partner brands rather than the "same Miri demo, different paint."

export const PARTNER_BRAND = {
  name: 'MetaPath',
  longName: 'MetaPath Health',
  tagline: 'Your weight-loss care, in one place.',
  patientFirstName: 'Jordan',
  prescriber: 'Dr. Lena Patel, MD',
  medication: {
    name: 'Tirzepatide',
    dose: '5mg',
    frequency: 'weekly',
    route: 'subcutaneous',
  },
} as const;

export const partnerColors = {
  // Modern clinical palette
  primary: '#2563EB', // sapphire blue — primary brand
  primaryMuted: '#60A5FA',
  primarySoft: '#EFF6FF', // primary tint background
  accent: '#FB7185', // warm coral — CTAs, dose pill
  accentSoft: '#FFF1F2',
  surface: '#F8FAFC', // off-white app bg
  surfaceElevated: '#FFFFFF', // card bg
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  text: '#0F172A', // slate-900
  textMuted: '#64748B', // slate-500
  textSubtle: '#94A3B8', // slate-400
  success: '#10B981', // emerald — on-track signals
  warning: '#F59E0B', // amber — refill due, side effect logged
  danger: '#EF4444', // red — missed dose
} as const;

export const partnerNavigationTheme = {
  dark: false,
  colors: {
    primary: partnerColors.primary,
    background: partnerColors.surface,
    card: partnerColors.surfaceElevated,
    text: partnerColors.text,
    border: partnerColors.border,
    notification: partnerColors.accent,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};

// Theme handed to MiriAppProvider so SDK components feel native to MetaPath.
// The SDK theme uses different keys than @react-navigation theme.
export const miriThemeForPartner = {
  colors: {
    background: partnerColors.surfaceElevated,
    text: partnerColors.text,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};
