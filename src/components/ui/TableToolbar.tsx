import { Search } from "lucide-react";

interface TableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  perPage: number;
  onPerPageChange: (perPage: number) => void;
  searchPlaceholder?: string;
}

export function TableToolbar({ 
  searchQuery, 
  onSearchChange, 
  perPage, 
  onPerPageChange, 
  searchPlaceholder = "Search..." 
}: TableToolbarProps) {
  return (
    <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="relative w-full sm:w-80">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-blue focus:border-primary-blue transition-colors"
          placeholder={searchPlaceholder}
        />
      </div>
      <div className="flex items-center space-x-3 w-full sm:w-auto">
        <span className="text-sm text-text-secondary">Show</span>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="border border-gray-200 bg-gray-50 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-blue focus:border-primary-blue text-text-primary font-medium"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}
