import { useState, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface PaginationInfo {
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
}

interface CommonTableProps {
  isLoading: boolean;
  isError: boolean;
  items: any[];
  pagination: PaginationInfo | undefined;
  onPageChange: (page: number) => void;
  children: ReactNode;
}

export function CommonTable({ 
  isLoading, 
  isError, 
  items, 
  pagination, 
  onPageChange, 
  children
}: CommonTableProps) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {children}
        </table>
        
        {isLoading && (
          <div className="py-12 flex justify-center w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
          </div>
        )}
        
        {!isLoading && isError && (
          <div className="py-12 text-center text-rose-500 font-medium">
            Failed to fetch data
          </div>
        )}
        
        {!isLoading && !isError && items.length === 0 && (
          <div className="py-12 text-center text-text-secondary">
            No items found. Try a different search.
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="p-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between mt-auto">
          <p className="text-sm text-text-secondary">
            Showing <span className="font-semibold text-text-primary">{pagination.from || 0}</span> to <span className="font-semibold text-text-primary">{pagination.to || 0}</span> of <span className="font-semibold text-text-primary">{pagination.total}</span> entries
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(Math.max(1, pagination.current_page - 1))}
              disabled={pagination.current_page === 1}
              className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white hover:text-primary-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-gray-50 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex space-x-1 hidden sm:flex">
                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                  let pageNum = i + 1;
                  if (pagination.last_page > 5) {
                    if (pagination.current_page > 3) {
                      pageNum = pagination.current_page - 2 + i;
                    }
                    if (pageNum > pagination.last_page) {
                      pageNum = pagination.last_page - (4 - i);
                    }
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                        pagination.current_page === pageNum
                          ? "bg-primary-blue text-white shadow-sm shadow-primary-blue/30"
                          : "text-text-secondary hover:bg-white hover:text-primary-blue border border-transparent hover:border-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
            </div>

            <button
              onClick={() => onPageChange(Math.min(pagination.last_page, pagination.current_page + 1))}
              disabled={pagination.current_page === pagination.last_page}
              className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white hover:text-primary-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-gray-50 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
