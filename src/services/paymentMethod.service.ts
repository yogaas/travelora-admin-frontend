import { api } from "../lib/api";
import { PaginatedResponse, BaseQueryParams } from "../types/api";

export interface PaymentMethod {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodsQueryParams extends BaseQueryParams {
  sort_by?: "name" | "created_at";
}

export interface PaymentMethodInput {
  name: string;
}

export const paymentMethodService = {
  async getPaymentMethods(params?: PaymentMethodsQueryParams): Promise<PaginatedResponse<PaymentMethod>> {
    const response = await api.get<PaginatedResponse<PaymentMethod>>("/admin/payment-methods", { params });
    return response.data;
  },

  async getPaymentMethod(id: string): Promise<{ success: boolean; data: PaymentMethod; message: string }> {
    const response = await api.get(`/admin/payment-methods/${id}`);
    return response.data;
  },

  async createPaymentMethod(data: PaymentMethodInput): Promise<{ success: boolean; data: PaymentMethod; message: string }> {
    const response = await api.post("/admin/payment-methods", data);
    return response.data;
  },

  async updatePaymentMethod(id: string, data: Partial<PaymentMethodInput>): Promise<{ success: boolean; data: PaymentMethod; message: string }> {
    const response = await api.put(`/admin/payment-methods/${id}`, data);
    return response.data;
  },

  async deletePaymentMethod(id: string): Promise<{ success: boolean; data: null; message: string }> {
    const response = await api.delete(`/admin/payment-methods/${id}`);
    return response.data;
  }
};
