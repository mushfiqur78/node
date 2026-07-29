'use client';

import { useState } from 'react';
import { SearchTabs, SearchForm } from '@/components/hero';
import { CheckCircle, Shield } from 'lucide-react';
import { useSiteStats, useBanners } from '@/hooks';
import { toFullUrl } from '@/lib/utils';

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'rent'>('buy');

  const { data: siteData, isLoading: statsLoading } = useSiteStats();
  const { data: bannerData, isLoading: bannerLoading } = useBanners();

  const banner          = bannerData?.banners?.[0];
  // Only set background after data loads - no fallback URL to avoid flash
  const backgroundImage = banner?.image?.url ? toFullUrl(banner.image.url) : null;

  const mainTitle      = banner?.title || 'Buy, Sell, Rent Property';
  const titleFontSize  = banner?.titleFontSize || '3xl';
  const overlayOpacity = banner?.overlayOpacity ?? 55;
  const overlayStyle   = { backgroundColor: `rgba(0,0,0,${(overlayOpacity / 100).toFixed(2)})` };

  const getFontSizeClasses = (size: string) => {
    const map: Record<string, string> = {
      'sm':  'text-2xl sm:text-3xl lg:text-4xl',
      'lg':  'text-3xl sm:text-4xl lg:text-5xl',
      'xl':  'text-3xl sm:text-4xl lg:text-5xl',
      '2xl': 'text-4xl sm:text-5xl lg:text-6xl',
      '3xl': 'text-4xl sm:text-5xl lg:text-6xl',
      '4xl': 'text-5xl sm:text-6xl lg:text-7xl',
      '5xl': 'text-5xl sm:text-6xl lg:text-7xl',
      '6xl': 'text-6xl sm:text-7xl lg:text-8xl',
    };
    return map[size] || map['3xl'];
  };

  const getIcon = (name: string) => name === 'shield' ? Shield : CheckCircle;

  const getColorClass = (color: string) => ({
    green: 'text-emerald-400', blue: 'text-[#3d8fc4]', yellow: 'text-amber-400',
  }[color] ?? 'text-white/60');

  const getBgColor = (color: string) => ({
    green: 'bg-emerald-400', blue: 'bg-[#3d8fc0]', yellow: 'bg-amber-400',
  }[color] ?? 'bg-white/40');

  const titleParts  = mainTitle.split(' - ');
  const titleMain   = titleParts[0];
  const titleAccent = titleParts[1] ?? null;

  return (
    <section className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: '680px' }}>

      {/* Background - only render once image URL is available */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
      )}

      {/* Dark overlay - dynamic from backend */}
      <div className="absolute inset-0 transition-colors duration-300" style={overlayStyle} />

      {/* Soft tint at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#003d6b]/40 via-transparent to-transparent" />

      {/* -- Main content - perfectly centered -- */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">

        {/* Title */}
        {bannerLoading ? (
          <div className="w-2/3 h-12 bg-white/10 rounded-lg animate-pulse mb-4" />
        ) : (
          <h1 className={`${getFontSizeClasses(titleFontSize)} font-bold text-white leading-tight tracking-tight mb-4`}>
            {titleMain}
            {titleAccent && (
              <>
                {' '}
                <span className="text-[#3d8fc4]">- {titleAccent}</span>
              </>
            )}
          </h1>
        )}

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-10 text-sm text-white/70">
          {statsLoading ? (
            <>
              <div className="h-4 w-36 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-44 bg-white/10 rounded animate-pulse" />
            </>
          ) : (
            siteData?.trustIndicators.filter(i => i.active).map((ind, idx, arr) => {
              const Icon = getIcon(ind.icon);
              return (
                <span key={ind.id} className="flex items-center gap-1.5">
                  <Icon size={15} className={getColorClass(ind.color)} />
                  <span>{ind.text}</span>
                  {idx < arr.length - 1 && (
                    <span className="hidden sm:block w-px h-3.5 bg-white/25 ml-4" />
                  )}
                </span>
              );
            })
          )}
        </div>

        {/* -- Search card -- */}
        <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="p-5 sm:p-6">
            <SearchForm activeTab={activeTab} />
          </div>
        </div>

        {/* Live indicators */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-white/45">
          {!statsLoading && siteData?.liveIndicators.filter(i => i.active).map((ind, idx, arr) => (
            <span key={ind.id} className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${getBgColor(ind.color)} animate-pulse`} />
              {ind.text}
              {idx < arr.length - 1 && (
                <span className="hidden sm:block w-px h-3 bg-white/20 ml-3" />
              )}
            </span>
          ))}
        </div>
      </div>


    </section>
  );
}
