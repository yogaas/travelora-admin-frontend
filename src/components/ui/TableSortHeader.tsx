import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export function TableSortHeader({ 
  label, 
  column, 
  currentSort, 
  currentOrder, 
  onSort 
}: { 
  label: string, 
  column: string, 
  currentSort: string, 
  currentOrder: string, 
  onSort: (column: string) => void 
}) {
  return (
    <th 
      className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer group"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center">
        {label}
        {currentSort !== column ? (
          <ArrowUpDown className="w-4 h-4 ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />
        ) : currentOrder === "asc" ? (
          <ArrowUp className="w-4 h-4 ml-1 text-primary-blue" />
        ) : (
          <ArrowDown className="w-4 h-4 ml-1 text-primary-blue" />
        )}
      </div>
    </th>
  );
}
