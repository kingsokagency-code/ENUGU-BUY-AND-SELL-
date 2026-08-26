import React from 'react';
import { statusColors } from './tokens';

export interface OrderRowData {
  id: string;
  customer?: string;
  product: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
  date: string;
  image?: string;
}

interface OrderRowProps {
  order: OrderRowData;
  dark?: boolean;
  showCustomer?: boolean;
  onClick?: () => void;
}

function formatNaira(n: number) {
  return `₦${n.toLocaleString('en-NG')}`;
}

export function OrderRow({ order, dark = false, showCustomer = true, onClick }: OrderRowProps) {
  const { customer, product, amount, status, date, image } = order;
  const { bg, text } = statusColors[status] ?? { bg: '#F3F4F6', text: '#6B7280' };
  const border = dark ? 'border-[#243320]' : 'border-[#E5EDE9]';
  const textClr = dark ? 'text-white' : 'text-[#0D1F17]';
  const muted   = dark ? 'text-[#6B9980]' : 'text-[#6B7C74]';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 py-3 border-b last:border-b-0 ${border} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Product image / placeholder */}
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F0FBF4] shrink-0">
        {image
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={image} alt={product} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-[#087443]/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
              </svg>
            </div>
        }
      </div>

      {/* Product + customer */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${textClr}`}>{product}</p>
        {showCustomer && customer && (
          <p className={`text-xs ${muted} truncate`}>{customer}</p>
        )}
        <p className={`text-xs ${muted}`}>{date}</p>
      </div>

      {/* Amount + status */}
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${textClr}`}>{formatNaira(amount)}</p>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md capitalize"
          style={{ background: bg, color: text }}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
