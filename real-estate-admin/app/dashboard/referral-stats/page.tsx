'use client';
import { useQuery } from '@tanstack/react-query';
import { MousePointerClick, Users, CheckCircle, Clock, DollarSign, Gift, Ticket } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '@/lib/api';

interface Stats {
  referrals: { total: number; totalClicks: number; conversions: number };
  rewards:   { total: number; pending: number; approved: number; paid: number; totalAmount: number };
  coupons:   { total: number; active: number };
  leads:     { total: number };
}

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4">
      <div className={`${color} p-3 rounded-lg text-white shrink-0`}><Icon size={20} /></div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4 animate-pulse">
      <div className="w-11 h-11 rounded-lg bg-gray-100" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 w-24 bg-gray-100 rounded" />
        <div className="h-6 w-16 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function ReferralStatsPage() {
  const { data, isLoading } = useQuery<Stats>({
    queryKey: ['referral-stats'],
    queryFn:  async () => {
      const res = await api.get('/admin/referral-stats');
      return res.data.data;
    },
  });

  const chartData = [
    { name: 'Pending',  count: data?.rewards.pending  ?? 0, fill: '#f59e0b' },
    { name: 'Approved', count: data?.rewards.approved ?? 0, fill: '#10b981' },
    { name: 'Paid',     count: data?.rewards.paid     ?? 0, fill: '#6366f1' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Referral Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Referral, reward, coupon and lead stats</p>
      </div>

      {/* Referral */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Referrals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isLoading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <StatCard label="Total Clicks"    value={data?.referrals.totalClicks ?? 0} icon={MousePointerClick} color="bg-blue-500" />
              <StatCard label="Total Referrals" value={data?.referrals.total ?? 0}       icon={Users}             color="bg-indigo-500" />
              <StatCard label="Conversions"     value={data?.referrals.conversions ?? 0} icon={CheckCircle}       color="bg-teal-500" />
            </>
          )}
        </div>
      </section>

      {/* Rewards */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Rewards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <StatCard label="Pending"       value={data?.rewards.pending ?? 0}  icon={Clock}       color="bg-yellow-500" />
              <StatCard label="Approved"      value={data?.rewards.approved ?? 0} icon={CheckCircle} color="bg-green-500" />
              <StatCard label="Paid"          value={data?.rewards.paid ?? 0}     icon={DollarSign}  color="bg-emerald-500" />
              <StatCard label="Total Paid Out"
                value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data?.rewards.totalAmount ?? 0)}
                icon={Gift} color="bg-purple-500" />
            </>
          )}
        </div>
      </section>

      {/* Other */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Other</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoading ? (
            <><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <StatCard label="Active Coupons" value={data?.coupons.active ?? 0} icon={Ticket} color="bg-orange-500" />
              <StatCard label="Referral Leads" value={data?.leads.total ?? 0}    icon={Users}  color="bg-pink-500" />
            </>
          )}
        </div>
      </section>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Rewards by Status</h3>
        {isLoading ? (
          <div className="h-52 bg-gray-50 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
