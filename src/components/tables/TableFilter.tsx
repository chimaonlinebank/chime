import React from 'react';
import { Search } from 'lucide-react';

interface TableFilterProps {
  onSearch: (query: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  placeholder?: string;
}

export const TableFilter: React.FC<TableFilterProps> = ({
  onSearch,
  placeholder = 'Search...',
}) => {
  return (
    <div className="flex gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#00b388] focus:outline-none"
        />
      </div>
    </div>
  );
};

export default TableFilter;
