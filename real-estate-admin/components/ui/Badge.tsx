const variants: Record<string, string> = {
  approved:    'bg-green-100 text-green-700',
  pending:     'bg-yellow-100 text-yellow-700',
  rejected:    'bg-red-100 text-red-700',
  active:      'bg-blue-100 text-blue-700',
  inactive:    'bg-gray-100 text-gray-500',
  owner:       'bg-purple-100 text-purple-700',
  agent:       'bg-orange-100 text-orange-700',
  super_admin: 'bg-red-100 text-red-700',
  marketplace: 'bg-teal-100 text-teal-700',
  admin:       'bg-indigo-100 text-indigo-700',
  published:   'bg-green-100 text-green-700',
  draft:       'bg-gray-100 text-gray-500',
  banner:      'bg-orange-100 text-orange-700',
  slider:      'bg-cyan-100 text-cyan-700',
};

export default function Badge({ label }: { label: string }) {
  const cls = variants[label?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
