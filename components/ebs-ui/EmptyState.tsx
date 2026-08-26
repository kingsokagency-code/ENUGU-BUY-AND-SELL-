import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  dark?: boolean;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, dark = false, compact = false }: EmptyStateProps) {
  const text  = dark ? 'text-white'     : 'text-[#0D1F17]';
  const muted = dark ? 'text-[#6B9980]' : 'text-[#6B7C74]';

  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 gap-2' : 'py-16 gap-4'}`}>
      {icon && (
        <span className={`${compact ? 'text-4xl' : 'text-6xl'} opacity-30`}>{icon}</span>
      )}
      <p className={`font-semibold ${compact ? 'text-sm' : 'text-base'} ${text}`}>{title}</p>
      {description && <p className={`text-sm max-w-xs ${muted}`}>{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
