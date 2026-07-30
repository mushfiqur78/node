import { Suspense } from 'react';
import LocationPageContent from './location-page-content';

interface LocationPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LocationPageContent slug={slug} />
    </Suspense>
  );
}
