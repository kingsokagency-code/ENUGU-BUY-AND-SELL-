'use client';

import { motion } from 'framer-motion';

interface OptionCardProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export default function OptionCard({ label, isSelected, onClick, index }: OptionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={isSelected}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.035, ease: 'easeOut' }}
      whileHover={{ y: -1, boxShadow: '0 6px 20px rgba(0,0,0,0.07)' }}
      whileTap={{ scale: 0.99 }}
      className={[
        'w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl border-2',
        'text-left font-medium text-[15px] leading-snug cursor-pointer select-none',
        'transition-colors duration-150 focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-green',
        isSelected
          ? 'border-brand-green bg-brand-green-50 text-brand-green-800'
          : 'border-gray-100 bg-white text-gray-600 hover:border-brand-green/30 hover:bg-brand-green-50/50',
      ].join(' ')}
    >
      {/* Animated radio dot */}
      <span
        className={[
          'w-[18px] h-[18px] flex-shrink-0 rounded-full border-2 flex items-center justify-center',
          'transition-all duration-200',
          isSelected ? 'border-brand-green bg-brand-green' : 'border-gray-300',
        ].join(' ')}
      >
        {isSelected && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 22 }}
            className="w-[7px] h-[7px] rounded-full bg-white block"
          />
        )}
      </span>

      <span className="flex-1 leading-normal">{label}</span>
    </motion.button>
  );
}
