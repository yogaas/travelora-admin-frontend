import { api } from "../lib/api";
import { PaginatedResponse } from "../types/api";

export interface User {
  id: string;
  role_id: string;
  name: string;
  email: string;
  avatar: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsersQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: "created_at" | "name" | "email";
  order?: "asc" | "desc";
  q?: string;
}

export interface UserInput {
  role_id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  phone_number?: string;
}

export const userService = {
  async getUsers(params: UsersQueryParams): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>("/admin/users", { params });
    return response.data;
  },

  async getUser(id: string): Promise<{ success: boolean; data: User; message: string }> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  async createUser(data: UserInput): Promise<{ success: boolean; data: User; message: string }> {
    const response = await api.post("/admin/users", data);
    return response.data;
  },

  async updateUser(id: string, data: Partial<UserInput>): Promise<{ success: boolean; data: User; message: string }> {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<{ success: boolean; data: null; message: string }> {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};
