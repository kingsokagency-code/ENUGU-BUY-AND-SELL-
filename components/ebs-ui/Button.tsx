import React from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  as?: 'button' | 'a';
  href?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-[#087443] text-white hover:bg-[#065f35] active:bg-[#053D24] shadow-sm',
  secondary: 'bg-[#F8FAF9] text-[#053D24] border border-[#E5EDE9] hover:bg-[#E5EDE9]',
  outline:   'bg-transparent text-[#087443] border-2 border-[#087443] hover:bg-[#087443]/8',
  ghost:     'bg-transparent text-[#087443] hover:bg-[#087443]/8',
  danger:    'bg-[#EF4444] text-white hover:bg-[#DC2626]',
  gold:      'bg-[#FBBF24] text-[#053D24] hover:bg-[#F59E0B] font-bold',
};

const sizeClasses: Record<Size, string> = {
  xs: 'px-3 py-1.5 text-xs rounded-lg gap-1',
  sm: 'px-4 py-2 text-sm rounded-xl gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
  xl: 'px-8 py-4 text-base rounded-2xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443]/40 disabled:opacity-50 disabled:cursor-not-allowed';
  const classes = [base, variantClasses[variant], sizeClasses[size], fullWidth ? 'w-full' : '', className].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
