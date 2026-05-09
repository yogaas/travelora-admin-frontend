import { useState } from "react";
import { useDebounce } from "./useDebounce";

export interface TableState<TSortBy> {
  page: number;
  perPage: number;
  sortBy: TSortBy;
  order: "asc" | "desc";
  searchQuery: string;
  debouncedSearch: string;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setSortBy: (sortBy: TSortBy) => void;
  setOrder: (order: "asc" | "desc") => void;
  setSearchQuery: (query: string) => void;
  handleSort: (column: TSortBy) => void;
}

export function useTableState<TSortBy>(defaultSortBy: TSortBy, defaultOrder: "asc" | "desc" = "desc"): TableState<TSortBy> {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<TSortBy>(defaultSortBy);
  const [order, setOrder] = useState<"asc" | "desc">(defaultOrder);
  const [searchQuery, setSearchQuery] = useState("");
  
  const debouncedSearch = useDebounce(searchQuery, 500);

  const handleSort = (column: TSortBy) => {
    if (sortBy === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setOrder("asc");
    }
    setPage(1); // Reset to first page
  };

  return {
    page,
    perPage,
    sortBy,
    order,
    searchQuery,
    debouncedSearch,
    setPage,
    setPerPage,
    setSortBy,
    setOrder,
    setSearchQuery,
    handleSort
  };
}
