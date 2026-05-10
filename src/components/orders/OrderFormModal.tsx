import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Search, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Order, orderService, OrderInput } from "../../services/order.service";
import { userService, User } from "../../services/user.service";
import { packageService, Package } from "../../services/package.service";
import { orderDetailService, OrderDetailInput } from "../../services/orderDetail.service";
import { LookupModal } from "../ui/LookupModal";

const orderDetailSchema = z.object({
  id: z.string().optional(),
  package_id: z.string().min(1, "Package is required"),
  package_name: z.string().optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0, "Price must be >= 0"),
});

const schema = z.object({
  user_id: z.string().min(1, "User is required"),
  total_amount: z.coerce.number().min(0, "Total amount must be greater than or equal to 0"),
  status: z.string().min(1, "Status is required"),
  order_details: z.array(orderDetailSchema).default([]),
});

type FormValues = z.infer<typeof schema>;

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToEdit?: Order | null;
}

export function OrderFormModal({ isOpen, onClose, orderToEdit }: OrderFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!orderToEdit;

  const [isUserLookupOpen, setIsUserLookupOpen] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState("");
  
  const [activeLookupIndex, setActiveLookupIndex] = useState<number | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      user_id: "",
      total_amount: 0,
      status: "pending",
      order_details: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "order_details",
  });

  const watchOrderDetails = watch("order_details");

  const { data: orderDetailsData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["order-details", orderToEdit?.id],
    queryFn: () => orderDetailService.getOrderDetailsByOrderId(orderToEdit!.id),
    enabled: !!orderToEdit && isOpen,
  });

  useEffect(() => {
    if (orderToEdit && isOpen) {
      // First set main order fields
      reset({
        user_id: orderToEdit.user_id,
        total_amount: orderToEdit.total_amount,
        status: orderToEdit.status,
        order_details: watchOrderDetails, // keep current details if they haven't loaded yet
      });
      setSelectedUserName(orderToEdit.user_id);
      
      const fetchUserName = async () => {
        try {
          const res = await userService.getUser(orderToEdit.user_id);
          if (res.data) {
            setSelectedUserName(res.data.name);
          }
        } catch (e) {
          // ignore
        }
      };
      fetchUserName();
    } else if (isOpen) {
      reset({
        user_id: "",
        total_amount: 0,
        status: "pending",
        order_details: [],
      });
      setSelectedUserName("");
    }
  }, [orderToEdit, isOpen]);

  // Update order details when fetched
  useEffect(() => {
    if (isEditing && orderDetailsData?.data && isOpen) {
      const details = orderDetailsData.data.map(d => ({
        id: d.id,
        package_id: d.package_id,
        package_name: d.package_id, // We'd need to fetch real name if wanted, but ID works as fallback
        quantity: d.quantity,
        price: d.price
      }));
      setValue("order_details", details);
      
      // Attempt to load package names
      details.forEach(async (d, idx) => {
        try {
           const pkgRes = await packageService.getPackage(d.package_id);
           if (pkgRes.data) {
             setValue(`order_details.${idx}.package_name`, pkgRes.data.name);
           }
        } catch (e) {}
      });
    }
  }, [orderDetailsData, isEditing, isOpen, setValue]);

  // Auto-calculate total amount based on details watch
  useEffect(() => {
     if (watchOrderDetails && watchOrderDetails.length > 0) {
        const total = watchOrderDetails.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
        setValue("total_amount", total);
     }
  }, [watchOrderDetails, setValue]);


  const saveOrderMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      let orderId = orderToEdit?.id;
      
      // 1. Create or Update Order
      const orderPayload: OrderInput = {
        user_id: data.user_id,
        total_amount: data.total_amount,
        status: data.status,
      };

      if (isEditing && orderId) {
        await orderService.updateOrder(orderId, orderPayload);
      } else {
        const createRes = await orderService.createOrder(orderPayload);
        orderId = createRes.data.id;
      }

      // 2. Sync Order Details
      if (orderId) {
         // get existing details if editing
         const existingDetails = isEditing && orderDetailsData?.data ? orderDetailsData.data : [];
         
         // details strictly from form
         const formDetails = data.order_details || [];

         const detailsToUpdate = formDetails.filter(d => d.id);
         const detailsToAdd = formDetails.filter(d => !d.id);
         const formDetailsIds = detailsToUpdate.map(d => d.id);
         const detailsToDelete = existingDetails.filter(d => !formDetailsIds.includes(d.id));

         // Delete removed details
         for (const del of detailsToDelete) {
            await orderDetailService.deleteOrderDetail(del.id);
         }

         // Update existing details
         for (const upd of detailsToUpdate) {
            await orderDetailService.updateOrderDetail(upd.id!, {
                package_id: upd.package_id,
                quantity: upd.quantity,
                price: upd.price
            });
         }

         // Add new details
         for (const add of detailsToAdd) {
            await orderDetailService.createOrderDetail({
               order_id: orderId,
               package_id: add.package_id,
               quantity: add.quantity,
               price: add.price
            });
         }
      }
      
      return { message: "Order & details saved successfully!" };
    },
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-details"] });
      onClose();
    },
    onError: (error: any) => {
      if (error.response?.data?.data) {
        const validationErrors = error.response.data.data;
        Object.keys(validationErrors).forEach((key) => {
          toast.error(`${key}: ${validationErrors[key][0]}`);
        });
      } else {
        toast.error(error?.response?.data?.message || error.message || "Failed to save order");
      }
    },
  });

  const onSubmit = (data: FormValues) => {
    saveOrderMutation.mutate(data);
  };

  if (!isOpen) return null;

  const isPending = saveOrderMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[24px] shadow-premium w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 flex-shrink-0">
          <h2 className="text-lg font-semibold text-text-primary font-poppins">
            {isEditing ? "Edit Order" : "Add New Order"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          {isEditing && isLoadingDetails ? (
             <div className="flex justify-center items-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary-blue" />
             </div>
          ) : (
          <form id="order-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Order Info</h3>
               <div>
                 <label className="block text-sm font-semibold text-text-primary mb-1.5">
                   User
                 </label>
                 <div className="relative">
                   <div 
                     className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors ${errors.user_id ? "border-rose-300 ring-1 ring-rose-200" : "border-gray-200"}`}
                     onClick={() => setIsUserLookupOpen(true)}
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
   
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="total_amount">
                     Total Amount
                   </label>
                   <input
                     id="total_amount"
                     type="number"
                     {...register("total_amount")}
                     className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                       errors.total_amount ? "border-rose-300 ring-rose-200" : "border-gray-200"
                     }`}
                     placeholder="e.g. 1500000"
                     readOnly // make it readonly if it auto calcs, or let user override
                   />
                   {errors.total_amount && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.total_amount.message}</p>}
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="status">
                     Status
                   </label>
                   <select
                     id="status"
                     {...register("status")}
                     className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                       errors.status ? "border-rose-300 ring-rose-200" : "border-gray-200"
                     }`}
                   >
                     <option value="pending">Pending</option>
                     <option value="paid">Paid</option>
                     <option value="cancelled">Cancelled</option>
                     <option value="refunded">Refunded</option>
                     <option value="completed">Completed</option>
                   </select>
                   {errors.status && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.status.message}</p>}
                 </div>
               </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Order Details</h3>
                  <button 
                     type="button" 
                     onClick={() => append({ package_id: "", quantity: 1, price: 0 })}
                     className="px-3 py-1.5 bg-blue-50 text-primary-blue hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center transition-colors"
                  >
                     <Plus className="w-3.5 h-3.5 mr-1" /> Add Detail
                  </button>
               </div>

               {fields.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                     <p className="text-sm text-gray-400">No order details added.</p>
                  </div>
               )}

               <div className="space-y-3">
                  {fields.map((field, index) => (
                     <div key={field.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50/50 border border-gray-100 p-3 rounded-xl">
                        <div className="flex-1 w-full">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">Package</label>
                           <div 
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white flex justify-between items-center cursor-pointer hover:border-primary-blue transition-colors"
                              onClick={() => setActiveLookupIndex(index)}
                           >
                              <span className="truncate mr-2">
                               {watchOrderDetails[index]?.package_name || watchOrderDetails[index]?.package_id || "Select Package"}
                              </span>
                              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                           </div>
                           <input type="hidden" {...register(`order_details.${index}.package_id` as const)} />
                           {errors.order_details?.[index]?.package_id && (
                              <p className="text-xs text-rose-500 mt-1">{errors.order_details[index]?.package_id?.message}</p>
                           )}
                        </div>
                        <div className="w-full sm:w-24">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">Quantity</label>
                           <input 
                              type="number" 
                              {...register(`order_details.${index}.quantity` as const)} 
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-blue/20"
                           />
                        </div>
                        <div className="w-full sm:w-32">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">Price</label>
                           <input 
                              type="number" 
                              {...register(`order_details.${index}.price` as const)} 
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-blue/20"
                           />
                        </div>
                        <div className="sm:mt-5 self-end sm:self-auto">
                           <button 
                              type="button" 
                              onClick={() => remove(index)}
                              className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          </form>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex justify-end space-x-3 flex-shrink-0">
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
            form="order-form"
            disabled={isPending}
            className="px-5 py-2.5 bg-primary-blue hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-70 flex items-center"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Order"}
          </button>
        </div>
      </div>

      <LookupModal<User>
        isOpen={isUserLookupOpen}
        onClose={() => setIsUserLookupOpen(false)}
        onSelect={(user) => {
          setValue("user_id", user.id, { shouldValidate: true });
          setSelectedUserName(user.name);
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
      
      <LookupModal<Package>
        isOpen={activeLookupIndex !== null}
        onClose={() => setActiveLookupIndex(null)}
        onSelect={(pkg) => {
          if (activeLookupIndex !== null) {
             setValue(`order_details.${activeLookupIndex}.package_id`, pkg.id, { shouldValidate: true });
             setValue(`order_details.${activeLookupIndex}.package_name`, pkg.name, { shouldValidate: true });
             setValue(`order_details.${activeLookupIndex}.price`, pkg.price, { shouldValidate: true });
          }
        }}
        title="Select Package"
        queryKey="packages"
        queryFn={packageService.getPackages}
        columns={[
          { header: "Package Name", accessor: "name", sortable: true },
          { header: "Price", accessor: "price", sortable: true },
        ]}
        searchPlaceholder="Search package name..."
      />
    </div>
  );
}

