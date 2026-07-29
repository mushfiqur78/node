'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDateTime, buildQueryString } from '@/lib/referralUtils';

interface Lead {
  _id: string; name: string; email: string; phone: string;
  propertyId: { _id: string; title: string } | string;
  referralCode: string | null;
  userId: string | null;
  createdAt: string;
}

export default function ReferralLeadsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['referral-leads', page],
    queryFn: async () => {
      const res = await api.get(`/admin/referral-leads?${buildQueryString({ page, limit: 15 })}`);
      return res.data;
    },
  });

  const leads: Lead[] = data?.data ?? [];
  const pagination    = data?.pagination;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>{['Name', 'Contact', 'Property', 'Ref Code', 'Type', 'Submitted'].map((h) => (
              <th key={h} className="px-4 py-3 font-medium">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              : leads.length === 0
              ? <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No leads found.</td></tr>
              : leads.map((l) => {
                  const prop = typeof l.propertyId === 'object' ? l.propertyId : null;
                  return (
                    <tr key={l._id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium">{l.name}</td>
                      <td className="px-4 py-3"><p>{l.email}</p><p className="text-xs text-gray-400">{l.phone}</p></td>
                      <td className="px-4 py-3 text-xs text-blue-600">{prop?.title ?? '—'}</td>
                      <td className="px-4 py-3">
                        {l.referralCode
                          ? <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{l.referralCode}</span>
                          : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${l.userId ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                          {l.userId ? 'Registered' : 'Guest'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(l.createdAt)}</td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Total: {pagination.total} leads</span>
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
