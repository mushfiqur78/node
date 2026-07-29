'use client';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
}

export default function Table<T extends { _id: string }>({ columns, data, loading }: TableProps<T>) {
  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;
  if (!data.length) return <div className="text-center py-10 text-gray-400">No data found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 font-medium">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row._id} className="hover:bg-gray-50 transition">
              {columns.map((col, i) => (
                <td key={i} className="px-4 py-3 text-gray-700">
                  {typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : String(row[col.accessor] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
