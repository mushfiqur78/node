'use client';

interface Feature { 
  _id: string; 
  name: string; 
  category?: string; // Make category optional
}

interface FeatureSelectorProps {
  label:    string;
  category: 'primary' | 'amenity' | 'other';
  features: Feature[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export default function FeatureSelector({ label, category, features, selected, onChange }: FeatureSelectorProps) {
  const filtered = features.filter(f => f.category === category);
  if (!filtered.length) return null;

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {filtered.map(f => (
          <button
            key={f._id}
            type="button"
            onClick={() => toggle(f._id)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              selected.includes(f._id)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>
    </div>
  );
}
