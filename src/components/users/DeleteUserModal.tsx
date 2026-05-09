import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { User, userService } from "../../services/user.service";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function DeleteUserModal({ isOpen, onClose, user }: DeleteUserModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (res) => {
      toast.success(res.message || "User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    },
  });

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[24px] shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2 font-poppins">Delete User</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-text-primary">{user.name}</span>? This action cannot be undone and will permanently remove the user from the system.
          </p>
        </div>
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="px-5 py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => deleteMutation.mutate(user.id)}
            disabled={deleteMutation.isPending}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-rose-600/20 transition-colors disabled:opacity-70 flex items-center"
          >
            {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}
