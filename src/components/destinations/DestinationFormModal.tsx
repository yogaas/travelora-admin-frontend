import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Destination, destinationService, DestinationInput } from "../../services/destination.service";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  is_featured: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

interface DestinationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationToEdit?: Destination | null;
}

export function DestinationFormModal({ isOpen, onClose, destinationToEdit }: DestinationFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!destinationToEdit;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      is_featured: false,
    },
  });

  useEffect(() => {
    if (destinationToEdit && isOpen) {
      reset({
        name: destinationToEdit.name,
        slug: destinationToEdit.slug,
        description: destinationToEdit.description,
        is_featured: destinationToEdit.is_featured,
      });
    } else if (isOpen) {
      reset({
        name: "",
        slug: "",
        description: "",
        is_featured: false,
      });
    }
  }, [destinationToEdit, isOpen, reset]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val);
    if (!isEditing) {
        setValue("slug", generateSlug(val));
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: DestinationInput) => destinationService.createDestination(data),
    onSuccess: (res) => {
      toast.success(res.message || "Destination created successfully!");
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create destination");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<DestinationInput>) => destinationService.updateDestination(destinationToEdit!.id, data),
    onSuccess: (res) => {
      toast.success(res.message || "Destination updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update destination");
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data as DestinationInput);
    }
  };

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[24px] shadow-premium w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="text-lg font-semibold text-text-primary font-poppins">
            {isEditing ? "Edit Destination" : "Add New Destination"}
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
              Destination Name
            </label>
            <input
              id="name"
              {...register("name")}
              onChange={handleNameChange}
              className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                errors.name ? "border-rose-300 ring-rose-200 focus:border-rose-400 focus:ring-rose-200" : "border-gray-200"
              }`}
              placeholder="E.g. Bali, Indonesia"
            />
            {errors.name && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="slug">
              Slug
            </label>
            <input
              id="slug"
              {...register("slug")}
              className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                errors.slug ? "border-rose-300 ring-rose-200 focus:border-rose-400 focus:ring-rose-200" : "border-gray-200"
              }`}
              placeholder="bali-indonesia"
            />
            {errors.slug && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.slug.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              {...register("description")}
              rows={4}
              className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                errors.description ? "border-rose-300 ring-rose-200 focus:border-rose-400 focus:ring-rose-200" : "border-gray-200"
              }`}
              placeholder="Describe this destination..."
            />
             {errors.description && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.description.message}</p>}
          </div>

          <div className="flex items-center mt-4">
            <input
              id="is_featured"
              type="checkbox"
              {...register("is_featured")}
              className="h-4 w-4 text-primary-blue rounded border-gray-300 focus:ring-primary-blue"
            />
            <label htmlFor="is_featured" className="ml-2 block text-sm font-medium text-text-primary">
              Featured Destination
            </label>
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
              {isEditing ? "Save Changes" : "Create Destination"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
