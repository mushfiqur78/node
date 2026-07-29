'use client';

import { useState, useRef } from 'react';
import { CompactPropertyCard, CompactPropertyCardSkeleton } from '@/components/location';
import { useProperties, useLocations } from '@/hooks';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toFullUrl } from '@/lib/utils';
import Link from 'next/link';

/**
 * Location Section Component
 * Explore properties by location with tab-based filtering
 * Now fetches real data from backend API
 * 
 * Features:
 * - Tab navigation for different locations
 * - Horizontal scrollable tabs on mobile
 * - Two-column grid layout on desktop
 * - Compact property cards
 * - Dynamic filtering by location
 * - Real images from backend
 */
export default function LocationSection() {
  // Fetch locations from API
  const { data: locationsData, isLoading: loadingLocations } = useLocations();
  const locations = locationsData?.slice(0, 5) || []; // Take first 5 locations
  
  // Active location state
  const [activeLocation, setActiveLocation] = useState<string>('');
  
  // Set first location as active when data loads
  if (!activeLocation && locations.length > 0) {
    setActiveLocation(locations[0]._id);
  }
  
  // Ref for horizontal scroll
  const tabsRef = useRef<HTMLDivElement>(null);

  // Fetch properties by active location
  const { data, isLoading: loadingProperties } = useProperties({ 
    location: activeLocation,
    limit: 4,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }, {
    enabled: !!activeLocation, // Only fetch when we have a location
  });

  const properties = data?.properties || [];

  // Scroll tabs left/right (for mobile)
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Get active location slug
  const getLocationSlug = (id: string) => locations.find(loc => loc._id === id)?.slug || '';

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Properties by Location
          </h2>
          <p className="text-lg text-gray-600">
            Start your home-finding journey with your area
          </p>
        </div>

        {/* Location Tabs skeleton */}
        {loadingLocations && (
          <div className="flex justify-center gap-3 mb-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-11 w-28 skeleton rounded-lg" />
            ))}
          </div>
        )}

        {/* Location Tabs */}
        {!loadingLocations && locations.length > 0 && (
          <>
            <div className="relative mb-10">
              {/* Scroll Left Button (Mobile) */}
              <button
                onClick={() => scrollTabs('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition lg:hidden"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>

              {/* Tabs Container */}
              <div
                ref={tabsRef}
                className="flex space-x-3 overflow-x-auto scrollbar-hide scroll-smooth px-8 lg:px-0 lg:justify-center"
              >
                {locations.map((location) => (
                  <button
                    key={location._id}
                    onClick={() => setActiveLocation(location._id)}
                    className={`
                      flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap
                      ${
                        activeLocation === location._id
                          ? 'bg-[#005e9e] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {location.name}
                  </button>
                ))}
              </div>

              {/* Scroll Right Button (Mobile) */}
              <button
                onClick={() => scrollTabs('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition lg:hidden"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Skeleton Grid */}
            {loadingProperties && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CompactPropertyCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Property Grid - Two Columns on Desktop */}
            {!loadingProperties && properties.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
                {properties.map((property) => {
                  // Safe access to nested properties
                  const imageUrl = property.featuredImage?.url || '/placeholder.jpg';
                  const typeName = property.type?.name || 'Residential';
                  
                  return (
                    <CompactPropertyCard
                      key={property._id}
                      id={property._id}
                      slug={property.slug}
                      title={property.title}
                      type={typeName as 'Residential' | 'Commercial'}
                      size={`${property.areaSize} sq ft`}
                      beds={property.bedrooms}
                      baths={property.bathrooms}
                      price={
                        property.pricing.totalPrice 
                          ? `BDT ${(property.pricing.totalPrice / 10000000).toFixed(2)} Crore`
                          : property.pricing.rentPerMonth
                          ? `BDT ${property.pricing.rentPerMonth.toLocaleString()}/month`
                          : undefined
                      }
                      image={toFullUrl(imageUrl)}
                    />
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!loadingProperties && properties.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No properties available in {locations.find(l => l._id === activeLocation)?.name} at the moment.
                </p>
              </div>
            )}

            {/* View All Button */}
            {!loadingProperties && properties.length > 0 && (
              <div className="text-center mt-10">
                <Link
                  href={`/locations/${getLocationSlug(activeLocation)}`}
                  className="inline-block px-8 py-3 border-2 border-[#005e9e] text-[#005e9e] font-semibold rounded-lg hover:bg-[#005e9e] hover:text-white transition-all duration-200"
                >
                  View All Properties in {locations.find(l => l._id === activeLocation)?.name}
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
