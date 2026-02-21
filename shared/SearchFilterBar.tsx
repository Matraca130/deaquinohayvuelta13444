// ============================================================
// Axon — SearchFilterBar (reusable search + filter bar)
//
// IMPORT: import { SearchFilterBar } from '@/app/components/shared/SearchFilterBar';
//
// Usage:
//   <SearchFilterBar
//     searchValue={query}
//     onSearchChange={setQuery}
//     searchPlaceholder="Buscar miembros..."
//     filters={<Select .../>}
//   />
// ============================================================

import React from 'react';
import { Input } from '@/app/components/ui/input';
import { Search } from 'lucide-react';

interface SearchFilterBarProps {
  /** Current search value */
  searchValue: string;
  /** Search change handler */
  onSearchChange: (value: string) => void;
  /** Placeholder text (default: "Buscar...") */
  searchPlaceholder?: string;
  /** Optional filter components (Select dropdowns, etc.) rendered on the right */
  filters?: React.ReactNode;
  /** Extra className */
  className?: string;
}

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters,
  className = '',
}: SearchFilterBarProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {/* Search input */}
      <div className="relative flex-1 max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Filters */}
      {filters && (
        <div className="flex items-center gap-2">
          {filters}
        </div>
      )}
    </div>
  );
}
