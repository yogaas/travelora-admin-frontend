import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { Package, packageService, PackageInput } from "../../services/package.service";
import { destinationService, Destination } from "../../services/destination.service";
import { LookupModal } from "../ui/LookupModal";

const schema = z.object({
  destination_id: z.string().min(1, "Destination is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  max_participants: z.coerce.number().min(1, "Must have at least 1 participant"),
  is_featured: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageToEdit?: Package | null;
}

export function PackageFormModal({ isOpen, onClose, packageToEdit }: PackageFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!packageToEdit;

  const [isDestinationLookupOpen, setIsDestinationLookupOpen] = useState(false);
  const [selectedDestinationName, setSelectedDestinationName] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      destination_id: "",
      name: "",
      slug: "",
      description: "",
      duration: 3,
      price: 0,
      start_date: "",
      end_date: "",
      max_participants: 10,
      is_featured: false,
    },
  });

  useEffect(() => {
    if (packageToEdit && isOpen) {
      reset({
        destination_id: packageToEdit.destination_id,
        name: packageToEdit.name,
        slug: packageToEdit.slug,
        description: packageToEdit.description,
        duration: packageToEdit.duration,
        price: packageToEdit.price,
        start_date: packageToEdit.start_date.split('T')[0], // format logic if it includes time
        end_date: packageToEdit.end_date.split('T')[0],
        max_participants: packageToEdit.max_participants,
        is_featured: packageToEdit.is_featured,
      });
      setSelectedDestinationName(packageToEdit.destination?.name || packageToEdit.destination_id);
    } else if (isOpen) {
      reset({
        destination_id: "",
        name: "",
        slug: "",
        description: "",
        duration: 3,
        price: 0,
        start_date: "",
        end_date: "",
        max_participants: 10,
        is_featured: false,
      });
      setSelectedDestinationName("");
    }
  }, [packageToEdit, isOpen, reset]);

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
    mutationFn: (data: PackageInput) => packageService.createPackage(data),
    onSuccess: (res) => {
      toast.success(res.message || "Package created successfully!");
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create package");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<PackageInput>) => packageService.updatePackage(packageToEdit!.id, data),
    onSuccess: (res) => {
      toast.success(res.message || "Package updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update package");
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data as PackageInput);
    }
  };

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[24px] shadow-premium w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 shrink-0">
          <h2 className="text-lg font-semibold text-text-primary font-poppins">
            {isEditing ? "Edit Package" : "Add New Package"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1">
            <form id="package-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Destination
                    </label>
                    <div className="relative">
                        <div 
                        className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors ${errors.destination_id ? "border-rose-300 ring-1 ring-rose-200" : "border-gray-200"}`}
                        onClick={() => setIsDestinationLookupOpen(true)}
                        >
                        <span className={`text-sm font-medium ${selectedDestinationName ? "text-text-primary" : "text-gray-400"}`}>
                            {selectedDestinationName || "Select a Destination"}
                        </span>
                        <Search className="w-4 h-4 text-gray-400" />
                        </div>
                        <input type="hidden" {...register("destination_id")} />
                    </div>
                    {errors.destination_id && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.destination_id.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="name">
                    Package Name
                    </label>
                    <input
                    id="name"
                    {...register("name")}
                    onChange={handleNameChange}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.name ? "border-rose-300 ring-rose-200" : "border-gray-200"
                    }`}
                    placeholder="E.g. Tropical Bali Adventure"
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
                        errors.slug ? "border-rose-300 ring-rose-200" : "border-gray-200"
                    }`}
                    placeholder="tropical-bali-adventure"
                    />
                    {errors.slug && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.slug.message}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="description">
                Description
                </label>
                <textarea
                id="description"
                {...register("description")}
                rows={3}
                className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                    errors.description ? "border-rose-300 ring-rose-200" : "border-gray-200"
                }`}
                placeholder="Detailed description of the package..."
                />
                {errors.description && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                 <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="price">
                    Price
                    </label>
                    <input
                    id="price"
                    type="number"
                    {...register("price")}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.price ? "border-rose-300 ring-rose-200" : "border-gray-200"
                    }`}
                    />
                    {errors.price && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.price.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="duration">
                    Duration (Days)
                    </label>
                    <input
                    id="duration"
                    type="number"
                    {...register("duration")}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.duration ? "border-rose-300 ring-rose-200" : "border-gray-200"
                    }`}
                    />
                    {errors.duration && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.duration.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="max_participants">
                    Max Participants
                    </label>
                    <input
                    id="max_participants"
                    type="number"
                    {...register("max_participants")}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.max_participants ? "border-rose-300 ring-rose-200" : "border-gray-200"
                    }`}
                    />
                    {errors.max_participants && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.max_participants.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="start_date">
                    Start Date
                    </label>
                    <input
                    id="start_date"
                    type="date"
                    {...register("start_date")}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.start_date ? "border-rose-300 ring-rose-200" : "border-gray-200"
                    }`}
                    />
                    {errors.start_date && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.start_date.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="end_date">
                    End Date
                    </label>
                    <input
                    id="end_date"
                    type="date"
                    {...register("end_date")}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.end_date ? "border-rose-300 ring-rose-200" : "border-gray-200"
                    }`}
                    />
                    {errors.end_date && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.end_date.message}</p>}
                </div>
            </div>

            <div className="flex items-center">
                <input
                id="is_featured"
                type="checkbox"
                {...register("is_featured")}
                className="h-4 w-4 text-primary-blue rounded border-gray-300 focus:ring-primary-blue"
                />
                <label htmlFor="is_featured" className="ml-2 block text-sm font-medium text-text-primary">
                Featured Package
                </label>
            </div>
            </form>
        </div>

        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex justify-end space-x-3 shrink-0">
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
              form="package-form"
              disabled={isPending}
              className="px-5 py-2.5 bg-primary-blue hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-70 flex items-center"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Package"}
            </button>
          </div>
      </div>

      <LookupModal<Destination>
        isOpen={isDestinationLookupOpen}
        onClose={() => setIsDestinationLookupOpen(false)}
        onSelect={(dest) => {
          setValue("destination_id", dest.id, { shouldValidate: true });
          setSelectedDestinationName(dest.name);
        }}
        title="Select Destination"
        queryKey="destinations"
        queryFn={destinationService.getDestinations}
        columns={[
          { header: "Name", accessor: "name", sortable: true },
          { header: "Slug", accessor: "slug", sortable: true },
          { 
            header: "Status", 
            accessor: "is_featured", 
            render: (dest) => dest.is_featured ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Featured</span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Standard</span>
            )
          }
        ]}
        searchPlaceholder="Search destination name, slug..."
      />
    </div>
  );
}
