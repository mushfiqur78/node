'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toFullUrl } from '@/lib/utils';
import {
  LayoutDashboard, ListChecks, User, Share2,
  Users, DollarSign, Tag, LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard',            label: 'Overview',          icon: LayoutDashboard },
  { href: '/dashboard/listings',   label: 'My Listings',       icon: ListChecks },
  { href: '/dashboard/profile',    label: 'Profile',           icon: User },
  { href: '/dashboard/how-to-refer', label: 'How to Refer',    icon: Share2 },
  { href: '/dashboard/referrals',  label: 'My Referrals',      icon: Users },
  { href: '/dashboard/earnings',   label: 'Referral Earnings', icon: DollarSign },
  { href: '/dashboard/coupons',    label: 'My Coupons',        icon: Tag },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    router.push('/');
  };

  return (
    <aside className="w-full md:w-60 flex-shrink-0">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* User info */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
              {user?.avatar ? (
                <img src={toFullUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#005e9e] flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
              <p className="text-xs text-[#005e9e] truncate max-w-[180px]">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#005e9e]' : 'text-gray-400'} />
                {label}
              </Link>
            );
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );
}
