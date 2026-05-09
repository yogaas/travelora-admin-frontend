import { api } from "../lib/api";
import { User } from "../store/authStore";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  async getMe(): Promise<User> {
    // Some APIs wrap me in data payload, handling both based on user prompt notes
    const response = await api.post("/auth/me");
    return response.data;
  },

  async logout(): Promise<{ message: string }> {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};
