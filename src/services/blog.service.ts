import { api } from "../lib/api";
import { PaginatedResponse } from "../types/api";

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
}

export interface Blog {
  id: string;
  category_id: string;
  user_id: string;
  title: string;
  slug: string;
  content: string;
  seo_title: string;
  seo_description: string;
  is_published: boolean;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface BlogsQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: "created_at" | "published_at" | "title" | "slug";
  order?: "asc" | "desc";
  q?: string;
}

export interface BlogInput {
  category_id: string;
  user_id: string;
  title: string;
  slug: string;
  content: string;
  seo_title: string;
  seo_description: string;
  is_published: boolean;
  published_at: string;
}

export const blogService = {
  async getBlogs(params: BlogsQueryParams): Promise<PaginatedResponse<Blog>> {
    const response = await api.get<PaginatedResponse<Blog>>("/blogs", { params });
    return response.data;
  },

  async getBlog(id: string): Promise<{ success: boolean; data: Blog; message: string }> {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
  },

  async createBlog(data: BlogInput): Promise<{ success: boolean; data: Blog; message: string }> {
    const response = await api.post("/admin/blogs", data);
    return response.data;
  },

  async updateBlog(id: string, data: Partial<BlogInput>): Promise<{ success: boolean; data: Blog; message: string }> {
    const response = await api.put(`/admin/blogs/${id}`, data);
    return response.data;
  },

  async deleteBlog(id: string): Promise<{ success: boolean; data: null; message: string }> {
    const response = await api.delete(`/admin/blogs/${id}`);
    return response.data;
  }
};
