import Link from 'next/link';
import { Bed, Bath, Maximize, Building2, Home } from 'lucide-react';

/**
 * CompactPropertyCard Component
 * Horizontal card layout for location-based property browsing
 * 
 * Features:
 * - Thumbnail image on left
 * - Property details on right
 * - Compact horizontal layout
 * - Property type badge
 * - Hover effect
 * - Links to property detail page
 */

export interface CompactPropertyCardProps {
  id: string;
  slug?: string;
  title: string;
  type: 'Residential' | 'Commercial';
  size: string;
  beds?: number;
  baths?: number;
  price?: string;
  image: string;
}

export default function CompactPropertyCard({
  id,
  slug,
  title,
  type,
  size,
  beds,
  baths,
  price,
  image,
}: CompactPropertyCardProps) {
  // Generate detail page URL
  const detailUrl = slug ? `/properties/${slug}` : `/properties/${id}`;

  return (
    <Link href={detailUrl}>
      <div className="bg-white rounded-xl border border-gray-200 hover:border-[#7ab8d9] hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail Image - Left Side */}
        <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Property Type Badge */}
          <div className="absolute top-3 left-3">
            <div className={`
              flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold
              ${type === 'Residential' 
                ? 'bg-[#1a72b0] text-white' 
                : 'bg-purple-500 text-white'
              }
            `}>
              {type === 'Residential' ? (
                <Home size={12} />
              ) : (
                <Building2 size={12} />
              )}
              <span>{type}</span>
            </div>
          </div>
        </div>

        {/* Property Details - Right Side */}
        <div className="flex-1 p-4 sm:p-5">
          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#005e9e] transition-colors">
            {title}
          </h3>

          {/* Size */}
          <div className="flex items-center text-gray-600 mb-3">
            <Maximize size={16} className="mr-1.5 text-gray-400" />
            <span className="text-sm font-medium">{size}</span>
          </div>

          {/* Features - Beds & Baths */}
          <div className="flex items-center space-x-4 mb-3">
            {beds !== undefined && beds > 0 && (
              <div className="flex items-center text-gray-600">
                <Bed size={16} className="mr-1.5 text-gray-400" />
                <span className="text-sm">{beds} Beds</span>
              </div>
            )}
            {baths !== undefined && baths > 0 && (
              <div className="flex items-center text-gray-600">
                <Bath size={16} className="mr-1.5 text-gray-400" />
                <span className="text-sm">{baths} Baths</span>
              </div>
            )}
          </div>

          {/* Price */}
          {price && (
            <div className="text-lg font-bold text-[#005e9e]">
              {price}
            </div>
          )}
        </div>
      </div>
      </div>
    </Link>
  );
}
