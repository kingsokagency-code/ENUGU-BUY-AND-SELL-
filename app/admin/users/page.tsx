'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Search, UserCheck, Shield, Ban, Eye } from 'lucide-react';

const DEMO_USERS = [
  { id: '1', name: 'Kingsley Okoye', email: 'kingsley@unn.edu.ng', campus: 'UNN Nsukka', role: 'Hybrid (Seller + Buyer)', status: 'Active', joined: 'Jan 2025' },
  { id: '2', name: 'Chioma Adebayo', email: 'chioma@imt.edu.ng', campus: 'IMT Campus 1', role: 'Campus Buyer', status: 'Active', joined: 'Feb 2025' },
  { id: '3', name: 'Emeka Nwosu', email: 'emeka@esut.edu.ng', campus: 'ESUT Agbani', role: 'Merchant', status: 'Active', joined: 'Mar 2025' },
  { id: '4', name: 'Faith Umeh', email: 'faith@unn.edu.ng', campus: 'UNN Franco', role: 'Campus Buyer', status: 'Active', joined: 'Apr 2025' },
  { id: '5', name: 'Victor Eze', email: 'victor@gmail.com', campus: 'Enugu Urban', role: 'Suspended User', status: 'Suspended', joined: 'May 2025' },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  const filtered = DEMO_USERS.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'All' || u.role.includes(filterRole);
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1D2B22]">
        <div>
          <h1 className="text-xl font-bold text-white">Users & Roles Management</h1>
          <p className="text-xs text-[#6B9980] mt-0.5">Manage campus buyers, merchants, and hybrid user accounts</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B9980]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111D17] border border-[#1D2B22] text-xs text-white placeholder-[#6B9980] focus:outline-none focus:border-[#087443]"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'Buyer', 'Seller', 'Merchant'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                filterRole === r
                  ? 'bg-[#087443] text-white'
                  : 'bg-[#111D17] text-[#9CB3AA] border border-[#1D2B22]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1F17] text-[#6B9980] font-bold uppercase text-[10px] border-b border-[#1D2B22]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Campus</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2B22] text-white">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#1A2820]/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold">{u.name}</p>
                    <p className="text-[10px] text-[#6B9980]">{u.email}</p>
                  </td>
                  <td className="p-4 text-[#9CB3AA]">{u.campus}</td>
                  <td className="p-4">
                    <span className="bg-[#1A2820] text-[#0A8A50] px-2 py-0.5 rounded-full text-[10px] font-semibold border border-[#243320]">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-[#9CB3AA]">{u.joined}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="px-2.5 py-1 rounded-lg bg-[#1A2820] hover:bg-[#243320] text-[11px] text-white cursor-pointer">
                      Inspect
                    </button>
                    {u.status === 'Active' ? (
                      <button className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-[11px] cursor-pointer">
                        Suspend
                      </button>
                    ) : (
                      <button className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[11px] cursor-pointer">
                        Reactivate
                      </button>
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
