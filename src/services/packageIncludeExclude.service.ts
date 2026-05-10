import { api } from "../lib/api";

export interface PackageIncludeExclude {
  id: string;
  package_id: string;
  description: string;
  type: "include" | "exclude";
  created_at: string;
  updated_at: string;
}

export interface PackageIncludeExcludeInput {
  package_id: string;
  description: string;
  type: "include" | "exclude";
}

export const packageIncludeExcludeService = {
  async getIncludeExcludesByPackageId(packageId: string): Promise<{ success: boolean; data: PackageIncludeExclude[]; message: string }> {
    const response = await api.get(`/admin/package-include-excludes/${packageId}/packages`);
    return response.data;
  },

  async createIncludeExclude(data: PackageIncludeExcludeInput): Promise<{ success: boolean; data: PackageIncludeExclude; message: string }> {
    const response = await api.post("/admin/package-include-excludes", data);
    return response.data;
  },

  async updateIncludeExclude(id: string, data: Partial<PackageIncludeExcludeInput>): Promise<{ success: boolean; data: PackageIncludeExclude; message: string }> {
    const response = await api.put(`/admin/package-include-excludes/${id}`, data);
    return response.data;
  },

  async deleteIncludeExclude(id: string): Promise<{ success: boolean; data: null; message: string }> {
    const response = await api.delete(`/admin/package-include-excludes/${id}`);
    return response.data;
  }
};
