export interface PaginatedMeta {
  sort_by?: string;
  order?: string;
  q?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    current_page: number;
    data: T[];
    first_page_url?: string;
    from: number;
    last_page: number;
    last_page_url?: string;
    links?: any[];
    next_page_url?: string | null;
    path?: string;
    per_page: number;
    prev_page_url?: string | null;
    to: number;
    total: number;
    meta?: PaginatedMeta;
  };
  message: string;
}

export interface BaseQueryParams {
  page?: number;
  per_page?: number;
  order?: "asc" | "desc";
  q?: string;
}
