'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate, formatCurrency, getErrorMessage, buildQueryString } from '@/lib/referralUtils';

interface Reward {
  _id: string;
  userId: { _id: string; name: string; email: string } | string;
  propertyId: { _id: string; title: string; propertyId: string } | string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
}

const STATUS_BADGE: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  paid:     'bg-blue-100 text-blue-700',
};

export default function RewardsPage() {
  const qc = useQueryClient();
  const [page,   setPage]   = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['rewards', page, status],
    queryFn: async () => {
      const res = await api.get(`/admin/rewards?${buildQueryString({ page, limit: 15, status: status || undefined })}`);
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/rewards/${id}/approve`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rewards'] }); toast.success('Reward approved'); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const paidMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/rewards/${id}/paid`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rewards'] }); toast.success('Marked as paid'); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rewards: Reward[] = data?.data ?? [];
  const pagination        = data?.pagination;

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="w-44">
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>{['User', 'Property', 'Amount', 'Status', 'Date', 'Actions'].map((h) => (
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
              : rewards.length === 0
              ? <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No rewards found.</td></tr>
              : rewards.map((r) => {
                  const user = typeof r.userId === 'object' ? r.userId : null;
                  const prop = typeof r.propertyId === 'object' ? r.propertyId : null;
                  return (
                    <tr key={r._id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        {user ? <div><p className="font-medium">{user.name}</p><p className="text-xs text-gray-400">{user.email}</p></div>
                               : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-blue-600">{prop?.title ?? '—'}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(r.amount)}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[r.status]}`}>{r.status}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        {r.status === 'pending' && (
                          <button onClick={() => approveMutation.mutate(r._id)} disabled={approveMutation.isPending}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-green-100 hover:text-green-700 rounded-lg transition disabled:opacity-50">
                            <CheckCircle size={13} /> Approve
                          </button>
                        )}
                        {r.status === 'approved' && (
                          <button onClick={() => paidMutation.mutate(r._id)} disabled={paidMutation.isPending}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition disabled:opacity-50">
                            <DollarSign size={13} /> Mark Paid
                          </button>
                        )}
                        {r.status === 'paid' && <span className="text-xs text-gray-400">Completed</span>}
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Total: {pagination.total} rewards</span>
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
