// Pretend customer brand: "NutriPath" — a fictional EHR for nutritionists
// servicing patient-side flows (schedule, supplement refills, account).
//
// The palette is deliberately distinct from Miri's mint/blue so the demo
// makes the integration boundary visible: when the user taps the partner's
// Coach tab and Miri's bottom-nav stacks above the partner's bottom-nav,
// the two brand surfaces are unmistakably different.

export const PARTNER_BRAND = {
  name: 'NutriPath',
  tagline: 'Your nutritionist, in your pocket.',
} as const;

export const partnerColors = {
  // Warm, earthy nutrition palette
  primary: '#7B4F2C', // deep terracotta
  primaryMuted: '#A47551',
  accent: '#D9A05B', // warm ochre
  surface: '#FBF7F1', // cream
  surfaceElevated: '#FFFFFF',
  border: '#E5DCCC',
  text: '#2A2118', // deep brown-black
  textMuted: '#7A6B5C',
  success: '#4F7A4C', // sage green
  danger: '#B25450',
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
