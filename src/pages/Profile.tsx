import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User as UserIcon, Loader2, Save, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

import { Layout } from "../components/Layout";
import { PageHeader } from "../components/ui/PageHeader";
import { userService, UserInput } from "../services/user.service";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone_number: z.string().optional(),
  password: z.string().optional().refine(val => !val || val.length >= 6, {
    message: "Password must be at least 6 characters if provided",
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function Profile() {
  const { user: authStoreUser, setAuth, token } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      // First get current logged in user from /auth/me for fresh ID
      const meResponse = await authService.getMe();
      // meResponse might depend on backend structure. Let's assume it returns { id: ... } directly 
      // or we can use authStoreUser.id directly. But the user asked to use GET /api/v1/admin/users/{id}
      const userId = (meResponse as any).id || (meResponse as any).data?.id || authStoreUser?.id;
      
      if (!userId) throw new Error("No user ID found");

      const res = await userService.getUser(String(userId));
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        phone_number: data.phone_number || "",
        password: "",
      });
    }
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: Partial<UserInput>) => {
      if (!data?.id) throw new Error("No user ID found");
      return userService.updateUser(data.id, values);
    },
    onSuccess: (res) => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      // Update store user
      if (token) {
        setAuth(token, {
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          avatar: res.data.avatar || undefined,
          role: res.data.role_id,
        });
      }
    },
    onError: (error: any) => {
      if (error.response?.data?.data) {
        const validationErrors = error.response.data.data;
        Object.keys(validationErrors).forEach((key) => {
          toast.error(`${key}: ${validationErrors[key][0]}`);
        });
      } else {
        toast.error(error.response?.data?.message || "Failed to update profile");
      }
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    const payload: Partial<UserInput> = {
      name: values.name,
      phone_number: values.phone_number,
    };
    
    if (values.password) {
      payload.password = values.password;
    }

    updateMutation.mutate(payload);
  };

  return (
    <Layout>
      <PageHeader
        title="My Profile"
        description="Manage your personal information and settings."
        icon={UserIcon}
      />

      {isLoading ? (
        <div className="bg-white rounded-[24px] shadow-premium p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-primary-blue animate-spin" />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[24px] shadow-premium border border-gray-50 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-tr from-primary-blue to-blue-400 h-32 relative"></div>
              <div className="px-8 pb-8 pt-0 relative flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md -mt-12 bg-white flex items-center justify-center overflow-hidden mb-4 relative group">
                  {data.avatar ? (
                    <img src={data.avatar} alt={data.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-primary-blue text-2xl font-bold">
                      {data.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-text-primary tracking-tight">{data.name}</h3>
                <p className="text-sm font-medium text-text-secondary mt-1">{data.email}</p>
                
                <div className="w-full mt-6 space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-text-secondary">Role</span>
                    <span className="text-sm font-semibold text-text-primary">{data.role_id || "Admin"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-text-secondary">Phone</span>
                    <span className="text-sm font-semibold text-text-primary">{data.phone_number || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-text-secondary">Joined</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {new Date(data.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[24px] shadow-premium border border-gray-50 p-8">
              <h3 className="text-lg font-bold text-text-primary mb-6">Edit Information</h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="name">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      {...register("name")}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.name ? "border-rose-300 ring-1 ring-rose-200" : "border-gray-200"
                      }`}
                      placeholder="e.g. John Doe"
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={data.email}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed"
                    />
                    <p className="mt-1.5 text-xs text-text-secondary">Email cannot be changed.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="phone_number">
                      Phone Number
                    </label>
                    <input
                      id="phone_number"
                      type="text"
                      {...register("phone_number")}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.phone_number ? "border-rose-300 ring-1 ring-rose-200" : "border-gray-200"
                      }`}
                      placeholder="e.g. 081234567890"
                    />
                    {errors.phone_number && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.phone_number.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="password">
                      New Password (Optional)
                    </label>
                    <input
                      id="password"
                      type="password"
                      {...register("password")}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.password ? "border-rose-300 ring-1 ring-rose-200" : "border-gray-200"
                      }`}
                      placeholder="Leave blank to keep current"
                    />
                    {errors.password && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.password.message}</p>}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-gradient-to-r from-primary-blue to-blue-500 hover:from-blue-600 hover:to-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/50 transition-all flex items-center justify-center transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[24px] shadow-premium p-12 flex justify-center items-center text-rose-500 font-medium">
          Failed to load profile data.
        </div>
      )}
    </Layout>
  );
}
