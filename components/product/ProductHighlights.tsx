import React from 'react';
import { CheckCircle2, ShieldCheck, MapPin, Truck } from 'lucide-react';

interface ProductHighlightsProps {
  description?: string;
  condition?: string;
  location?: string;
  highlights?: string[];
}

export function ProductHighlights({
  description,
  condition = 'Brand New (Sealed)',
  location = 'UNN Main Campus, Nsukka',
  highlights = [
    'Original packaging with full manufacturer warranty',
    'Tested and verified by EBS Merchant Quality Control',
    'Hand-to-hand campus meetup or hostel dispatch available',
    'Instant WhatsApp support with seller upon order creation',
  ],
}: ProductHighlightsProps) {
  return (
    <div className="space-y-6">
      {/* Product Description */}
      <div className="bg-white rounded-3xl border border-[#E5EDE9] p-6 space-y-3">
        <h2 className="text-sm font-bold text-[#0D1F17] uppercase tracking-wider">Product Description</h2>
        <p className="text-xs sm:text-sm text-[#6B7C74] leading-relaxed whitespace-pre-line">
          {description || 'Experience premium performance and long-lasting durability. This genuine device is verified and supported by verified local merchant warranty on Enugu Buy & Sell.'}
        </p>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E5EDE9] text-xs">
          <div>
            <span className="text-[#9CB3AA]">Condition:</span>
            <p className="font-bold text-[#0D1F17] mt-0.5">{condition}</p>
          </div>
          <div>
            <span className="text-[#9CB3AA]">Location:</span>
            <p className="font-bold text-[#0D1F17] mt-0.5">{location}</p>
          </div>
        </div>
      </div>

      {/* Campus Verification & Delivery Policy */}
      <div className="bg-white rounded-3xl border border-[#E5EDE9] p-6 space-y-3">
        <h2 className="text-sm font-bold text-[#0D1F17] uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#087443]" />
          <span>EBS Safe Campus Trade</span>
        </h2>

        <div className="space-y-2.5">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-[#0D1F17]">
              <CheckCircle2 className="w-4 h-4 text-[#087443] shrink-0 mt-0.5" />
              <span>{h}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
