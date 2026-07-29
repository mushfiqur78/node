'use client';

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
}

export default function Pagination({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 mt-4">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
      >
        Prev
      </button>
      <span className="text-sm text-gray-600">{page} / {pages}</span>
      <button
        disabled={page === pages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
}
