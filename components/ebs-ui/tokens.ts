// EBS Design System Tokens
export const colors = {
  deep:      '#053D24',
  green:     '#087443',
  bright:    '#0A8A50',
  gold:      '#FBBF24',
  orange:    '#F97316',
  darkBg:    '#0F1A14',
  darkCard:  '#1A2820',
  darkNav:   '#111D17',
  darkBorder:'#243320',
  canvas:    '#F8FAF9',
  border:    '#E5EDE9',
  textPrime: '#0D1F17',
  textMuted: '#6B7C74',
  textLight: '#9CB3AA',
  white:     '#FFFFFF',
  redBadge:  '#EF4444',
  purple:    '#7C3AED',
} as const;

export const radius = {
  sm:   '6px',
  md:   '10px',
  lg:   '14px',
  xl:   '20px',
  full: '9999px',
} as const;

export const shadow = {
  card:   '0 1px 4px rgba(5,61,36,0.08)',
  lifted: '0 4px 16px rgba(5,61,36,0.12)',
  modal:  '0 8px 40px rgba(5,61,36,0.18)',
} as const;

// Status color mapping
export const statusColors: Record<string, { bg: string; text: string }> = {
  pending:    { bg: '#FEF3C7', text: '#92400E' },
  confirmed:  { bg: '#DCFCE7', text: '#166534' },
  processing: { bg: '#DBEAFE', text: '#1E40AF' },
  delivered:  { bg: '#D1FAE5', text: '#065F46' },
  cancelled:  { bg: '#FEE2E2', text: '#991B1B' },
};
