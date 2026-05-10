import { api } from "../lib/api";

export interface PackageTimeline {
  id: string;
  package_id: string;
  day: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PackageTimelineInput {
  package_id: string;
  day: number;
  title: string;
  description: string;
}

export const packageTimelineService = {
  async getTimelinesByPackageId(packageId: string): Promise<{ success: boolean; data: PackageTimeline[]; message: string }> {
    const response = await api.get(`/admin/package-timelines/${packageId}/packages`);
    return response.data;
  },

  async createTimeline(data: PackageTimelineInput): Promise<{ success: boolean; data: PackageTimeline; message: string }> {
    const response = await api.post("/admin/package-timelines", data);
    return response.data;
  },

  async updateTimeline(id: string, data: Partial<PackageTimelineInput>): Promise<{ success: boolean; data: PackageTimeline; message: string }> {
    const response = await api.put(`/admin/package-timelines/${id}`, data);
    return response.data;
  },

  async deleteTimeline(id: string): Promise<{ success: boolean; data: null; message: string }> {
    const response = await api.delete(`/admin/package-timelines/${id}`);
    return response.data;
  }
};
