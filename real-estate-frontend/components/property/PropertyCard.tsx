'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bed, Bath, Maximize, MapPin, MessageCircle } from 'lucide-react';

export interface PropertyCardProps {
  id: string;
  slug?: string;
  title: string;
  price: string;
  location: string;
  locationSlug?: string;
  locationPurposeId?: string;
  image: string;
  beds?: number;
  baths?: number;
  area?: number;
  type: 'buy' | 'rent';
}

export default function PropertyCard({
  id,
  slug,
  title,
  price,
  location,
  locationSlug,
  locationPurposeId,
  image,
  beds,
  baths,
  area,
}: PropertyCardProps) {
  const router = useRouter();
  const detailUrl = slug ? `/properties/${slug}` : `/properties/${id}`;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneNumber = '8801234567890';
    const message = encodeURIComponent(`Hi, I'm interested in: ${title}`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div
      onClick={() => router.push(detailUrl)}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-gray-200">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Location Badge — independent link, stops card navigation */}
        <div className="absolute top-4 left-4">
          {locationSlug ? (
            <Link
              href={`/locations/${locationSlug}${locationPurposeId ? `?purpose=${locationPurposeId}` : ''}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg hover:bg-[#005e9e] hover:text-white transition-colors duration-200 group/badge"
            >
              <MapPin size={14} className="text-[#005e9e] group-hover/badge:text-white" />
              <span className="text-sm font-semibold text-gray-900 group-hover/badge:text-white">{location}</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
              <MapPin size={14} className="text-[#005e9e]" />
              <span className="text-sm font-semibold text-gray-900">{location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        <p className="text-2xl font-bold text-[#005e9e] mb-3">{price}</p>

        <h3 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2 min-h-[3.5rem]">
          {title}
        </h3>

        {(beds !== undefined || baths !== undefined || area !== undefined) && (
          <div className="flex items-center justify-between text-gray-600 mb-4 pb-4 border-b border-gray-100">
            {beds !== undefined && (
              <div className="flex items-center space-x-1.5">
                <Bed size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{beds} Beds</span>
              </div>
            )}
            {baths !== undefined && (
              <div className="flex items-center space-x-1.5">
                <Bath size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{baths} Baths</span>
              </div>
            )}
            {area !== undefined && (
              <div className="flex items-center space-x-1.5">
                <Maximize size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{area} sqft</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleWhatsAppClick}
          className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
        >
          <MessageCircle size={20} />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
}
