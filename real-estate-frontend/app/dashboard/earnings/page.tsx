'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function EarningsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-earnings'],
    queryFn: async () => {
      const { data } = await api.get('/referral/earnings');  // singular
      return data.data;
    },
  });

  const rewards: any[] = data?.rewardBreakdown || [];
  const paid    = rewards.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0);
  const pending = rewards.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount, 0);
  const approved = rewards.filter(r => r.status === 'approved').reduce((s, r) => s + r.amount, 0);

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    paid:      { label: 'Paid',      color: 'bg-green-100 text-green-700',  icon: CheckCircle },
    approved:  { label: 'Approved',  color: 'bg-[#cce5f5] text-[#004d84]',    icon: CheckCircle },
    pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700',  icon: Clock },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700',      icon: XCircle },
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-700">BDT {paid.toLocaleString()}</p>
        </div>
        <div className="bg-[#e6f2fa] rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Approved</p>
          <p className="text-2xl font-bold text-[#004d84]">BDT {approved.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-700">BDT {pending.toLocaleString()}</p>
        </div>
      </div>

      {/* Stats from referral */}
      {data && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Referral Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-gray-900">{data.totalClicks ?? 0}</p>
              <p className="text-xs text-gray-500">Total Clicks</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{data.conversions ?? 0}</p>
              <p className="text-xs text-gray-500">Conversions</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">BDT {(data.totalEarned ?? 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Lifetime Earned</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{rewards.length}</p>
              <p className="text-xs text-gray-500">Total Rewards</p>
            </div>
          </div>
        </div>
      )}

      {/* Reward history */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Reward History</h2>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 skeleton rounded-lg" />)}</div>
        ) : !rewards.length ? (
          <div className="text-center py-10">
            <TrendingUp size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No rewards yet. Start referring to earn!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map((reward: any) => {
              const cfg = statusConfig[reward.status] || statusConfig.pending;
              const Icon = cfg.icon;
              return (
                <div key={reward._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">BDT {reward.amount?.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{new Date(reward.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                    <Icon size={11} />{cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
