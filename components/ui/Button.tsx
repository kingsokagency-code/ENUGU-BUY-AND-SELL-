'use client';

import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  className = '',
  size = 'lg',
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-[15px] gap-2',
    lg: 'px-8 py-4 text-base gap-2',
  };

  const variantClasses = {
    primary: [
      'bg-brand-green text-white',
      'shadow-lg shadow-brand-green/20',
      'hover:bg-brand-green-700',
      'disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none',
    ].join(' '),
    ghost: [
      'bg-transparent text-gray-400',
      'hover:text-gray-700 hover:bg-gray-50',
    ].join(' '),
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center rounded-full font-semibold',
        'tracking-tight transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2',
        'disabled:pointer-events-none select-none',
        sizeClasses[size],
        variantClasses[variant],
        className,
      ].join(' ')}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.button>
  );
}
