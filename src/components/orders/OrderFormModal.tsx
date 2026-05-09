import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { Order, orderService, OrderInput } from "../../services/order.service";
import { userService, User } from "../../services/user.service";
import { LookupModal } from "../ui/LookupModal";

const schema = z.object({
  user_id: z.string().min(1, "User is required"),
  total_amount: z.coerce.number().min(0, "Total amount must be greater than or equal to 0"),
  status: z.string().min(1, "Status is required"),
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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      user_id: "",
      total_amount: 0,
      status: "pending",
    },
  });

  useEffect(() => {
    if (orderToEdit && isOpen) {
      reset({
        user_id: orderToEdit.user_id,
        total_amount: orderToEdit.total_amount,
        status: orderToEdit.status,
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
      });
      setSelectedUserName("");
    }
  }, [orderToEdit, isOpen, reset]);

  const createMutation = useMutation({
    mutationFn: (data: OrderInput) => orderService.createOrder(data),
    onSuccess: (res) => {
      toast.success(res.message || "Order created successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onClose();
    },
    onError: (error: any) => {
      if (error.response?.data?.data) {
        const validationErrors = error.response.data.data;
        Object.keys(validationErrors).forEach((key) => {
          toast.error(`${key}: ${validationErrors[key][0]}`);
        });
      } else {
        toast.error(error?.response?.data?.message || "Failed to create order");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<OrderInput>) => orderService.updateOrder(orderToEdit!.id, data),
    onSuccess: (res) => {
      toast.success(res.message || "Order updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onClose();
    },
    onError: (error: any) => {
        if (error.response?.data?.data) {
            const validationErrors = error.response.data.data;
            Object.keys(validationErrors).forEach((key) => {
                toast.error(`${key}: ${validationErrors[key][0]}`);
            });
        } else {
            toast.error(error?.response?.data?.message || "Failed to update order");
        }
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
            {isEditing ? "Edit Order" : "Add New Order"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form id="order-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
    </div>
  );
}
