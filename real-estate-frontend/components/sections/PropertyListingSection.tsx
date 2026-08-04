'use client';

import { useState, useMemo } from 'react';
import { PropertyCard, PropertyCardSkeleton } from '@/components/property';
import { useProperties, usePurposes } from '@/hooks';
import { ArrowRight } from 'lucide-react';
import { toFullUrl } from '@/lib/utils';
import { useRouter } from 'next/navigation';

/**
 * Property Listing Section Component
 * Displays a grid of properties with tab filtering
 * Now fetches real data from backend API
 * 
 * Features:
 * - Tab navigation (Buy, Rent)
 * - Responsive grid layout (1/2/3 columns)
 * - Filters properties by purpose
 * - "View More" button
 * - Real images from backend
 */
export default function PropertyListingSection() {
  const router = useRouter();
  const { data: purposes } = usePurposes();
  
  // Find Buy and Rent purpose IDs
  const buyPurpose = useMemo(
  () =>
    purposes?.find((p) =>
      ['buy', 'sell'].includes(p.name.toLowerCase())
    )?._id || '',
  [purposes]
);
  const rentPurpose = useMemo(() => 
    purposes?.find(p => p.name.toLowerCase() === 'rent')?._id || '', 
    [purposes]
  );

  // Active tab state (buy or rent)
  const [activeTab, setActiveTab] = useState<'buy' | 'rent'>('buy');

  // Fetch properties based on active tab
  const purposeId = activeTab === 'buy' ? buyPurpose : rentPurpose;
  const { data, isLoading } = useProperties({ 
    purpose: purposeId,
    limit: 6,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }, {
    enabled: !!purposeId, // Only fetch when we have a purpose ID
  });

  const properties = data?.properties || [];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Exclusive Properties from Our Brokerage
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Properties across key locations, available for buying and renting.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white rounded-xl shadow-md p-1">
            <button
              onClick={() => setActiveTab('buy')}
              className={`
                px-8 py-3 rounded-lg font-semibold transition-all duration-200
                ${
                  activeTab === 'buy'
                    ? 'bg-[#005e9e] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Buy
            </button>
            <button
              onClick={() => setActiveTab('rent')}
              className={`
                px-8 py-3 rounded-lg font-semibold transition-all duration-200
                ${
                  activeTab === 'rent'
                    ? 'bg-[#005e9e] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Rent
            </button>
          </div>
        </div>

        {/* Skeleton Grid */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Property Grid */}
        {!isLoading && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {properties.map((property) => {
              // Safe access to nested properties
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
                  locationSlug={property.location?.slug}
                  locationPurposeId={purposeId}
                  image={toFullUrl(imageUrl)}
                  beds={property.bedrooms}
                  baths={property.bathrooms}
                  area={property.areaSize}
                  type={activeTab}
                />
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && properties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No properties available for {activeTab === 'buy' ? 'buying' : 'renting'} at the moment.
            </p>
          </div>
        )}

        {/* View More Button */}
        {!isLoading && properties.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => router.push(`/properties?purpose=${purposeId}`)}
              className="inline-flex items-center space-x-2 px-8 py-4 border-2 border-[#005e9e] text-[#005e9e] font-semibold rounded-lg hover:bg-[#005e9e] hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span>View More {activeTab === 'buy' ? 'Buy' : 'Rent'} Properties</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
