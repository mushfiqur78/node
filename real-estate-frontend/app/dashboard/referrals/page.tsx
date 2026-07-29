'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, MousePointer, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MyReferralsPage() {
  const { data: referralData, isLoading: loadingReferral } = useQuery({
    queryKey: ['my-referral-me'],
    queryFn: async () => {
      const { data } = await api.get('/referral/me');   // singular
      return data.data;
    },
  });

  const { data: referralsList, isLoading: loadingList } = useQuery({
    queryKey: ['my-referrals-list'],
    queryFn: async () => {
      const { data } = await api.get('/referral/my-referrals');  // singular
      return data.data as any[];
    },
  });

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Clicks',  value: referralData?.totalClicks  ?? 0, icon: MousePointer, color: 'text-[#1a72b0]',   bg: 'bg-[#e6f2fa]' },
          { label: 'Conversions',   value: referralData?.conversions  ?? 0, icon: Users,         color: 'text-green-500',  bg: 'bg-green-50' },
          { label: 'Total Earned',  value: `BDT ${(referralData?.totalEarned ?? 0).toLocaleString()}`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <Icon size={18} className={`${color} mb-2`} />
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Referred users list */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">People You Referred</h2>
          <Link href="/dashboard/how-to-refer"
            className="text-sm text-[#005e9e] hover:underline flex items-center gap-1">
            Get your link <ArrowRight size={14} />
          </Link>
        </div>

        {loadingList ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 skeleton rounded-lg" />)}</div>
        ) : !referralsList?.length ? (
          <div className="text-center py-10">
            <Users size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm mb-3">No referrals yet.</p>
            <Link href="/dashboard/how-to-refer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#005e9e] text-white text-sm font-semibold rounded-lg hover:bg-[#004d84] transition">
              Share Your Referral Link
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {referralsList.map((ref: any) => (
              <div key={ref._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#cce5f5] flex items-center justify-center text-[#004d84] font-bold text-sm">
                    {ref.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ref.userId?.name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">{ref.userId?.email || '—'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{new Date(ref.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
