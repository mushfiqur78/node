'use client';

import { useState, useMemo } from 'react';
import { Search, MapPin, LayoutGrid, ChevronDown } from 'lucide-react';
import { usePropertyTypes, useLocations, usePurposes } from '@/hooks';
import { useRouter } from 'next/navigation';

interface SearchFormProps {
  activeTab: 'buy' | 'sell' | 'rent';
}

function SelectField({
  icon: Icon,
  value,
  onChange,
  disabled,
  placeholder,
  children,
}: {
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Icon
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="
          w-full pl-10 pr-8 py-3 rounded-xl border border-gray-200
          bg-white text-gray-700 text-sm
          appearance-none outline-none cursor-pointer
          focus:ring-2 focus:ring-[#005e9e]/20 focus:border-[#3d8fc4]
          hover:border-gray-300
          transition-all duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <option value="">{disabled ? 'Loading...' : placeholder}</option>
        {children}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

export default function SearchForm({ activeTab }: SearchFormProps) {
  const router = useRouter();
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation]         = useState('');

  const { data: propertyTypes, isLoading: loadingTypes }     = usePropertyTypes();
  const { data: locations,     isLoading: loadingLocations } = useLocations();
  const { data: purposes }                                    = usePurposes();

  const purposeId = useMemo(() => {
    if (!purposes) return '';
    const map: Record<string, string> = { buy: 'sell', sell: 'sell', rent: 'rent' };
    return purposes.find(p => p.name.toLowerCase() === map[activeTab])?._id || '';
  }, [purposes, activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (purposeId)    params.set('purpose',  purposeId);
    if (propertyType) params.set('type',     propertyType);
    if (location)     params.set('location', location);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch}>
      {/* Desktop: all in one row */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex-1">
          <SelectField
            icon={LayoutGrid}
            value={propertyType}
            onChange={setPropertyType}
            disabled={loadingTypes}
            placeholder="Property Type"
          >
            {propertyTypes?.map(t => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </SelectField>
        </div>

        <div className="flex-1">
          <SelectField
            icon={MapPin}
            value={location}
            onChange={setLocation}
            disabled={loadingLocations}
            placeholder="Location"
          >
            {locations?.map(l => (
              <option key={l._id} value={l._id}>{l.name}</option>
            ))}
          </SelectField>
        </div>

        <button
          type="submit"
          className="
            flex items-center gap-2 px-6 py-3 rounded-xl
            bg-[#005e9e] hover:bg-[#004d84]
            text-white text-sm font-semibold
            shadow-md shadow-[#005e9e]/25
            hover:shadow-lg hover:shadow-[#005e9e]/30
            transition-all duration-200
            whitespace-nowrap
          "
        >
          <Search size={16} strokeWidth={2.5} />
          Search Property
        </button>
      </div>

      {/* Mobile: stacked */}
      <div className="md:hidden space-y-3">
        <SelectField
          icon={LayoutGrid}
          value={propertyType}
          onChange={setPropertyType}
          disabled={loadingTypes}
          placeholder="Property Type"
        >
          {propertyTypes?.map(t => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </SelectField>

        <SelectField
          icon={MapPin}
          value={location}
          onChange={setLocation}
          disabled={loadingLocations}
          placeholder="Location"
        >
          {locations?.map(l => (
            <option key={l._id} value={l._id}>{l.name}</option>
          ))}
        </SelectField>

        <button
          type="submit"
          className="
            w-full flex items-center justify-center gap-2
            py-3 rounded-xl bg-[#005e9e] hover:bg-[#004d84]
            text-white text-sm font-semibold
            shadow-md shadow-[#005e9e]/25
            transition-all duration-200
          "
        >
          <Search size={16} strokeWidth={2.5} />
          Search Property
        </button>
      </div>
    </form>
  );
}
