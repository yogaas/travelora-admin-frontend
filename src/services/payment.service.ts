import { api } from "../lib/api";
import { PaginatedResponse, BaseQueryParams } from "../types/api";

export interface Payment {
  id: string;
  order_id: string;
  payment_method_id: string;
  amount: number;
  status: string;
  transaction_id: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentsQueryParams extends BaseQueryParams {
  sort_by?: "created_at" | "paid_at" | "amount" | "status" | "transaction_id";
}

export interface PaymentInput {
  order_id: string;
  payment_method_id: string;
  amount: number;
  status: string;
  transaction_id: string;
  paid_at: string | null;
}

export const paymentService = {
  async getPayments(params: PaymentsQueryParams): Promise<PaginatedResponse<Payment>> {
    const response = await api.get<PaginatedResponse<Payment>>("/admin/payments", { params });
    return response.data;
  },

  async getPayment(id: string): Promise<{ success: boolean; data: Payment; message: string }> {
    const response = await api.get(`/admin/payments/${id}`);
    return response.data;
  },

  async createPayment(data: PaymentInput): Promise<{ success: boolean; data: Payment; message: string }> {
    const response = await api.post("/admin/payments", data);
    return response.data;
  },

  async updatePayment(id: string, data: Partial<PaymentInput>): Promise<{ success: boolean; data: Payment; message: string }> {
    const response = await api.put(`/admin/payments/${id}`, data);
    return response.data;
  },

  async deletePayment(id: string): Promise<{ success: boolean; data: null; message: string }> {
    const response = await api.delete(`/admin/payments/${id}`);
    return response.data;
  }
};
