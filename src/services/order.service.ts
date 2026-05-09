import { api } from "../lib/api";
import { PaginatedResponse, BaseQueryParams } from "../types/api";

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OrdersQueryParams extends BaseQueryParams {
  sort_by?: "created_at" | "total_amount" | "status";
}

export interface OrderInput {
  user_id: string;
  total_amount: number;
  status: string;
}

export const orderService = {
  async getOrders(params: OrdersQueryParams): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>("/admin/orders", { params });
    return response.data;
  },

  async getOrder(id: string): Promise<{ success: boolean; data: Order; message: string }> {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },

  async createOrder(data: OrderInput): Promise<{ success: boolean; data: Order; message: string }> {
    const response = await api.post("/admin/orders", data);
    return response.data;
  },

  async updateOrder(id: string, data: Partial<OrderInput>): Promise<{ success: boolean; data: Order; message: string }> {
    const response = await api.put(`/admin/orders/${id}`, data);
    return response.data;
  },

  async deleteOrder(id: string): Promise<{ success: boolean; data: null; message: string }> {
    const response = await api.delete(`/admin/orders/${id}`);
    return response.data;
  }
};
