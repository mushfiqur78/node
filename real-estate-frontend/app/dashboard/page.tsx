'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, ListChecks, Clock, CheckCircle } from 'lucide-react';

export default function DashboardOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-properties-stats'],
    queryFn: async () => {
      const { data } = await api.get('/properties/my?limit=100');
      const props = data.data.properties as any[];
      return {
        total:     props.length,
        pending:   props.filter(p => p.status === 'pending').length,
        approved:  props.filter(p => p.status === 'approved').length,
        rejected:  props.filter(p => p.status === 'rejected').length,
      };
    },
  });

  const stats = [
    { label: 'Total Listings', value: data?.total   ?? 0, icon: ListChecks,    color: 'text-[#005e9e]',  bg: 'bg-[#e6f2fa]' },
    { label: 'Pending',        value: data?.pending  ?? 0, icon: Clock,         color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Published',      value: data?.approved ?? 0, icon: CheckCircle,   color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Add New Property button */}
      <div className="flex justify-end">
        <Link
          href="/dashboard/listings/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition"
        >
          <Plus size={16} />
          Add New Property
        </Link>
      </div>

      {/* Overview card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Overview</h2>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 skeleton rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 flex items-center gap-4`}>
                <div className={`${color}`}>
                  <Icon size={28} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-600">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/dashboard/listings',   label: 'View My Listings' },
            { href: '/dashboard/listings/add', label: 'Add Property' },
            { href: '/dashboard/profile',    label: 'Edit Profile' },
            { href: '/dashboard/referrals',  label: 'My Referrals' },
            { href: '/dashboard/earnings',   label: 'Earnings' },
            { href: '/dashboard/coupons',    label: 'My Coupons' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-[#3d8fc4] hover:text-[#005e9e] hover:bg-[#e6f2fa] transition text-center"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
