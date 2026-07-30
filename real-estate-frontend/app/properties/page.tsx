import { Suspense } from 'react';
import PropertiesPageContent from './properties-page-content';

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" /> }>
      <PropertiesPageContent />
    </Suspense>
  );
}
