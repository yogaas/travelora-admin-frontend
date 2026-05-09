import { api } from "../lib/api";
import { PaginatedResponse } from "../types/api";
import { Destination } from "./destination.service";

export interface Package {
  id: string;
  destination_id: string;
  name: string;
  slug: string;
  description: string;
  duration: number;
  price: number;
  start_date: string;
  end_date: string;
  max_participants: number;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
  destination?: Destination;
}

export interface PackagesQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: "created_at" | "start_date" | "end_date" | "price" | "duration" | "name" | "slug";
  order?: "asc" | "desc";
  q?: string;
}

export interface PackageInput {
  destination_id: string;
  name: string;
  slug: string;
  description: string;
  duration: number;
  price: number;
  start_date: string;
  end_date: string;
  max_participants: number;
  is_featured: boolean;
}

export const packageService = {
  async getPackages(params: PackagesQueryParams): Promise<PaginatedResponse<Package>> {
    const response = await api.get<PaginatedResponse<Package>>("/packages", { params });
    return response.data;
  },

  async getPackage(id: string): Promise<{ success: boolean; data: Package; message: string }> {
    const response = await api.get(`/packages/${id}`);
    return response.data;
  },

  async createPackage(data: PackageInput): Promise<{ success: boolean; data: Package; message: string }> {
    const response = await api.post("/admin/packages", data);
    return response.data;
  },

  async updatePackage(id: string, data: Partial<PackageInput>): Promise<{ success: boolean; data: Package; message: string }> {
    const response = await api.put(`/admin/packages/${id}`, data);
    return response.data;
  },

  async deletePackage(id: string): Promise<{ success: boolean; data: null; message: string }> {
    const response = await api.delete(`/admin/packages/${id}`);
    return response.data;
  },
};
