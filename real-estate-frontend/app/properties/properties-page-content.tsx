'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useProperties, usePropertyTypes, useLocations, usePurposes } from '@/hooks';
import { PropertyCard, PropertyCardSkeleton } from '@/components/property';
import { toFullUrl } from '@/lib/utils';
import { Filter, X, Home, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

/**
 * Properties Listing Page Content
 * Shows filtered properties based on search params
 * Also tracks referral clicks when ?ref=CODE is present
 */
export default function PropertiesPageContent() {
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Track referral click if ?ref= param present
  const ref = searchParams.get('ref');
  useEffect(() => {
    if (!ref) return;
    // Fire and forget - don't block UI
    api.post(`/referral/click?ref=${ref}`).catch(() => {});
  }, [ref]);

  // Get search params
  const purpose = searchParams.get('purpose') || '';
  const type = searchParams.get('type') || '';
  const location = searchParams.get('location') || '';

  // Fetch properties with filters
  const { data, isLoading } = useProperties({
    purpose,
    type,
    location,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch filter options
  const { data: propertyTypes } = usePropertyTypes();
  const { data: locations } = useLocations();
  const { data: purposes } = usePurposes();

  const properties = data?.properties || [];
  const total = data?.total || 0;

  // Get names for display
  const getTypeName = (id: string) => propertyTypes?.find(t => t._id === id)?.name || '';
  const getLocationName = (id: string) => locations?.find(l => l._id === id)?.name || '';

  // Resolve active tab from purpose param
  const activePurposeName = purposes?.find(p => p._id === purpose)?.name?.toLowerCase() || '';
  const activeTab = activePurposeName === 'rent' ? 'rent' : activePurposeName === 'sell' ? 'buy' : 'all';

  // Purpose IDs for tab switcher
  const buyPurposeId = purposes?.find(p => p.name.toLowerCase() === 'sell')?._id || '';
  const rentPurposeId = purposes?.find(p => p.name.toLowerCase() === 'rent')?._id || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-[#005e9e] transition"
            >
              <Home size={16} className="mr-1" />
              <span>Home</span>
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Properties</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Properties
                {activeTab !== 'all' && (
                  <span className={`ml-3 px-3 py-1 rounded-full text-sm font-semibold align-middle ${
                    activeTab === 'rent' ? 'bg-[#cce5f5] text-[#004d84]' : 'bg-green-100 text-green-700'
                  }`}>
                    For {activeTab === 'rent' ? 'Rent' : 'Buy'}
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isLoading ? '...' : `${total} ${total === 1 ? 'property' : 'properties'} found`}
              </p>
            </div>

            {/* Buy / Rent tab switcher */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              <Link
                href="/properties"
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All
              </Link>
              <Link
                href={`/properties?purpose=${buyPurposeId}`}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'buy' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Buy
              </Link>
              <Link
                href={`/properties?purpose=${rentPurposeId}`}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'rent' ? 'bg-white shadow text-[#005e9e]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Rent
              </Link>
            </div>

            {/* Back to Home desktop */}
            <Link
              href="/"
              className="hidden md:inline-flex items-center space-x-2 px-5 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
            >
              <Home size={16} />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Active Filters */}
          {(type || location) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {type && (
                <div className="inline-flex items-center space-x-2 bg-[#cce5f5] text-[#003d6b] px-3 py-1 rounded-full text-sm">
                  <span>Type: {getTypeName(type)}</span>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete('type');
                      window.location.href = `/properties?${params.toString()}`;
                    }}
                    className="hover:bg-[#b3d7ed] rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {location && (
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <span>Location: {getLocationName(location)}</span>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete('location');
                      window.location.href = `/properties?${params.toString()}`;
                    }}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className={`${
            showFilters ? 'block' : 'hidden'} md:block
            w-full md:w-64 flex-shrink-0
          `}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

              {/* Purpose Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <select
                  value={purpose}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (e.target.value) {
                      params.set('purpose', e.target.value);
                    } else {
                      params.delete('purpose');
                    }
                    window.location.href = `/properties?${params.toString()}`;
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005e9e] focus:border-transparent"
                >
                  <option value="">All</option>
                  {purposes?.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (e.target.value) {
                      params.set('type', e.target.value);
                    } else {
                      params.delete('type');
                    }
                    window.location.href = `/properties?${params.toString()}`;
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005e9e] focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {propertyTypes?.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (e.target.value) {
                      params.set('location', e.target.value);
                    } else {
                      params.delete('location');
                    }
                    window.location.href = `/properties?${params.toString()}`;
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005e9e] focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {locations?.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {(purpose || type || location) && (
                <button
                  onClick={() => {
                    window.location.href = '/properties';
                  }}
                  className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Properties Grid */}
          <main className="flex-1">
            {/* Skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Properties Grid */}
            {!isLoading && properties.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => {
                  const imageUrl = property.featuredImage?.url || '/placeholder.jpg';
                  const locationName = property.location?.name || 'Unknown';

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
                      location={locationName}
                      image={toFullUrl(imageUrl)}
                      beds={property.bedrooms}
                      baths={property.bathrooms}
                      area={property.areaSize}
                      type={purpose === 'buy' ? 'buy' : 'rent'}
                    />
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && properties.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      window.location.href = '/properties';
                    }}
                    className="inline-flex items-center px-6 py-3 bg-[#005e9e] text-white rounded-lg hover:bg-[#004d84]"
                  >
                    Clear Filters
                  </button>
                  <Link
                    href="/"
                    className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Home size={20} />
                    <span>Back to Home</span>
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
