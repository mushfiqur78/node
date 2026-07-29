'use client';

import { use, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { PropertyCard, PropertyCardSkeleton } from '@/components/property';
import { toFullUrl } from '@/lib/utils';
import { usePurposes } from '@/hooks';
import { Home, ChevronRight, MapPin } from 'lucide-react';

interface LocationPageProps {
  params: Promise<{ slug: string }>;
}

export default function LocationPage({ params }: LocationPageProps) {
  const { slug }      = use(params);
  const searchParams  = useSearchParams();
  const purposeParam  = searchParams.get('purpose') || '';

  // Fetch purposes to resolve names and IDs
  const { data: purposes } = usePurposes();

  // Active tab — derived from URL purpose param
  const activeTab = useMemo(() => {
    if (!purposes || !purposeParam) return 'all';
    const p = purposes.find(p => p._id === purposeParam);
    if (!p) return 'all';
    return p.name.toLowerCase() === 'rent' ? 'rent' : 'buy';
  }, [purposes, purposeParam]);

  // Resolve purpose IDs
  const buyPurposeId  = useMemo(() => purposes?.find(p => p.name.toLowerCase() === 'sell')?._id || '', [purposes]);
  const rentPurposeId = useMemo(() => purposes?.find(p => p.name.toLowerCase() === 'rent')?._id || '', [purposes]);

  // Fetch location details
  const { data: locationData, isLoading: locationLoading } = useQuery({
    queryKey: ['location', slug],
    queryFn: async () => {
      const { data } = await api.get(`/config/public/locations/slug/${slug}`);
      return data.data.location;
    },
  });

  // Fetch properties — filtered by location + purpose
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties', 'location', locationData?._id, purposeParam],
    queryFn: async () => {
      if (!locationData?._id) return null;
      const params = new URLSearchParams();
      params.set('location', locationData._id);
      params.set('limit', '50');
      if (purposeParam) params.set('purpose', purposeParam);
      const { data } = await api.get(`/properties?${params.toString()}`);
      return data.data;
    },
    enabled: !!locationData?._id,
  });

  const properties = propertiesData?.properties || [];
  const total      = propertiesData?.total || 0;

  // Tab label
  const tabLabel = activeTab === 'rent' ? 'Rent' : activeTab === 'buy' ? 'Buy' : 'All';
  const tabColor = activeTab === 'rent'
    ? 'bg-[#005e9e] text-white'
    : activeTab === 'buy'
    ? 'bg-green-600 text-white'
    : 'bg-gray-600 text-white';

  // Loading state — full page skeleton
  if (locationLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2">
            <div className="h-4 w-10 skeleton rounded" />
            <div className="h-4 w-3 skeleton rounded" />
            <div className="h-4 w-20 skeleton rounded" />
            <div className="h-4 w-3 skeleton rounded" />
            <div className="h-4 w-24 skeleton rounded" />
          </div>
        </div>
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 skeleton rounded-full" />
              <div className="h-8 w-64 skeleton rounded-lg" />
            </div>
            <div className="h-4 w-32 skeleton rounded" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!locationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Location not found</h2>
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-[#005e9e] text-white rounded-lg hover:bg-[#004d84]">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="flex items-center text-gray-600 hover:text-[#005e9e]">
              <Home size={16} className="mr-1" />Home
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link href="/properties" className="text-gray-600 hover:text-[#005e9e]">Properties</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">{locationData.name}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Title + badge */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <MapPin size={26} className="text-[#005e9e]" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Properties in {locationData.name}
                </h1>
                {/* Purpose badge — clearly shows Buy or Rent */}
                {activeTab !== 'all' && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${tabColor}`}>
                    {tabLabel}
                  </span>
                )}
              </div>
              {locationData.city && (
                <p className="text-sm text-gray-500 ml-9">{locationData.city}</p>
              )}
              <p className="text-sm text-gray-500 ml-9 mt-0.5">
                {propertiesLoading ? '...' : `${total} ${total === 1 ? 'property' : 'properties'} found`}
              </p>
            </div>

            {/* Buy / Rent switcher */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              <Link
                href={`/locations/${slug}`}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All
              </Link>
              <Link
                href={`/locations/${slug}?purpose=${buyPurposeId}`}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'buy' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Buy
              </Link>
              <Link
                href={`/locations/${slug}?purpose=${rentPurposeId}`}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'rent' ? 'bg-white shadow text-[#005e9e]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Rent
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {propertiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {activeTab !== 'all' ? tabLabel : ''} properties found in {locationData.name}
            </h3>
            <p className="text-gray-600 mb-6">Try switching to a different category</p>
            <Link
              href={`/locations/${slug}`}
              className="inline-flex items-center px-6 py-3 bg-[#005e9e] text-white rounded-lg hover:bg-[#004d84]"
            >
              View All Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => {
              const imageUrl = property.featuredImage?.url || '/placeholder.jpg';
              return (
                <PropertyCard
                  key={property._id}
                  id={property._id}
                  slug={property.slug}
                  title={property.title}
                  price={
                    property.pricing.totalPrice
                      ? `BDT ${(property.pricing.totalPrice / 10000000).toFixed(2)} Crore`
                      : property.pricing.rentPerMonth
                      ? `BDT ${property.pricing.rentPerMonth.toLocaleString()}/month`
                      : 'Price on request'
                  }
                  location={locationData.name}
                  locationSlug={slug}
                  image={toFullUrl(imageUrl)}
                  beds={property.bedrooms}
                  baths={property.bathrooms}
                  area={property.areaSize}
                  type={activeTab === 'rent' ? 'rent' : 'buy'}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
