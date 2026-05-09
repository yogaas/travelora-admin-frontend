import { api } from "../lib/api";
import { PaginatedResponse, BaseQueryParams } from "../types/api";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface BlogCategoriesQueryParams extends BaseQueryParams {
  sort_by?: "name" | "slug" | "created_at";
}

export interface BlogCategoryInput {
  name: string;
  slug: string;
}

export const blogCategoryService = {
  async getCategories(params: BlogCategoriesQueryParams): Promise<PaginatedResponse<BlogCategory>> {
    const response = await api.get<PaginatedResponse<BlogCategory>>("/blog-categories", { params });
    return response.data;
  },

  async getCategory(id: string): Promise<{ success: boolean; data: BlogCategory; message: string }> {
    const response = await api.get(`/blog-categories/${id}`);
    return response.data;
  },

  async createCategory(data: BlogCategoryInput): Promise<{ success: boolean; data: BlogCategory; message: string }> {
    const response = await api.post("/admin/blog-categories", data);
    return response.data;
  },

  async updateCategory(id: string, data: Partial<BlogCategoryInput>): Promise<{ success: boolean; data: BlogCategory; message: string }> {
    const response = await api.put(`/admin/blog-categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string): Promise<{ success: boolean; data: null; message: string }> {
    const response = await api.delete(`/admin/blog-categories/${id}`);
    return response.data;
  }
};
