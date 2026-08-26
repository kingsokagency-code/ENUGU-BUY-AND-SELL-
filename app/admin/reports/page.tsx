'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AlertOctagon, CheckCircle2, Trash2, ShieldAlert } from 'lucide-react';

const INITIAL_REPORTS = [
  { id: '1', target: 'iPhone 11 Pro 64GB', targetType: 'Product', reason: 'Suspected fake IMEI / duplicate listing', reporter: 'Chidi N.', date: '20 mins ago', status: 'Pending' },
  { id: '2', target: 'Campus Quick Loans', targetType: 'Store', reason: 'Unverified financial services prohibited', reporter: 'EBS Auto-Filter', date: '1h ago', status: 'Pending' },
  { id: '3', target: 'Power Bank 20000mAh', targetType: 'Product', reason: 'Price gouging / incorrect condition', reporter: 'Blessing A.', date: '3h ago', status: 'Pending' },
  { id: '4', target: 'MacBook Pro M1', targetType: 'Product', reason: 'Resolved - Verified merchant invoice provided', reporter: 'System', date: 'Yesterday', status: 'Resolved' },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState(INITIAL_REPORTS);

  const handleResolve = (id: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'Resolved' } : r));
  };

  const handleDismiss = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1D2B22]">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-400" />
            <h1 className="text-xl font-bold text-white">Marketplace Moderation & Safety</h1>
          </div>
          <p className="text-xs text-[#6B9980] mt-0.5">Audit reported products, storefronts, and policy violations</p>
        </div>
      </div>

      <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1F17] text-[#6B9980] font-bold uppercase text-[10px] border-b border-[#1D2B22]">
              <tr>
                <th className="p-4">Reported Target</th>
                <th className="p-4">Type</th>
                <th className="p-4">Violation / Reason</th>
                <th className="p-4">Reporter</th>
                <th className="p-4">Reported</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2B22] text-white">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-[#1A2820]/50 transition-colors">
                  <td className="p-4 font-bold">{r.target}</td>
                  <td className="p-4 text-[#9CB3AA]">
                    <span className="px-2 py-0.5 rounded bg-[#1A2820] text-[#0A8A50] text-[10px] font-semibold border border-[#243320]">
                      {r.targetType}
                    </span>
                  </td>
                  <td className="p-4 text-red-300/90">{r.reason}</td>
                  <td className="p-4 text-[#9CB3AA]">{r.reporter}</td>
                  <td className="p-4 text-[#6B9980]">{r.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {r.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleResolve(r.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#087443] hover:bg-[#0A8A50] text-[11px] font-bold text-white transition-colors cursor-pointer"
                        >
                          Resolve Listing
                        </button>
                        <button
                          onClick={() => handleDismiss(r.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#1A2820] hover:bg-[#243320] text-[11px] text-[#9CB3AA] cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Audit Complete
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
