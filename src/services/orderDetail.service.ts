import { api } from "../lib/api";
import { PaginatedResponse, BaseQueryParams } from "../types/api";

export interface OrderDetail {
  id: string;
  order_id: string;
  package_id: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface OrderDetailsQueryParams extends BaseQueryParams {
  sort_by?: "created_at" | "price" | "quantity";
}

export interface OrderDetailInput {
  order_id: string;
  package_id: string;
  quantity: number;
  price: number;
}

export const orderDetailService = {
  async getOrderDetails(params: OrderDetailsQueryParams): Promise<PaginatedResponse<OrderDetail>> {
    const response = await api.get<PaginatedResponse<OrderDetail>>("/admin/order-details", { params });
    return response.data;
  },

  async getOrderDetailsByOrderId(orderId: string): Promise<{ success: boolean; data: OrderDetail[]; message: string }> {
    const response = await api.get(`/admin/order-details/${orderId}/orders`);
    return response.data;
  },

  async createOrderDetail(data: OrderDetailInput): Promise<{ success: boolean; data: OrderDetail; message: string }> {
    const response = await api.post("/admin/order-details", data);
    return response.data;
  },

  async updateOrderDetail(id: string, data: Partial<OrderDetailInput>): Promise<{ success: boolean; data: OrderDetail; message: string }> {
    const response = await api.put(`/admin/order-details/${id}`, data);
    return response.data;
  },

  async deleteOrderDetail(id: string): Promise<{ success: boolean; data: null; message: string }> {
    const response = await api.delete(`/admin/order-details/${id}`);
    return response.data;
  }
};
