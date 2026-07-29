'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Tag, CheckCircle, XCircle, Search, Copy, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

// Format discount value with Tk currency
function formatDiscount(type: string, value: number) {
  if (type === 'percent' || type === 'percentage') return `${value}% OFF`;
  return `Tk ${value.toLocaleString()} OFF`;
}

// Days remaining
function daysLeft(expiryDate: string) {
  const diff = new Date(expiryDate).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Expired';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export default function MyCouponsPage() {
  const [code, setCode]     = useState('');
  const [result, setResult] = useState<any>(null);

  // Fetch public coupons
  const { data: publicCoupons, isLoading } = useQuery({
    queryKey: ['public-coupons'],
    queryFn: async () => {
      const { data } = await api.get('/coupons/public');
      return data.data as any[];
    },
  });

  // Check coupon mutation
  const { mutate: checkCoupon, isPending } = useMutation({
    mutationFn: async (couponCode: string) => {
      const { data } = await api.get(`/coupons/check?code=${couponCode}`);
      return data;
    },
    onSuccess: (data) => {
      setResult({ valid: true, coupon: data.data });
      toast.success('Valid coupon!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Invalid or expired coupon';
      setResult({ valid: false, message: msg });
      toast.error(msg);
    },
  });

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { toast.error('Enter a coupon code'); return; }
    setResult(null);
    checkCoupon(code.trim().toUpperCase());
  };

  const copyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    toast.success(`Code "${c}" copied!`);
  };

  return (
    <div className="space-y-6">

      {/* ── Available Public Coupons ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Available Coupons</h2>
        <p className="text-sm text-gray-500 mb-5">Active coupons you can use right now.</p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2].map(i => <div key={i} className="h-24 skeleton rounded-xl" />)}
          </div>
        ) : !publicCoupons?.length ? (
          <div className="text-center py-8">
            <Tag size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No public coupons available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {publicCoupons.map((coupon: any) => {
              const days = daysLeft(coupon.expiryDate);
              const isExpiringSoon = days !== 'Expired' && parseInt(days) <= 7;
              const remaining = coupon.maxUses > 0 ? coupon.maxUses - coupon.usedCount : null;

              return (
                <div key={coupon._id}
                  className="relative border-2 border-dashed border-[#99cce8] rounded-xl p-4 bg-gradient-to-br from-[#e6f2fa] to-white overflow-hidden">
                  {/* Discount badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-2xl font-extrabold text-[#004d84]">
                        {formatDiscount(coupon.type, coupon.value)}
                      </span>
                    </div>
                    {isExpiringSoon && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                        Expiring soon
                      </span>
                    )}
                  </div>

                  {/* Code row */}
                  <div className="flex items-center justify-between bg-white border border-[#cce5f5] rounded-lg px-3 py-2 mb-3">
                    <span className="font-mono font-bold text-gray-800 tracking-widest text-sm">
                      {coupon.code}
                    </span>
                    <button onClick={() => copyCode(coupon.code)}
                      className="flex items-center gap-1 text-xs text-[#005e9e] hover:text-[#003d6b] transition font-medium">
                      <Copy size={13} /> Copy
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {days}
                    </span>

                    {/* Share buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Use coupon code ${coupon.code} to get ${formatDiscount(coupon.type, coupon.value)} discount!`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition"
                        title="Share on WhatsApp"
                      >
                        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </a>
                      {/* Facebook */}
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}&quote=${encodeURIComponent(`Use coupon ${coupon.code} for ${formatDiscount(coupon.type, coupon.value)} discount!`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="w-6 h-6 rounded-full bg-[#005e9e] hover:bg-[#004d84] flex items-center justify-center transition"
                        title="Share on Facebook"
                      >
                        <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </a>
                      {/* X (Twitter) */}
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Use coupon code ${coupon.code} to get ${formatDiscount(coupon.type, coupon.value)} discount!`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="w-6 h-6 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center transition"
                        title="Share on X"
                      >
                        <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>
                    </div>

                    {remaining !== null && (
                      <span>{remaining} uses left</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Check Coupon ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Check a Coupon</h2>
        <p className="text-sm text-gray-500 mb-5">
          Have a coupon code? Check its validity here.
        </p>

        <form onSubmit={handleCheck} className="flex gap-2">
          <div className="relative flex-1">
            <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. BROKER021"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#005e9e]/20 focus:border-[#3d8fc4] transition uppercase"
            />
          </div>
          <button type="submit" disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#005e9e] hover:bg-[#004d84] text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
            {isPending
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Search size={15} />}
            Check
          </button>
        </form>

        {/* Check result */}
        {result && (
          <div className={`mt-4 p-4 rounded-xl border ${result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            {result.valid && result.coupon ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="font-semibold text-green-800">Valid Coupon!</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Code</span>
                    <span className="font-mono font-bold text-[#004d84] tracking-widest">{result.coupon.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-bold text-green-700 text-base">
                      {formatDiscount(result.coupon.type, result.coupon.value)}
                    </span>
                  </div>
                  {result.coupon.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires</span>
                      <span className="font-medium">{new Date(result.coupon.expiryDate).toLocaleDateString('en-BD')}</span>
                    </div>
                  )}
                  {result.coupon.remaining > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uses remaining</span>
                      <span className="font-medium">{result.coupon.remaining}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle size={18} className="text-red-600" />
                <span className="text-sm font-medium text-red-700">{result.message}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
