'use client';

import { useState, useEffect, useCallback } from 'react';

export default function DashboardPage() {
  const [responses, setResponses] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  /* ── Server-Side Admin Auth (Remediating H1) ── */
  const handleLogin = async () => {
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed');
      } else {
        setAuthed(true);
        fetchAll();
      }
    } catch {
      setAuthError('Connection error during authentication');
    }
  };

  /* ── Fetch Data from Protected APIs (Remediating C1) ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const rRes = await fetch('/api/responses');
      if (rRes.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await rRes.json();
      setResponses(data.responses ?? []);
      setAuthed(true);
    } catch {
      console.error('[Dashboard] Error fetching responses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ── PASSWORD GATE ── */
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex items-center justify-center px-5">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#087443] text-white font-black flex items-center justify-center text-xl shadow-sm">
              E
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#087443]">Admin Control</p>
              <h1 className="text-xl font-bold text-[#111111] mt-1">Research Dashboard</h1>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5">Admin Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(null); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin password"
                className="w-full bg-[#FAFAF8] border border-slate-300 rounded-xl px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#087443]"
              />
            </div>
            {authError && <p className="text-red-600 text-xs font-semibold">{authError}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-[#087443] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#065f37] transition-colors shadow-sm"
            >
              Authenticate Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── DASHBOARD VIEW ── */
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111]">
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-5 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#087443] text-white font-black flex items-center justify-center text-base">
              E
            </div>
            <div>
              <p className="text-xs font-bold text-[#087443] uppercase tracking-wider">Enugu Buy &amp; Sell</p>
              <p className="text-sm font-bold text-[#111111]">Admin Survey Dashboard</p>
            </div>
          </div>
          <span className="text-xs bg-[#E8F5EF] text-[#087443] px-3 py-1 rounded-full font-bold">
            Authenticated Admin
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#111111]">Survey Submissions ({responses.length})</h2>
          <p className="text-xs text-[#667085] mt-1">Protected admin view of empirical research dataset.</p>
        </div>

        {loading ? (
          <p className="text-xs text-[#667085]">Loading responses...</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-5 py-3 text-[#667085] font-bold">Institution</th>
                    <th className="text-left px-5 py-3 text-[#667085] font-bold">Challenge</th>
                    <th className="text-left px-5 py-3 text-[#667085] font-bold">Platform</th>
                    <th className="text-left px-5 py-3 text-[#667085] font-bold">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-[#111111]">{r.institution || '—'}</td>
                      <td className="px-5 py-3 text-[#667085]">{r.biggest_challenge || '—'}</td>
                      <td className="px-5 py-3 text-[#667085]">{r.platform_preference || '—'}</td>
                      <td className="px-5 py-3 text-[#667085]">{r.submitted_at || r.completed_at || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
