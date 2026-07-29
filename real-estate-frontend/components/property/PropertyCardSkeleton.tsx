/**
 * PropertyCardSkeleton
 * Animated placeholder that matches PropertyCard's exact shape
 */
export default function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Image */}
      <div className="h-64 skeleton" />

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Price */}
        <div className="h-7 w-36 skeleton rounded-lg" />
        {/* Title line 1 */}
        <div className="h-4 w-full skeleton rounded" />
        {/* Title line 2 */}
        <div className="h-4 w-3/4 skeleton rounded" />

        {/* Features row */}
        <div className="flex justify-between pt-2 pb-2 border-t border-gray-100">
          <div className="h-4 w-16 skeleton rounded" />
          <div className="h-4 w-16 skeleton rounded" />
          <div className="h-4 w-16 skeleton rounded" />
        </div>

        {/* Button */}
        <div className="h-11 w-full skeleton rounded-lg" />
      </div>
    </div>
  );
}
