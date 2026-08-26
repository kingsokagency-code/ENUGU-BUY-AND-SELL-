import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: number; // percent e.g. +23.5 or -5.2
  icon?: React.ReactNode;
  action?: React.ReactNode;
  dark?: boolean;
  className?: string;
  isDemo?: boolean;
}

export function MetricCard({
  label,
  value,
  subValue,
  change,
  icon,
  action,
  dark = false,
  className = '',
  isDemo = false,
}: MetricCardProps) {
  const bg     = dark ? 'bg-[#1A2820] border-[#243320]' : 'bg-white border-[#E5EDE9]';
  const label_ = dark ? 'text-[#6B9980]'                : 'text-[#6B7C74]';
  const value_ = dark ? 'text-white'                     : 'text-[#0D1F17]';
  const sub_   = dark ? 'text-[#9CB3AA]'                 : 'text-[#6B7C74]';

  const trend =
    change === undefined ? null :
    change > 0  ? { icon: <TrendingUp  className="w-3 h-3" />, cls: 'text-emerald-400', str: `+${change.toFixed(1)}%` } :
    change < 0  ? { icon: <TrendingDown className="w-3 h-3" />, cls: 'text-red-400',    str: `${change.toFixed(1)}%`  } :
                  { icon: <Minus        className="w-3 h-3" />, cls: 'text-gray-400',   str: '0%' };

  return (
    <div className={`rounded-2xl border p-4 ${bg} ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium mb-1 ${label_}`}>{label}</p>
          <p className={`text-2xl font-bold leading-none ${value_}`}>{value}</p>
          {subValue && <p className={`text-xs mt-1 ${sub_}`}>{subValue}</p>}
          {trend && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold mt-1.5 ${trend.cls}`}>
              {trend.icon}{trend.str}
            </span>
          )}
          {isDemo && (
            <span className="inline-block text-[9px] text-amber-500 border border-amber-200 rounded px-1 mt-1">
              Demo data
            </span>
          )}
        </div>
        {icon && (
          <span className={`p-2 rounded-xl ${dark ? 'bg-[#243320]' : 'bg-[#F0FBF4]'} text-[#087443] shrink-0`}>
            {icon}
          </span>
        )}
      </div>
      {action && <div className="mt-3 pt-3 border-t border-current/10">{action}</div>}
    </div>
  );
}
