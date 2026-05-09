import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useTableState } from "../../hooks/useTableState";
import { CommonTable } from "./CommonTable";
import { TableSortHeader } from "./TableSortHeader";
import { TableToolbar } from "./TableToolbar";
import { PaginatedResponse } from "../../types/api";

export type ColumnDef<T> = {
  header: string;
  accessor: keyof T | string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
};

interface LookupModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  title: string;
  queryKey: string;
  queryFn: (params: any) => Promise<PaginatedResponse<T>>;
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  defaultSortBy?: string;
}

export function LookupModal<T extends { id: string }>({
  isOpen,
  onClose,
  onSelect,
  title,
  queryKey,
  queryFn,
  columns,
  searchPlaceholder = "Search...",
  defaultSortBy = "created_at"
}: LookupModalProps<T>) {
  const tableState = useTableState<string>(defaultSortBy, "desc");

  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKey, "lookup", { 
      page: tableState.page, 
      per_page: tableState.perPage, 
      sort_by: tableState.sortBy, 
      order: tableState.order, 
      q: tableState.debouncedSearch 
    }],
    queryFn: () => queryFn({
      page: tableState.page,
      per_page: tableState.perPage,
      sort_by: tableState.sortBy,
      order: tableState.order,
      ...(tableState.debouncedSearch ? { q: tableState.debouncedSearch } : {})
    }),
    enabled: isOpen,
    placeholderData: (prev) => prev,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm overflow-y-auto custom-scrollbar flex items-start justify-center p-4 md:p-8">
      <div className="bg-white rounded-[24px] shadow-premium w-full max-w-4xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 shrink-0">
          <h2 className="text-lg font-semibold text-text-primary font-poppins">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col">
          <TableToolbar
            searchQuery={tableState.searchQuery}
            onSearchChange={tableState.setSearchQuery}
            perPage={tableState.perPage}
            onPerPageChange={tableState.setPerPage}
            searchPlaceholder={searchPlaceholder}
          />
          <div className="w-full relative bg-white pb-2 rounded-b-[24px]">
            <CommonTable
              isLoading={isLoading}
              isError={isError}
              items={data?.data?.data || []}
              pagination={data?.data ? {
                current_page: data.data.current_page,
                last_page: data.data.last_page,
                from: data.data.from,
                to: data.data.to,
                total: data.data.total
              } : undefined}
              onPageChange={tableState.setPage}
            >
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col, idx) => (
                    col.sortable ? (
                      <TableSortHeader
                        key={idx}
                        label={col.header}
                        column={String(col.accessor)}
                        currentSort={tableState.sortBy}
                        currentOrder={tableState.order}
                        onSort={tableState.handleSort}
                      />
                    ) : (
                      <th key={idx} className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        {col.header}
                      </th>
                    )
                  ))}
                  <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {data?.data?.data?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    {columns.map((col, idx) => (
                      <td key={idx} className="py-4 px-6 font-medium text-text-secondary">
                        {col.render ? col.render(item) : String(item[col.accessor as keyof T] || "-")}
                      </td>
                    ))}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          onSelect(item);
                          onClose();
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-primary-blue hover:text-white text-primary-blue text-xs font-semibold rounded-lg transition-colors border border-transparent shadow-sm"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </CommonTable>
          </div>
        </div>
      </div>
    </div>
  );
}
