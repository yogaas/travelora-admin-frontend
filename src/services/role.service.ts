import { api } from "../lib/api";
import { PaginatedResponse, BaseQueryParams } from "../types/api";

export interface Role {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface RolesQueryParams extends BaseQueryParams {
  sort_by?: "name" | "created_at";
}

export interface RoleInput {
  name: string;
}

export const roleService = {
  async getRoles(params: RolesQueryParams): Promise<PaginatedResponse<Role>> {
    const response = await api.get<PaginatedResponse<Role>>("/admin/roles", { params });
    return response.data;
  },

  async getRole(id: string): Promise<{ success: boolean; data: Role; message: string }> {
    const response = await api.get(`/admin/roles/${id}`);
    return response.data;
  },

  async createRole(data: RoleInput): Promise<{ success: boolean; data: Role; message: string }> {
    const response = await api.post("/admin/roles", data);
    return response.data;
  },

  async updateRole(id: string, data: Partial<RoleInput>): Promise<{ success: boolean; data: Role; message: string }> {
    const response = await api.put(`/admin/roles/${id}`, data);
    return response.data;
  },

  async deleteRole(id: string): Promise<{ success: boolean; data: null; message: string }> {
    const response = await api.delete(`/admin/roles/${id}`);
    return response.data;
  }
};
