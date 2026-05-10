import { api } from "../lib/api";

export interface PackageImage {
  id: string;
  package_id: string;
  image_url: string;
  is_thumbnail: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackageImageInput {
  package_id: string;
  image_url: string;
  is_thumbnail: boolean;
}

export const packageImageService = {
  async getImagesByPackageId(packageId: string): Promise<{ success: boolean; data: PackageImage[]; message: string }> {
    const response = await api.get(`/admin/package-images/${packageId}/packages`);
    return response.data;
  },

  async createImage(data: PackageImageInput): Promise<{ success: boolean; data: PackageImage; message: string }> {
    const response = await api.post("/admin/package-images", data);
    return response.data;
  },

  async updateImage(id: string, data: Partial<PackageImageInput>): Promise<{ success: boolean; data: PackageImage; message: string }> {
    const response = await api.put(`/admin/package-images/${id}`, data);
    return response.data;
  },

  async deleteImage(id: string): Promise<{ success: boolean; data: null; message: string }> {
    const response = await api.delete(`/admin/package-images/${id}`);
    return response.data;
  }
};
