import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Search, Edit2, Trash2, Star, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

import { reviewService, Review, ReviewInput } from "../../services/review.service";
import { userService, User } from "../../services/user.service";
import { LookupModal } from "../ui/LookupModal";

const schema = z.object({
  user_id: z.string().min(1, "User is required"),
  rating: z.coerce.number().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
  comment: z.string().min(1, "Comment is required"),
});

type FormValues = z.infer<typeof schema>;

interface PackageReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId?: string | null;
  packageName?: string;
}

export function PackageReviewsModal({ isOpen, onClose, packageId, packageName }: PackageReviewsModalProps) {
  const queryClient = useQueryClient();
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);
  const isEditing = !!reviewToEdit;

  const [isUserLookupOpen, setIsUserLookupOpen] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState("");

  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["package-reviews", packageId],
    queryFn: () => reviewService.getReviewsByPackageId(packageId!),
    enabled: !!packageId && isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      user_id: "",
      rating: 5,
      comment: "",
    },
  });

  useEffect(() => {
    if (reviewToEdit) {
      reset({
        user_id: reviewToEdit.user_id,
        rating: reviewToEdit.rating,
        comment: reviewToEdit.comment,
      });
      setSelectedUserName(reviewToEdit.user_id);
      
      const fetchUser = async () => {
         try {
             const userRes = await userService.getUser(reviewToEdit.user_id);
             if (userRes.data) {
                 setSelectedUserName(userRes.data.name || userRes.data.email);
             }
         } catch(e) {}
      }
      fetchUser();

    } else {
      reset({
        user_id: "",
        rating: 5,
        comment: "",
      });
      setSelectedUserName("");
    }
  }, [reviewToEdit, reset]);

  useEffect(() => {
    if (!isOpen) {
       setReviewToEdit(null);
    }
  }, [isOpen]);


  const createMutation = useMutation({
    mutationFn: (data: ReviewInput) => reviewService.createReview(data),
    onSuccess: (res) => {
      toast.success(res.message || "Review created successfully!");
      queryClient.invalidateQueries({ queryKey: ["package-reviews", packageId] });
      setReviewToEdit(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create review");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ReviewInput>) => reviewService.updateReview(reviewToEdit!.id, data),
    onSuccess: (res) => {
      toast.success(res.message || "Review updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["package-reviews", packageId] });
      setReviewToEdit(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update review");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewService.deleteReview(id),
    onSuccess: (res) => {
      toast.success(res.message || "Review deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["package-reviews", packageId] });
      if (reviewToEdit?.id === deleteMutation.variables) {
         setReviewToEdit(null);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete review");
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!packageId) return;

    if (isEditing) {
      updateMutation.mutate({
         rating: data.rating,
         comment: data.comment
      });
    } else {
      createMutation.mutate({
          package_id: packageId,
          user_id: data.user_id,
          rating: data.rating,
          comment: data.comment
      });
    }
  };

  const handleDelete = (reviewId: string) => {
     if (window.confirm("Are you sure you want to delete this review?")) {
        deleteMutation.mutate(reviewId);
     }
  }

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[24px] shadow-premium w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-text-primary font-poppins flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-primary-blue" />
                Package Reviews
            </h2>
            {packageName && <p className="text-xs text-text-secondary mt-1">{packageName}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row overflow-hidden flex-1 min-h-[400px]">
            {/* Reviews List */}
            <div className="w-full md:w-3/5 border-r border-gray-50 flex flex-col bg-gray-50/30 overflow-y-auto custom-scrollbar p-6">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Existing Reviews</h3>
                
                {isLoadingReviews ? (
                     <div className="flex justify-center items-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
                     </div>
                ) : reviewsData?.data?.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                        <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">No reviews yet for this package.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviewsData?.data?.map((review) => (
                            <div key={review.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group">
                                <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                       onClick={() => setReviewToEdit(review)}
                                       className="p-1.5 text-gray-400 hover:text-primary-blue hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                       onClick={() => handleDelete(review.id)}
                                       disabled={deleteMutation.isPending && deleteMutation.variables === review.id}
                                       className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center mb-2">
                                    <div className="flex text-amber-400 mr-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-gray-300"}`} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">ID: {review.user_id.slice(0, 8)}...</span>
                                </div>
                                <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Form */}
            <div className="w-full md:w-2/5 flex flex-col bg-white overflow-y-auto custom-scrollbar p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                        {isEditing ? "Edit Review" : "Add Review"}
                    </h3>
                    {isEditing && (
                        <button 
                           onClick={() => setReviewToEdit(null)}
                           className="text-xs text-gray-400 hover:text-gray-600 underline"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                <form id="review-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">
                            User
                        </label>
                        <div className="relative">
                            <div 
                            className={`w-full px-4 py-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                                isEditing ? 'bg-gray-100 cursor-not-allowed opacity-80 border-gray-200' : 'bg-gray-50 cursor-pointer hover:bg-gray-100 border-gray-200'
                            } ${errors.user_id && !isEditing ? "border-rose-300 ring-1 ring-rose-200" : ""}`}
                            onClick={() => !isEditing && setIsUserLookupOpen(true)}
                            >
                            <span className={`text-sm font-medium ${selectedUserName ? "text-text-primary" : "text-gray-400"}`}>
                                {selectedUserName || "Select a User"}
                            </span>
                            <Search className="w-4 h-4 text-gray-400" />
                            </div>
                            <input type="hidden" {...register("user_id")} />
                        </div>
                        {errors.user_id && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.user_id.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="rating">
                            Rating (1-5)
                        </label>
                        <input
                            id="rating"
                            type="number"
                            min="1"
                            max="5"
                            {...register("rating")}
                            className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                                errors.rating ? "border-rose-300 ring-rose-200" : "border-gray-200"
                            }`}
                        />
                        {errors.rating && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.rating.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="comment">
                            Comment
                        </label>
                        <textarea
                            id="comment"
                            rows={4}
                            {...register("comment")}
                            className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                                errors.comment ? "border-rose-300 ring-rose-200" : "border-gray-200"
                            }`}
                            placeholder="Write review comment here..."
                        />
                        {errors.comment && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.comment.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full mt-4 px-5 py-2.5 bg-primary-blue hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-70 flex items-center justify-center"
                    >
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isEditing ? "Save Changes" : "Create Review"}
                    </button>
                </form>
            </div>
        </div>

      </div>

      <LookupModal<User>
        isOpen={isUserLookupOpen}
        onClose={() => setIsUserLookupOpen(false)}
        onSelect={(user) => {
          setValue("user_id", user.id, { shouldValidate: true });
          setSelectedUserName(user.name || user.email);
        }}
        title="Select User"
        queryKey="users"
        queryFn={userService.getUsers}
        columns={[
          { header: "Name", accessor: "name", sortable: true },
          { header: "Email", accessor: "email", sortable: true },
        ]}
        searchPlaceholder="Search user name or email..."
      />

    </div>
  );
}
