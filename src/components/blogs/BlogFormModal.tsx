import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { Blog, blogService, BlogInput } from "../../services/blog.service";
import { useAuthStore } from "../../store/authStore";
import { blogCategoryService, BlogCategory } from "../../services/blogCategory.service";
import { LookupModal } from "../ui/LookupModal";

const schema = z.object({
  category_id: z.string().min(1, "Category is required"),
  user_id: z.string().min(1, "Author is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  is_published: z.boolean().default(false),
  published_at: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface BlogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogToEdit?: Blog | null;
}

export function BlogFormModal({ isOpen, onClose, blogToEdit }: BlogFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!blogToEdit;
  const currentUser = useAuthStore((state) => state.user);

  const [isCategoryLookupOpen, setIsCategoryLookupOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category_id: "",
      user_id: currentUser?.id?.toString() || "",
      title: "",
      slug: "",
      content: "",
      seo_title: "",
      seo_description: "",
      is_published: false,
      published_at: "",
    },
  });

  const isPublishedWatcher = watch("is_published");

  useEffect(() => {
    if (blogToEdit && isOpen) {
      reset({
        category_id: blogToEdit.category_id,
        user_id: blogToEdit.user_id,
        title: blogToEdit.title,
        slug: blogToEdit.slug,
        content: blogToEdit.content,
        seo_title: blogToEdit.seo_title || "",
        seo_description: blogToEdit.seo_description || "",
        is_published: blogToEdit.is_published,
        published_at: blogToEdit.published_at ? blogToEdit.published_at.slice(0, 16) : "", // Format for datetime-local
      });
      // We don't have the category name in blogToEdit, ideally backend includes it
      // For now we just show the ID or a generic text, or fetch it
      setSelectedCategoryName(blogToEdit.category_id);
      
      // If we want to fetch the real category name, we could do it here
      const fetchCategoryName = async () => {
        try {
          const res = await blogCategoryService.getCategory(blogToEdit.category_id);
          if (res.data) {
            setSelectedCategoryName(res.data.name);
          }
        } catch (e) {
          // ignore
        }
      };
      fetchCategoryName();
    } else if (isOpen) {
      reset({
        category_id: "",
        user_id: currentUser?.id?.toString() || "",
        title: "",
        slug: "",
        content: "",
        seo_title: "",
        seo_description: "",
        is_published: false,
        published_at: "",
      });
      setSelectedCategoryName("");
    }
  }, [blogToEdit, isOpen, reset, currentUser]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("title", val);
    if (!isEditing) {
        setValue("slug", generateSlug(val));
        setValue("seo_title", val);
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: BlogInput) => blogService.createBlog(data),
    onSuccess: (res) => {
      toast.success(res.message || "Blog created successfully!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create blog");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<BlogInput>) => blogService.updateBlog(blogToEdit!.id, data),
    onSuccess: (res) => {
      toast.success(res.message || "Blog updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update blog");
    },
  });

  const onSubmit = (data: FormValues) => {
    const payload = { ...data };
    
    // Auto-set published_at if publishing now and no date set
    if (payload.is_published && !payload.published_at) {
        // Simple ISO string creation mapped to backend needs
        payload.published_at = new Date().toISOString();
    } else if (payload.published_at) {
      // Ensure it's a valid date string
      payload.published_at = new Date(payload.published_at).toISOString()
    } else {
        payload.published_at = "";
    }

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload as BlogInput);
    }
  };

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[24px] shadow-premium w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 shrink-0">
          <h2 className="text-lg font-semibold text-text-primary font-poppins">
            {isEditing ? "Edit Blog Post" : "Add New Blog Post"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1">
            <form id="blog-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            
            {/* Basic Info */}
            <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="title">
                        Post Title
                        </label>
                        <input
                        id="title"
                        {...register("title")}
                        onChange={handleTitleChange}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                            errors.title ? "border-rose-300 ring-1 ring-rose-200" : "border-gray-200"
                        }`}
                        placeholder="e.g. 10 Best Places to Visit in Bali"
                        />
                        {errors.title && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.title.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="slug">
                        Slug (URL)
                        </label>
                        <input
                        id="slug"
                        {...register("slug")}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                            errors.slug ? "border-rose-300 ring-1 ring-rose-200" : "border-gray-200"
                        }`}
                        placeholder="e.g. best-places-in-bali"
                        />
                        {errors.slug && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.slug.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">
                        Category
                        </label>
                        <div className="relative">
                            <div 
                                className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors ${errors.category_id ? "border-rose-300 ring-1 ring-rose-200" : "border-gray-200"}`}
                                onClick={() => setIsCategoryLookupOpen(true)}
                            >
                                <span className={`text-sm font-medium ${selectedCategoryName ? "text-text-primary" : "text-gray-400"}`}>
                                    {selectedCategoryName || "Select a Category"}
                                </span>
                                <Search className="w-4 h-4 text-gray-400" />
                            </div>
                            <input type="hidden" {...register("category_id")} />
                        </div>
                        {errors.category_id && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.category_id.message}</p>}
                    </div>
                    {/* Empty placeholder to keep matching grid structure for aesthetics */}
                    <div className="hidden md:block"></div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="content">
                    Content (Markdown/HTML)
                    </label>
                    <textarea
                    id="content"
                    {...register("content")}
                    rows={8}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium resize-none ${
                        errors.content ? "border-rose-300 ring-1 ring-rose-200" : "border-gray-200"
                    }`}
                    placeholder="Write your amazing blog post here..."
                    />
                    {errors.content && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.content.message}</p>}
                </div>
            </div>

            {/* SEO Settings */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-text-primary">SEO Settings <span className="text-gray-400 font-medium ml-1">(Optional)</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="seo_title">
                        SEO Title
                        </label>
                        <input
                        id="seo_title"
                        {...register("seo_title")}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium"
                        placeholder="Custom title for search engines"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="seo_description">
                        SEO Description
                        </label>
                        <input
                        id="seo_description"
                        {...register("seo_description")}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium"
                        placeholder="Brief description for search results"
                        />
                    </div>
                </div>
            </div>

             {/* Publish Settings */}
             <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 mt-6">
                <div className="flex items-center">
                    <input
                    id="is_published"
                    type="checkbox"
                    {...register("is_published")}
                    className="h-5 w-5 text-primary-blue rounded border-gray-300 focus:ring-primary-blue transition-colors cursor-pointer"
                    />
                    <label htmlFor="is_published" className="ml-3 block font-semibold text-text-primary cursor-pointer">
                    Publish this post immediately
                    </label>
                </div>
                
                {isPublishedWatcher && (
                    <div className="mt-4 pt-4 border-t border-gray-200/60 fade-in animate-in">
                        <label className="block text-xs font-semibold text-text-secondary mb-1.5" htmlFor="published_at">
                        Custom Publish Date (Optional)
                        </label>
                        <input
                        id="published_at"
                        type="datetime-local"
                        {...register("published_at")}
                        className="w-full sm:w-auto min-w-[250px] px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium"
                        />
                    </div>
                )}
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
              form="blog-form"
              disabled={isPending}
              className="px-5 py-2.5 bg-primary-blue hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-70 flex items-center"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Post"}
            </button>
          </div>
      </div>
      <LookupModal<BlogCategory>
        isOpen={isCategoryLookupOpen}
        onClose={() => setIsCategoryLookupOpen(false)}
        onSelect={(cat) => {
          setValue("category_id", cat.id, { shouldValidate: true });
          setSelectedCategoryName(cat.name);
        }}
        title="Select Blog Category"
        queryKey="blog-categories"
        queryFn={blogCategoryService.getCategories}
        columns={[
          { header: "Name", accessor: "name", sortable: true },
          { header: "Slug", accessor: "slug", sortable: true },
        ]}
        searchPlaceholder="Search category name or slug..."
      />
    </div>
  );
}
