import { api } from "../lib/api";
import { PaginatedResponse, BaseQueryParams } from "../types/api";

export interface Review {
  id: string;
  user_id: string;
  package_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewInput {
  user_id: string;
  package_id: string;
  rating: number;
  comment: string;
}

export interface ReviewsQueryParams extends BaseQueryParams {
  sort_by?: "created_at" | "rating";
}

export const reviewService = {
  async getReviews(params?: ReviewsQueryParams): Promise<PaginatedResponse<Review>> {
    const response = await api.get<PaginatedResponse<Review>>("/reviews", { params });
    return response.data;
  },

  async getReview(id: string): Promise<{ success: boolean; data: Review; message: string }> {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },

  async getReviewsByPackageId(packageId: string): Promise<{ success: boolean; data: Review[]; message: string }> {
    const response = await api.get(`/admin/reviews/${packageId}/packages`);
    return response.data;
  },

  async createReview(data: ReviewInput): Promise<{ success: boolean; data: Review; message: string }> {
    const response = await api.post("/admin/reviews", data);
    return response.data;
  },

  async updateReview(id: string, data: Partial<ReviewInput>): Promise<{ success: boolean; data: Review; message: string }> {
    const response = await api.put(`/admin/reviews/${id}`, data);
    return response.data;
  },

  async deleteReview(id: string): Promise<{ success: boolean; data: null; message: string }> {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
  }
};
