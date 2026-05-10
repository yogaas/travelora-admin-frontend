import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Search, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Package, packageService, PackageInput } from "../../services/package.service";
import { destinationService, Destination } from "../../services/destination.service";
import { packageImageService } from "../../services/packageImage.service";
import { packageIncludeExcludeService } from "../../services/packageIncludeExclude.service";
import { packageTimelineService } from "../../services/packageTimeline.service";
import { LookupModal } from "../ui/LookupModal";

const imageSchema = z.object({
  id: z.string().optional(),
  image_url: z.string().min(1, "URL is required"),
  is_thumbnail: z.boolean().default(false),
});

const includeExcludeSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["include", "exclude"]),
});

const timelineSchema = z.object({
  id: z.string().optional(),
  day: z.coerce.number().min(1),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

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
  package_images: z.array(imageSchema).default([]),
  include_excludes: z.array(includeExcludeSchema).default([]),
  timelines: z.array(timelineSchema).default([]),
});

type FormValues = z.infer<typeof schema>;

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageToEdit?: Package | null;
  isViewMode?: boolean;
}

export function PackageFormModal({ isOpen, onClose, packageToEdit, isViewMode }: PackageFormModalProps) {
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
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
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
      package_images: [],
      include_excludes: [],
      timelines: [],
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control, name: "package_images" });
  const { fields: incExcFields, append: appendIncExc, remove: removeIncExc } = useFieldArray({ control, name: "include_excludes" });
  const { fields: timelineFields, append: appendTimeline, remove: removeTimeline } = useFieldArray({ control, name: "timelines" });

  const watchImages = watch("package_images");
  const watchIncExc = watch("include_excludes");
  const watchTimelines = watch("timelines");

  const { data: imagesData, isLoading: isLoadingImages } = useQuery({
    queryKey: ["package-images", packageToEdit?.id],
    queryFn: () => packageImageService.getImagesByPackageId(packageToEdit!.id),
    enabled: !!packageToEdit && isOpen,
  });

  const { data: incExcData, isLoading: isLoadingIncExc } = useQuery({
    queryKey: ["package-inc-exc", packageToEdit?.id],
    queryFn: () => packageIncludeExcludeService.getIncludeExcludesByPackageId(packageToEdit!.id),
    enabled: !!packageToEdit && isOpen,
  });

  const { data: timelinesData, isLoading: isLoadingTimelines } = useQuery({
    queryKey: ["package-timelines", packageToEdit?.id],
    queryFn: () => packageTimelineService.getTimelinesByPackageId(packageToEdit!.id),
    enabled: !!packageToEdit && isOpen,
  });

  const isDataLoading = isLoadingImages || isLoadingIncExc || isLoadingTimelines;

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
        package_images: watchImages,
        include_excludes: watchIncExc,
        timelines: watchTimelines,
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
        package_images: [],
        include_excludes: [],
        timelines: [],
      });
      setSelectedDestinationName("");
    }
  }, [packageToEdit, isOpen]);

  useEffect(() => {
    if (isEditing && isOpen) {
        if (imagesData?.data) {
           setValue("package_images", imagesData.data.map(d => ({
               id: d.id, image_url: d.image_url, is_thumbnail: d.is_thumbnail
           })));
        }
        if (incExcData?.data) {
           setValue("include_excludes", incExcData.data.map(d => ({
               id: d.id, description: d.description, type: d.type
           })));
        }
        if (timelinesData?.data) {
           setValue("timelines", timelinesData.data.map(d => ({
               id: d.id, day: d.day, title: d.title, description: d.description
           })));
        }
    }
  }, [imagesData, incExcData, timelinesData, isEditing, isOpen, setValue]);

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

  const savePackageMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      let packageId = packageToEdit?.id;
      
      const packagePayload: PackageInput = {
        destination_id: data.destination_id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        duration: data.duration,
        price: data.price,
        start_date: data.start_date,
        end_date: data.end_date,
        max_participants: data.max_participants,
        is_featured: data.is_featured,
      };

      if (isEditing && packageId) {
        await packageService.updatePackage(packageId, packagePayload);
      } else {
        const createRes = await packageService.createPackage(packagePayload);
        packageId = createRes.data.id;
      }

      if (packageId) {
         // Sync Images
         const existingImages = isEditing && imagesData?.data ? imagesData.data : [];
         const formImages = data.package_images || [];
         const imagesToUpdate = formImages.filter(d => d.id);
         const imagesToAdd = formImages.filter(d => !d.id);
         const formImageIds = imagesToUpdate.map(d => d.id);
         const imagesToDelete = existingImages.filter(d => !formImageIds.includes(d.id));

         for (const del of imagesToDelete) await packageImageService.deleteImage(del.id);
         for (const upd of imagesToUpdate) {
            await packageImageService.updateImage(upd.id!, {
                image_url: upd.image_url, is_thumbnail: upd.is_thumbnail
            });
         }
         for (const add of imagesToAdd) {
            await packageImageService.createImage({
               package_id: packageId, image_url: add.image_url, is_thumbnail: add.is_thumbnail
            });
         }

         // Sync Include Excludes
         const existingIncExc = isEditing && incExcData?.data ? incExcData.data : [];
         const formIncExc = data.include_excludes || [];
         const incExcToUpdate = formIncExc.filter(d => d.id);
         const incExcToAdd = formIncExc.filter(d => !d.id);
         const formIncExcIds = incExcToUpdate.map(d => d.id);
         const incExcToDelete = existingIncExc.filter(d => !formIncExcIds.includes(d.id));

         for (const del of incExcToDelete) await packageIncludeExcludeService.deleteIncludeExclude(del.id);
         for (const upd of incExcToUpdate) {
            await packageIncludeExcludeService.updateIncludeExclude(upd.id!, {
                description: upd.description, type: upd.type
            });
         }
         for (const add of incExcToAdd) {
            await packageIncludeExcludeService.createIncludeExclude({
               package_id: packageId, description: add.description, type: add.type
            });
         }

         // Sync Timelines
         const existingTimelines = isEditing && timelinesData?.data ? timelinesData.data : [];
         const formTimelines = data.timelines || [];
         const timelinesToUpdate = formTimelines.filter(d => d.id);
         const timelinesToAdd = formTimelines.filter(d => !d.id);
         const formTimelineIds = timelinesToUpdate.map(d => d.id);
         const timelinesToDelete = existingTimelines.filter(d => !formTimelineIds.includes(d.id));

         for (const del of timelinesToDelete) await packageTimelineService.deleteTimeline(del.id);
         for (const upd of timelinesToUpdate) {
            await packageTimelineService.updateTimeline(upd.id!, {
                day: upd.day, title: upd.title, description: upd.description
            });
         }
         for (const add of timelinesToAdd) {
            await packageTimelineService.createTimeline({
               package_id: packageId, day: add.day, title: add.title, description: add.description
            });
         }
      }
      return { message: "Package saved successfully!" };
    },
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save package");
    },
  });

  const onSubmit = (data: FormValues) => {
    savePackageMutation.mutate(data);
  };

  if (!isOpen) return null;

  const isPending = savePackageMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[24px] shadow-premium w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 shrink-0">
          <h2 className="text-lg font-semibold text-text-primary font-poppins">
            {isViewMode ? "Package Details" : isEditing ? "Edit Package" : "Add New Package"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 relative">
            {isEditing && isDataLoading ? (
             <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
             </div>
            ) : (
            <form id="package-form" onSubmit={handleSubmit(onSubmit as any)} className="p-6 space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Destination
                    </label>
                    <div className="relative">
                        <div 
                        className={`w-full px-4 py-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                          isViewMode ? 'bg-gray-100 cursor-not-allowed opacity-80' : 'bg-gray-50 cursor-pointer hover:bg-gray-100'
                        } ${errors.destination_id ? "border-rose-300 ring-1 ring-rose-200" : "border-gray-200"}`}
                        onClick={() => !isViewMode && setIsDestinationLookupOpen(true)}
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
                    disabled={isViewMode}
                    {...register("name")}
                    onChange={handleNameChange}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.name ? "border-rose-300 ring-rose-200" : "border-gray-200"
                    } disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-80`}
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
                    disabled={isViewMode}
                    {...register("slug")}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.slug ? "border-rose-300 ring-rose-200" : "border-gray-200"
                    } disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-80`}
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
                disabled={isViewMode}
                {...register("description")}
                rows={3}
                className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                    errors.description ? "border-rose-300 ring-rose-200" : "border-gray-200"
                } disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-80`}
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
                    disabled={isViewMode}
                    {...register("price")}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.price ? "border-rose-300 ring-rose-200" : "border-gray-200"
                    } disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-80`}
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
                    disabled={isViewMode}
                    {...register("duration")}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.duration ? "border-rose-300 ring-rose-200" : "border-gray-200"
                    } disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-80`}
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
                    disabled={isViewMode}
                    {...register("max_participants")}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.max_participants ? "border-rose-300 ring-rose-200" : "border-gray-200"
                    } disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-80`}
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
                    disabled={isViewMode}
                    {...register("start_date")}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.start_date ? "border-rose-300 ring-rose-200" : "border-gray-200"
                    } disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-80`}
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
                    disabled={isViewMode}
                    {...register("end_date")}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                        errors.end_date ? "border-rose-300 ring-rose-200" : "border-gray-200"
                    } disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-80`}
                    />
                    {errors.end_date && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.end_date.message}</p>}
                </div>
            </div>

            <div className="flex items-center mb-6">
                <input
                id="is_featured"
                type="checkbox"
                disabled={isViewMode}
                {...register("is_featured")}
                className="h-4 w-4 text-primary-blue rounded border-gray-300 focus:ring-primary-blue disabled:opacity-50"
                />
                <label htmlFor="is_featured" className={`ml-2 block text-sm font-medium ${isViewMode ? 'text-gray-500' : 'text-text-primary'}`}>
                Featured Package
                </label>
            </div>

            {/* Images Array */}
            <div className="pt-6 border-t border-gray-100">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Package Images</h3>
                  {!isViewMode && (
                  <button 
                     type="button" 
                     onClick={() => appendImage({ image_url: "", is_thumbnail: false })}
                     className="px-3 py-1.5 bg-blue-50 text-primary-blue hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center transition-colors"
                  >
                     <Plus className="w-3.5 h-3.5 mr-1" /> Add Image
                  </button>
                  )}
               </div>
               
               {imageFields.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 mb-4">
                     <p className="text-sm text-gray-400">No images added.</p>
                  </div>
               )}

               <div className="space-y-3 mb-6">
                  {imageFields.map((field, index) => (
                     <div key={field.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50/50 border border-gray-100 p-3 rounded-xl">
                        <div className="flex-1 w-full">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">Image URL</label>
                           <input 
                              type="url" 
                              disabled={isViewMode}
                              {...register(`package_images.${index}.image_url` as const)} 
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:opacity-80"
                              placeholder="https://example.com/image.jpg"
                           />
                           {errors.package_images?.[index]?.image_url && (
                              <p className="text-xs text-rose-500 mt-1">{errors.package_images[index]?.image_url?.message}</p>
                           )}
                        </div>
                        <div className="w-full sm:w-auto flex items-center h-full sm:mt-5">
                            <input
                            id={`is_thumbnail_${index}`}
                            type="checkbox"
                            disabled={isViewMode}
                            {...register(`package_images.${index}.is_thumbnail` as const)}
                            className="h-4 w-4 text-primary-blue rounded border-gray-300 focus:ring-primary-blue disabled:opacity-50"
                            />
                            <label htmlFor={`is_thumbnail_${index}`} className="ml-2 block text-xs font-medium text-gray-700">
                            Thumbnail
                            </label>
                        </div>
                        {!isViewMode && (
                        <div className="sm:mt-5 self-end sm:self-auto">
                           <button 
                              type="button" 
                              onClick={() => removeImage(index)}
                              className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>

            {/* Includes & Excludes Array */}
            <div className="pt-6 border-t border-gray-100">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Includes & Excludes</h3>
                  {!isViewMode && (
                  <button 
                     type="button" 
                     onClick={() => appendIncExc({ description: "", type: "include" })}
                     className="px-3 py-1.5 bg-blue-50 text-primary-blue hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center transition-colors"
                  >
                     <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                  </button>
                  )}
               </div>
               
               {incExcFields.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 mb-4">
                     <p className="text-sm text-gray-400">No includes/excludes added.</p>
                  </div>
               )}

               <div className="space-y-3 mb-6">
                  {incExcFields.map((field, index) => (
                     <div key={field.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50/50 border border-gray-100 p-3 rounded-xl">
                        <div className="w-full sm:w-32">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                           <select 
                              disabled={isViewMode}
                              {...register(`include_excludes.${index}.type` as const)} 
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:opacity-80"
                           >
                               <option value="include">Include</option>
                               <option value="exclude">Exclude</option>
                           </select>
                        </div>
                        <div className="flex-1 w-full">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                           <input 
                              type="text" 
                              disabled={isViewMode}
                              {...register(`include_excludes.${index}.description` as const)} 
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:opacity-80"
                              placeholder="e.g. Flight ticket"
                           />
                           {errors.include_excludes?.[index]?.description && (
                              <p className="text-xs text-rose-500 mt-1">{errors.include_excludes[index]?.description?.message}</p>
                           )}
                        </div>
                        
                        {!isViewMode && (
                        <div className="sm:mt-5 self-end sm:self-auto">
                           <button 
                              type="button" 
                              onClick={() => removeIncExc(index)}
                              className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>

            {/* Timelines Array */}
            <div className="pt-6 border-t border-gray-100">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Timeline Schedule</h3>
                  {!isViewMode && (
                  <button 
                     type="button" 
                     onClick={() => appendTimeline({ day: 1, title: "", description: "" })}
                     className="px-3 py-1.5 bg-blue-50 text-primary-blue hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center transition-colors"
                  >
                     <Plus className="w-3.5 h-3.5 mr-1" /> Add Day
                  </button>
                  )}
               </div>
               
               {timelineFields.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 mb-4">
                     <p className="text-sm text-gray-400">No timeline schedules added.</p>
                  </div>
               )}

               <div className="space-y-4 mb-2">
                  {timelineFields.map((field, index) => (
                     <div key={field.id} className="flex flex-col gap-3 bg-gray-50/50 border border-gray-100 p-4 rounded-xl relative">
                        {!isViewMode && (
                        <button 
                           type="button" 
                           onClick={() => removeTimeline(index)}
                           className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="w-full sm:w-24">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Day</label>
                            <input 
                                type="number" 
                                disabled={isViewMode}
                                {...register(`timelines.${index}.day` as const)} 
                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:opacity-80"
                                min={1}
                            />
                            </div>
                            <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
                            <input 
                                type="text" 
                                disabled={isViewMode}
                                {...register(`timelines.${index}.title` as const)} 
                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:opacity-80"
                                placeholder="e.g. Arrival & City Tour"
                            />
                            {errors.timelines?.[index]?.title && (
                                <p className="text-xs text-rose-500 mt-1">{errors.timelines[index]?.title?.message}</p>
                            )}
                            </div>
                        </div>

                        <div className="w-full">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                           <textarea 
                              rows={2}
                              disabled={isViewMode}
                              {...register(`timelines.${index}.description` as const)} 
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100 disabled:opacity-80"
                              placeholder="Details about today's activities..."
                           />
                           {errors.timelines?.[index]?.description && (
                              <p className="text-xs text-rose-500 mt-1">{errors.timelines[index]?.description?.message}</p>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            </form>
            )}
        </div>

        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>
            {!isViewMode && (
            <button
              type="submit"
              form="package-form"
              disabled={isPending}
              className="px-5 py-2.5 bg-primary-blue hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-70 flex items-center"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Package"}
            </button>
            )}
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
