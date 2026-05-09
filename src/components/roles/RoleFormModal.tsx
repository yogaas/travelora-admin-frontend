import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Role, roleService, RoleInput } from "../../services/role.service";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof schema>;

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: Role | null;
}

export function RoleFormModal({ isOpen, onClose, roleToEdit }: RoleFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!roleToEdit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (roleToEdit && isOpen) {
      reset({
        name: roleToEdit.name,
      });
    } else if (isOpen) {
      reset({
        name: "",
      });
    }
  }, [roleToEdit, isOpen, reset]);

  const createMutation = useMutation({
    mutationFn: (data: RoleInput) => roleService.createRole(data),
    onSuccess: (res) => {
      toast.success(res.message || "Role created successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create role");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<RoleInput>) => roleService.updateRole(roleToEdit!.id, data),
    onSuccess: (res) => {
      toast.success(res.message || "Role updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update role");
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[24px] shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="text-lg font-semibold text-text-primary font-poppins">
            {isEditing ? "Edit Role" : "Add New Role"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form id="role-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="name">
                Role Name
              </label>
              <input
                id="name"
                {...register("name")}
                className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                  errors.name ? "border-rose-300 ring-rose-200" : "border-gray-200"
                }`}
                placeholder="e.g. admin"
              />
              {errors.name && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.name.message}</p>}
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-5 py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="role-form"
            disabled={isPending}
            className="px-5 py-2.5 bg-primary-blue hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-70 flex items-center"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Role"}
          </button>
        </div>
      </div>
    </div>
  );
}
