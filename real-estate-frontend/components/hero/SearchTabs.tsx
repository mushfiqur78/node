'use client';

interface SearchTabsProps {
  activeTab: 'buy' | 'sell' | 'rent';
  onTabChange: (tab: 'buy' | 'sell' | 'rent') => void;
}

const tabs = [
  { id: 'buy'  as const, label: 'Buy'  },
  { id: 'sell' as const, label: 'Sell' },
  { id: 'rent' as const, label: 'Rent' },
];

export default function SearchTabs({ activeTab, onTabChange }: SearchTabsProps) {
  return (
    <div className="flex border-b border-gray-100 bg-gray-50/60">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 py-3.5 text-sm font-semibold transition-all duration-200
              ${isActive
                ? 'text-[#005e9e] border-b-2 border-[#005e9e] bg-white'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:bg-white/70'
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
