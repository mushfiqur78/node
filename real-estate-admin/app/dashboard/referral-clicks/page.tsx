'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDateTime, buildQueryString } from '@/lib/referralUtils';

interface Click {
  _id: string; refCode: string; ip: string; source: string;
  device: { os: string; browser: string };
  geo: { country: string | null; city: string | null };
  createdAt: string;
}

const SOURCE_OPTIONS = ['', 'direct', 'whatsapp', 'facebook', 'twitter', 'instagram', 'web'];

export default function ReferralClicksPage() {
  const [page,     setPage]     = useState(1);
  const [source,   setSource]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [debouncedFrom, setDebouncedFrom] = useState('');
  const [debouncedTo,   setDebouncedTo]   = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedFrom(dateFrom), 500);
    return () => clearTimeout(t);
  }, [dateFrom]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTo(dateTo), 500);
    return () => clearTimeout(t);
  }, [dateTo]);

  const { data, isLoading } = useQuery({
    queryKey: ['referral-clicks', page, source, debouncedFrom, debouncedTo],
    queryFn: async () => {
      const qs = buildQueryString({ page, limit: 15, source: source || undefined, dateFrom: debouncedFrom || undefined, dateTo: debouncedTo || undefined });
      const res = await api.get(`/admin/referral-clicks?${qs}`);
      return res.data;
    },
  });

  const clicks: Click[]  = data?.data ?? [];
  const pagination       = data?.pagination;

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
          <select value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All Sources'}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date From</label>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date To</label>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              {['Ref Code', 'Source', 'Device / Browser', 'Location', 'Date'].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              : clicks.length === 0
              ? <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No clicks found.</td></tr>
              : clicks.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3"><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{c.refCode}</span></td>
                    <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{c.source}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{c.device.os} · {c.device.browser}</td>
                    <td className="px-4 py-3 text-xs">{c.geo?.country ? `${c.geo.city ? c.geo.city + ', ' : ''}${c.geo.country}` : <span className="text-gray-300">Resolving…</span>}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(c.createdAt)}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Total: {pagination.total} clicks</span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-xs">Prev</button>
            <span className="px-3 py-1.5 text-xs">{page} / {pagination.totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-xs">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
