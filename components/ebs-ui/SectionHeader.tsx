import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  dark?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action, dark = false, className = '', icon }: SectionHeaderProps) {
  const text  = dark ? 'text-white'     : 'text-[#0D1F17]';
  const muted = dark ? 'text-[#6B9980]' : 'text-[#6B7C74]';

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-[#087443]">{icon}</span>}
        <div>
          <h2 className={`text-base font-bold leading-tight ${text}`}>{title}</h2>
          {subtitle && <p className={`text-xs mt-0.5 ${muted}`}>{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Simple "View all" link with right arrow */
export function ViewAllLink({ href, dark = false }: { href: string; dark?: boolean }) {
  const cls = dark ? 'text-[#0A8A50] hover:text-[#087443]' : 'text-[#087443] hover:text-[#053D24]';
  return (
    <a href={href} className={`text-sm font-semibold flex items-center gap-1 transition-colors ${cls}`}>
      View all
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </a>
  );
}
