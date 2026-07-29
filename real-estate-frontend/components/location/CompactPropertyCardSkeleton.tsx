/**
 * CompactPropertyCardSkeleton
 * Matches CompactPropertyCard's horizontal layout
 */
export default function CompactPropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="w-full sm:w-48 h-48 sm:h-36 skeleton flex-shrink-0" />

        {/* Details */}
        <div className="flex-1 p-4 space-y-3">
          <div className="h-5 w-3/4 skeleton rounded" />
          <div className="h-4 w-1/2 skeleton rounded" />
          <div className="flex gap-4">
            <div className="h-4 w-16 skeleton rounded" />
            <div className="h-4 w-16 skeleton rounded" />
          </div>
          <div className="h-5 w-28 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}
