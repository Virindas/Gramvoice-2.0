export const DESIGN_TOKENS = {
  colors: {
    bg: '#FAFAF9',
    surface: '#FFFFFF',
    border: '#E7E5E4',
    textPrimary: '#1C1917',
    textSecondary: '#57534E',
    textMuted: '#A8A29E',
    primary: {
      DEFAULT: '#1D7A73', // Deep Teal
      dark: '#145752',
      light: '#F0FDFA',
      ring: 'rgba(29, 122, 115, 0.2)',
    },
    secondary: {
      DEFAULT: '#E0A526', // Golden Amber
      dark: '#B48218',
      light: '#FEFCE8',
    },
    status: {
      underReview: {
        text: '#D97706',
        bg: '#FEF3C7',
        border: '#FDE68A',
        label: 'Under Review',
      },
      inProgress: {
        text: '#2563EB',
        bg: '#EFF6FF',
        border: '#BFDBFE',
        label: 'In Progress',
      },
      completed: {
        text: '#059669',
        bg: '#ECFDF5',
        border: '#A7F3D0',
        label: 'Completed',
      },
      rejected: {
        text: '#DC2626',
        bg: '#FEF2F2',
        border: '#FECACA',
        label: 'Rejected',
      },
    },
  },
  radius: {
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
  },
} as const;
