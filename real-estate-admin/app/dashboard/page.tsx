'use client';
import { useEffect, useState } from 'react';
import {
  Building2, Users, Clock, CheckCircle, MessageSquare,
  AlertCircle, Store, ShieldCheck, MousePointerClick,
  Gift, Ticket, DollarSign,
} from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '@/lib/api';

interface PropertyStats {
  users:      { total: number; owners: number; agents: number; pendingAgents: number };
  properties: { total: number; pending: number; approved: number; rejected: number; marketplace: number; admin: number };
  enquiries:  { total: number; unread: number };
}

interface ReferralStats {
  referrals: { total: number; totalClicks: number; conversions: number };
  rewards:   { total: number; pending: number; approved: number; paid: number; totalAmount: number };
  coupons:   { total: number; active: number };
  leads:     { total: number };
}

function StatCard({ label, value, icon: Icon, color, sub, loading }: {
  label: string; value: string | number; icon: React.ElementType;
  color: string; sub?: string; loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-24 bg-gray-100 rounded" />
          <div className="h-6 w-16 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4">
      <div className={`${color} p-3 rounded-lg text-white shrink-0`}><Icon size={22} /></div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-6">
      {children}
    </h2>
  );
}

export default function DashboardPage() {
  const [propStats,     setPropStats]     = useState<PropertyStats | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loadingProp,   setLoadingProp]   = useState(true);
  const [loadingRef,    setLoadingRef]    = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setPropStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoadingProp(false));

    api.get('/admin/referral-stats')
      .then(res => setReferralStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoadingRef(false));
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const rewardChartData = [
    { name: 'Pending',  count: referralStats?.rewards.pending  ?? 0, fill: '#f59e0b' },
    { name: 'Approved', count: referralStats?.rewards.approved ?? 0, fill: '#10b981' },
    { name: 'Paid',     count: referralStats?.rewards.paid     ?? 0, fill: '#6366f1' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Overview</h1>
      <p className="text-sm text-gray-400 mb-4">Platform performance at a glance</p>

      {/* ── Properties & Users ─────────────────────────────────── */}
      <SectionTitle>Properties & Users</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard loading={loadingProp} label="Total Users"        value={propStats?.users.total ?? 0}             icon={Users}        color="bg-blue-500"   sub={`${propStats?.users.owners ?? 0} owners`} />
        <StatCard loading={loadingProp} label="Pending Approvals"  value={propStats?.users.pendingAgents ?? 0}     icon={AlertCircle}  color="bg-orange-500" sub="Awaiting approval" />
        <StatCard loading={loadingProp} label="Total Properties"   value={propStats?.properties.total ?? 0}        icon={Building2}    color="bg-purple-500" sub={`${propStats?.properties.marketplace ?? 0} marketplace`} />
        <StatCard loading={loadingProp} label="Pending Properties" value={propStats?.properties.pending ?? 0}      icon={Clock}        color="bg-yellow-500" sub="Awaiting approval" />
        <StatCard loading={loadingProp} label="Approved"           value={propStats?.properties.approved ?? 0}     icon={CheckCircle}  color="bg-green-500"  sub={`${propStats?.properties.rejected ?? 0} rejected`} />
        <StatCard loading={loadingProp} label="Marketplace"        value={propStats?.properties.marketplace ?? 0}  icon={Store}        color="bg-teal-500"   sub="From owners" />
        <StatCard loading={loadingProp} label="Admin Listings"     value={propStats?.properties.admin ?? 0}        icon={ShieldCheck}  color="bg-indigo-500" sub="Direct admin uploads" />
        <StatCard loading={loadingProp} label="Enquiries"          value={propStats?.enquiries.total ?? 0}         icon={MessageSquare}color="bg-pink-500"   sub={`${propStats?.enquiries.unread ?? 0} unread`} />
      </div>

      {/* ── Referral System ────────────────────────────────────── */}
      <SectionTitle>Referral System</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard loading={loadingRef} label="Total Clicks"    value={referralStats?.referrals.totalClicks ?? 0}                                icon={MousePointerClick} color="bg-blue-500"    sub={`${referralStats?.referrals.conversions ?? 0} conversions`} />
        <StatCard loading={loadingRef} label="Pending Rewards" value={referralStats?.rewards.pending ?? 0}                                      icon={Clock}             color="bg-yellow-500"  sub="Awaiting approval" />
        <StatCard loading={loadingRef} label="Paid Out"        value={formatCurrency(referralStats?.rewards.totalAmount ?? 0)}                  icon={DollarSign}        color="bg-emerald-500" sub={`${referralStats?.rewards.paid ?? 0} rewards paid`} />
        <StatCard loading={loadingRef} label="Active Coupons"  value={referralStats?.coupons.active ?? 0}                                       icon={Ticket}            color="bg-orange-500"  sub={`${referralStats?.leads.total ?? 0} referral leads`} />
      </div>

      {/* ── Rewards Chart ───────────────────────────────────────── */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Rewards by Status</h3>
        {loadingRef ? (
          <div className="h-48 bg-gray-50 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rewardChartData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {rewardChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
