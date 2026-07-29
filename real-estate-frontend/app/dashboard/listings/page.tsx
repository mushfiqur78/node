'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { toFullUrl } from '@/lib/utils';
import { Plus, Clock, CheckCircle, XCircle, MapPin } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  approved: { label: 'Published', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending:  { label: 'Pending',   color: 'bg-amber-100 text-amber-700',  icon: Clock },
  rejected: { label: 'Rejected',  color: 'bg-red-100 text-red-700',      icon: XCircle },
};

export default function MyListingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-properties'],
    queryFn: async () => {
      const { data } = await api.get('/properties/my?limit=50');
      return data.data.properties as any[];
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">My Listings</h2>
        <Link
          href="/dashboard/listings/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition"
        >
          <Plus size={15} /> Add New
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 skeleton rounded-xl" />)}
        </div>
      ) : !data?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">You have no listings yet.</p>
          <Link href="/dashboard/listings/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005e9e] text-white text-sm font-semibold rounded-lg hover:bg-[#004d84] transition">
            <Plus size={15} /> Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((property: any) => {
            const status = statusConfig[property.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const imageUrl = property.featuredImage?.url;
            return (
              <div key={property._id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 items-start">
                <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {imageUrl
                    ? <img src={toFullUrl(imageUrl)} alt={property.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gray-200" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">{property.title}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${status.color}`}>
                      <StatusIcon size={11} />{status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin size={11} />{property.location?.name || 'N/A'}
                  </div>
                  <p className="text-sm font-bold text-[#005e9e] mt-1">
                    {property.pricing?.totalPrice
                      ? `BDT ${(property.pricing.totalPrice / 10000000).toFixed(2)} Cr`
                      : property.pricing?.rentPerMonth
                      ? `BDT ${property.pricing.rentPerMonth.toLocaleString()}/mo`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
