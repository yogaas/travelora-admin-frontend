import { api } from "../lib/api";
import { PaginatedResponse } from "../types/api";

export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DestinationsQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: "created_at" | "name" | "slug";
  order?: "asc" | "desc";
  q?: string;
}

export interface DestinationInput {
  name: string;
  slug: string;
  description: string;
  is_featured: boolean;
}

export const destinationService = {
  async getDestinations(params: DestinationsQueryParams): Promise<PaginatedResponse<Destination>> {
    const response = await api.get<PaginatedResponse<Destination>>("/destinations", { params });
    return response.data;
  },

  async getDestination(id: string): Promise<{ success: boolean; data: Destination; message: string }> {
    const response = await api.get(`/destinations/${id}`);
    return response.data;
  },

  async createDestination(data: DestinationInput): Promise<{ success: boolean; data: Destination; message: string }> {
    const response = await api.post("/admin/destinations", data);
    return response.data;
  },

  async updateDestination(id: string, data: Partial<DestinationInput>): Promise<{ success: boolean; data: Destination; message: string }> {
    const response = await api.put(`/admin/destinations/${id}`, data);
    return response.data;
  },

  async deleteDestination(id: string): Promise<{ success: boolean; data: null; message: string }> {
    const response = await api.delete(`/admin/destinations/${id}`);
    return response.data;
  },
};
