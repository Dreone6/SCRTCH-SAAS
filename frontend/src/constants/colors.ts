// SCRTCH Brand Colors (Finalized December 2024)
export const Colors = {
  // Primary Brand Color
  primary: '#4A90E2',         // SCRTCH Blue - buttons, links, CTAs, FAB
  scrtchBlue: '#4A90E2',      // Alias for primary
  
  // Text Colors
  textPrimary: '#1F2937',     // Dark Gray - headings, primary text
  textSecondary: '#4B5563',   // Medium Gray - body text
  textTertiary: '#6B7280',    // Light Gray - secondary text, labels
  textQuaternary: '#9CA3AF',  // Very Light Gray - inactive states, placeholders
  
  // Background Colors (Light Mode)
  background: '#FFFFFF',      // White - main background
  surface: '#F3F4F6',         // Light Gray - cards, input fields
  
  // Background Colors (Dark Mode)
  darkBackground: '#1A1F2E',  // Dark Navy - main background
  darkSurface: '#2A3544',     // Dark Blue Card - cards in dark mode
  
  // Status Colors
  success: '#10B981',         // Green - paid, success, excellent trust score
  warning: '#F59E0B',         // Orange - due soon, warnings, pending
  error: '#EF4444',           // Red - overdue, high risk, errors
  info: '#3B82F6',            // Blue Badge - trust score indicators, info
  caution: '#FCD34D',         // Yellow - caution, AI messages running low
  
  // Neutrals (grayscale palette)
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',   // Same as surface
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',   // Same as textQuaternary
    500: '#6B7280',   // Same as textTertiary
    600: '#4B5563',   // Same as textSecondary
    700: '#374151',
    800: '#1F2937',   // Same as textPrimary
    900: '#111827',
  },
  
  // Legacy aliases (deprecated - for backwards compatibility only)
  prosperlyBlue: '#4A90E2',
  prosperlyNavy: '#1F2937',
  prosperlyMint: '#10B981',
  prosperlySlate: '#F3F4F6',
  prosperlyGold: '#FCD34D',
  
  // Transaction Status Colors
  pending: '#F59E0B',    // Orange
  partial: '#8B5CF6',    // Purple
  paid: '#10B981',       // Green
  overdue: '#EF4444',    // Red
  active: '#3B82F6',     // Blue
};
