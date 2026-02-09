/**
 * Dark Gold Theme Colors
 * Production fleet management color system
 */

export const colors = {
  // Primary brand colors
  primary: '#F6D13A',
  primaryDark: '#D4B030',
  primaryLight: '#F8DC5C',
  
  // Background colors
  background: '#2D2D2D',
  surface: '#383838',
  surfaceElevated: '#424242',
  
  // Text colors
  textPrimary: '#F5F5F5',
  textSecondary: '#B8B8B8',
  textTertiary: '#8A8A8A',
  
  // Vehicle status colors
  status: {
    available: '#4CAF50',
    assigned: '#64B5F6',
    inTransit: '#FF9800',
    returning: '#8A8A8A',
  },
  
  // Semantic colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#64B5F6',
  
  // Border and divider
  border: '#4A4A4A',
  divider: '#3D3D3D',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
} as const;

export type Colors = typeof colors;