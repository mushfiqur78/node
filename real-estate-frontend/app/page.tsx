import dynamic from 'next/dynamic';
import MainLayout from '@/components/layout/MainLayout';
import HeroSection from '@/components/sections/HeroSection';

// Lazy load sections below the fold for better initial load performance
const PropertyListingSection = dynamic(() => import('@/components/sections/PropertyListingSection'), {
  loading: () => <div className="py-16 bg-gray-50"><div className="max-w-7xl mx-auto px-4 text-center"><div className="h-8 w-64 bg-gray-200 rounded mx-auto animate-pulse" /></div></div>,
});

const LocationSection = dynamic(() => import('@/components/sections/LocationSection'), {
  loading: () => <div className="py-16 bg-white"><div className="max-w-7xl mx-auto px-4 text-center"><div className="h-8 w-64 bg-gray-200 rounded mx-auto animate-pulse" /></div></div>,
});

const CTASection = dynamic(() => import('@/components/sections/CTASection'));

const NewsletterSection = dynamic(() => import('@/components/sections/NewsletterSection'));

/**
 * Homepage Component
 * Main landing page with all sections
 * 
 * Structure:
 * - Hero Section (search + background) - Loaded immediately
 * - Property Listings (featured properties grid) - Lazy loaded
 * - Location Explorer (tabs with location cards) - Lazy loaded
 * - CTA Section (call-to-action with stats) - Lazy loaded
 * - Newsletter (email subscription) - Lazy loaded
 * 
 * Performance Optimizations:
 * - Hero section loads immediately (above the fold)
 * - Other sections lazy load as user scrolls
 * - Reduces initial bundle size and API calls
 */
export default function HomePage() {
  return (
    <MainLayout>
      {/* Hero Section with Search - Critical, loads immediately */}
      <HeroSection />

      {/* Featured Properties Grid - Lazy loaded */}
      <PropertyListingSection />

      {/* Explore by Location - Lazy loaded */}
      <LocationSection />

      {/* Call to Action - Lazy loaded */}
      <CTASection />

      {/* Newsletter Subscription - Lazy loaded */}
      <NewsletterSection />
    </MainLayout>
  );
}
