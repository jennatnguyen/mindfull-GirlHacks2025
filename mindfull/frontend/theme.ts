// Centralized theme colors for the app
export const colors = {
  // Main app background should stay white per your request
  background: '#ffffff',

  // Use the palette you provided for the rest of the app
  // Provided hexs: C0E5E8, EFECE6, DAF4EF, DEEBEB, 9EDCE1, EFE4CB
  primary: '#C0E5E8',      // soft teal
  secondary: '#EFECE6',    // warm light
  accent: '#DAF4EF',       // pale aqua
  surface: '#DEEBEB',      // off-white surface
  primaryLight: '#9EDCE1', // lighter primary
  cardBg: '#EFE4CB',       // warm card background

  // Keep these semantic tokens for consistency
  warning: '#f59e0b',
  warningLight: '#FEF3C7',
  warningText: '#92400E',
  success: '#10b981',
  successLight: '#ecfdf5',
  muted: '#6b7280',
  text: '#111827',
  border: '#E5E7EB',
};

export type ThemeColors = typeof colors;
