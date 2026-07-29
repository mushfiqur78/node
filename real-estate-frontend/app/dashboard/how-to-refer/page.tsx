'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Copy, Share2, Users, TrendingUp, MousePointer } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HowToReferPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-referral-me'],
    queryFn: async () => {
      const { data } = await api.get('/referral/me');   // singular: /referral
      return data.data;
    },
  });

  const refCode = data?.refCode || '';
  // Link format: /properties?ref=CODE — user lands on properties page with referral tracked
  const refLink = refCode && typeof window !== 'undefined'
    ? `${window.location.origin}/properties?ref=${refCode}`
    : '';

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="space-y-5">
      {/* Referral link card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Your Referral Link</h2>
        <p className="text-sm text-gray-500 mb-5">
          Share this link with friends. When they register, you earn rewards.
        </p>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-11 skeleton rounded-xl" />
            <div className="h-11 skeleton rounded-xl" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Referral Code */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Referral Code
              </label>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-[#004d84] tracking-widest">
                  {refCode || '—'}
                </div>
                <button onClick={() => copy(refCode, 'Code')}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-[#3d8fc4] hover:text-[#005e9e] transition flex items-center gap-1.5">
                  <Copy size={14} /> Copy
                </button>
              </div>
            </div>

            {/* Referral Link */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Referral Link
              </label>
              <div className="flex gap-2">
                <input readOnly value={refLink || 'Loading...'}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 truncate" />
                <button onClick={() => copy(refLink, 'Link')}
                  className="px-4 py-2.5 bg-[#005e9e] hover:bg-[#004d84] text-white text-sm font-semibold rounded-xl transition flex items-center gap-1.5">
                  <Copy size={14} /> Copy
                </button>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex gap-2 pt-1">
              <a href={`https://wa.me/?text=${encodeURIComponent(`Check out this real estate platform: ${refLink}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition text-center">
                Share on WhatsApp
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(refLink)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-[#004d84] hover:bg-[#003d6b] text-white text-sm font-semibold rounded-xl transition text-center">
                Share on Facebook
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <MousePointer size={20} className="mx-auto text-[#1a72b0] mb-1" />
            <p className="text-2xl font-bold text-gray-900">{data.totalClicks ?? 0}</p>
            <p className="text-xs text-gray-500">Total Clicks</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <Users size={20} className="mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold text-gray-900">{data.conversions ?? 0}</p>
            <p className="text-xs text-gray-500">Conversions</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <TrendingUp size={20} className="mx-auto text-purple-500 mb-1" />
            <p className="text-2xl font-bold text-gray-900">BDT {(data.totalEarned ?? 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Earned</p>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">How It Works</h3>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Share your link', desc: 'Send your referral link to friends via WhatsApp, Facebook, or email.', color: 'bg-[#005e9e]' },
            { step: '2', title: 'They register',   desc: 'Your friend clicks the link and creates an account on the platform.', color: 'bg-purple-600' },
            { step: '3', title: 'Earn rewards',    desc: 'When they list a property, you automatically earn referral rewards.', color: 'bg-green-600' },
          ].map(({ step, title, desc, color }) => (
            <div key={step} className="flex gap-4">
              <div className={`w-8 h-8 rounded-full ${color} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                {step}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
