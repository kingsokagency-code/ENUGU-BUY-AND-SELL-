'use client';

import { useState } from 'react';
import { Flag, X, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'listing' | 'seller' | 'user';
  targetId: string;
  targetName: string;
}

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}: ReportModalProps) {
  const [reason, setReason] = useState<string>('scam');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          reason,
          details,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        setError('Please sign in to submit a report.');
      } else if (!res.ok) {
        setError(data.error || 'Failed to submit report');
      } else {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2500);
      }
    } catch {
      setError('Connection error while submitting report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#667085] hover:text-[#111111] p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111111]">Report Content</h2>
            <p className="text-xs text-[#667085] truncate max-w-[260px]">{targetName}</p>
          </div>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#E8F5EF] text-[#087443] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-[#111111]">Report Submitted</h3>
            <p className="text-xs text-[#667085]">
              Thank you for keeping our campus community safe. Our team will review this listing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">
                Reason for report *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-xs text-[#111111] rounded-xl px-3 py-2.5 outline-none"
              >
                <option value="scam">Potential Scam / Fraud</option>
                <option value="fake_product">Counterfeit / Fake Item</option>
                <option value="prohibited_item">Prohibited / Illegal Item</option>
                <option value="harassment">Harassment or Abuse</option>
                <option value="spam">Spam or Duplicate Listing</option>
                <option value="other">Other Violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">
                Additional details (optional)
              </label>
              <textarea
                placeholder="Explain what seems suspicious about this listing or seller..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-xs text-[#111111] rounded-xl px-3 py-2 outline-none min-h-[75px]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white border border-slate-300 hover:border-slate-400 text-xs font-bold py-2.5 rounded-xl text-[#111111] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
