import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onDelete: () => Promise<any>;
  queryKeyToInvalidate: string;
}

export function DeleteModal({ isOpen, onClose, title, description, onDelete, queryKeyToInvalidate }: DeleteModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: onDelete,
    onSuccess: (res: any) => {
      toast.success(res?.message || "Item deleted successfully");
      queryClient.invalidateQueries({ queryKey: [queryKeyToInvalidate] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete item");
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[24px] shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2 font-poppins">{title}</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {description} This action cannot be undone.
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
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-rose-600/20 transition-colors disabled:opacity-70 flex items-center"
          >
            {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
