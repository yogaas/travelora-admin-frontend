import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { User, userService, UserInput } from "../../services/user.service";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  password: z.string().optional(),
  role_id: z.string().min(1, "Role is required"),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

// Hardcode mock roles for now
const ROLES = [
  { id: "e10b1a82-f597-4b72-881c-813c9e6d42db", name: "Super Admin" },
  { id: "d6f51be7-0b1e-4c7b-9c3f-bc91a45bb3a2", name: "Admin" },
  { id: "a43e491c-7f51-4e78-9b8b-967a50781745", name: "User" },
];

export function UserFormModal({ isOpen, onClose, userToEdit }: UserFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!userToEdit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      password: "",
      role_id: ROLES[0].id,
    },
  });

  useEffect(() => {
    if (userToEdit && isOpen) {
      reset({
        name: userToEdit.name,
        email: userToEdit.email,
        phone_number: userToEdit.phone_number || "",
        password: "", // intentionally left blank
        role_id: userToEdit.role_id || ROLES[0].id,
      });
    } else if (isOpen) {
      reset({
        name: "",
        email: "",
        phone_number: "",
        password: "",
        role_id: ROLES[0].id,
      });
    }
  }, [userToEdit, isOpen, reset]);

  const createMutation = useMutation({
    mutationFn: (data: UserInput) => userService.createUser(data),
    onSuccess: (res) => {
      toast.success(res.message || "User created successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create user");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserInput>) => userService.updateUser(userToEdit!.id, data),
    onSuccess: (res) => {
      toast.success(res.message || "User updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update user");
    },
  });

  const onSubmit = (data: UserFormValues) => {
    const payload: Partial<UserInput> = { ...data };
    
    if (isEditing) {
      if (!payload.password) {
        delete payload.password;
      }
      updateMutation.mutate(payload);
    } else {
      if (!data.password) {
        toast.error("Password is required for new users");
        return;
      }
      createMutation.mutate(payload as UserInput);
    }
  };

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[24px] shadow-premium w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="text-lg font-semibold text-text-primary font-poppins">
            {isEditing ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              {...register("name")}
              className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                errors.name ? "border-rose-300 ring-rose-200 focus:border-rose-400 focus:ring-rose-200" : "border-gray-200"
              }`}
              placeholder="John Doe"
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
              {...register("email")}
              className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                errors.email ? "border-rose-300 ring-rose-200 focus:border-rose-400 focus:ring-rose-200" : "border-gray-200"
              }`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="phone_number">
              Phone Number
            </label>
            <input
              id="phone_number"
              {...register("phone_number")}
              className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium border-gray-200`}
              placeholder="+1 234 567 890"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="role_id">
              User Role
            </label>
            <select
              id="role_id"
              {...register("role_id")}
              className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                errors.role_id ? "border-rose-300 ring-rose-200 focus:border-rose-400 focus:ring-rose-200" : "border-gray-200"
              }`}
            >
              {ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.role_id && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.role_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="password">
              {isEditing ? "Password (leave blank to keep current)" : "Password"}
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium border-gray-200`}
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-primary-blue hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-70 flex items-center"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
