import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { Payment, paymentService, PaymentInput } from "../../services/payment.service";
import { orderService, Order } from "../../services/order.service";
import { paymentMethodService, PaymentMethod } from "../../services/paymentMethod.service";
import { LookupModal } from "../ui/LookupModal";

const schema = z.object({
  order_id: z.string().min(1, "Order is required"),
  payment_method_id: z.string().min(1, "Payment method is required"),
  amount: z.coerce.number().min(0, "Amount must be greater than or equal to 0"),
  status: z.string().min(1, "Status is required"),
  transaction_id: z.string().optional(),
  paid_at: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentToEdit?: Payment | null;
}

export function PaymentFormModal({ isOpen, onClose, paymentToEdit }: PaymentFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!paymentToEdit;

  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [selectedOrderName, setSelectedOrderName] = useState("");

  const [isMethodLookupOpen, setIsMethodLookupOpen] = useState(false);
  const [selectedMethodName, setSelectedMethodName] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      order_id: "",
      payment_method_id: "",
      amount: 0,
      status: "pending",
      transaction_id: "",
      paid_at: "",
    },
  });

  useEffect(() => {
    if (paymentToEdit && isOpen) {
        let paidAt = "";
        if (paymentToEdit.paid_at) {
          // ensure it matches datetime-local
          try {
            paidAt = new Date(paymentToEdit.paid_at).toISOString().slice(0, 16);
          } catch(e) {
            paidAt = paymentToEdit.paid_at;
          }
        }
      reset({
        order_id: paymentToEdit.order_id,
        payment_method_id: paymentToEdit.payment_method_id,
        amount: paymentToEdit.amount,
        status: paymentToEdit.status,
        transaction_id: paymentToEdit.transaction_id || "",
        paid_at: paidAt,
      });
      setSelectedOrderName(paymentToEdit.order_id);
      setSelectedMethodName(paymentToEdit.payment_method_id);
      
      const fetchOrder = async () => {
        try {
          const res = await orderService.getOrder(paymentToEdit.order_id);
          if (res.data) {
            setSelectedOrderName(`Order for User ${res.data.user_id.slice(0, 8)} (${res.data.id.slice(0, 8)})`);
          }
        } catch (e) { }
      };

      const fetchMethod = async () => {
        try {
          const res = await paymentMethodService.getPaymentMethod(paymentToEdit.payment_method_id);
          if (res.data) {
            setSelectedMethodName(res.data.name);
          }
        } catch (e) {}
      };

      fetchOrder();
      fetchMethod();
    } else if (isOpen) {
      reset({
        order_id: "",
        payment_method_id: "",
        amount: 0,
        status: "pending",
        transaction_id: "",
        paid_at: "",
      });
      setSelectedOrderName("");
      setSelectedMethodName("");
    }
  }, [paymentToEdit, isOpen, reset]);

  const createMutation = useMutation({
    mutationFn: (data: PaymentInput) => paymentService.createPayment(data),
    onSuccess: (res) => {
      toast.success(res.message || "Payment created successfully!");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      onClose();
    },
    onError: (error: any) => {
      if (error.response?.data?.data) {
        const validationErrors = error.response.data.data;
        Object.keys(validationErrors).forEach((key) => {
          toast.error(`${key}: ${validationErrors[key][0]}`);
        });
      } else {
        toast.error(error?.response?.data?.message || "Failed to create payment");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<PaymentInput>) => paymentService.updatePayment(paymentToEdit!.id, data),
    onSuccess: (res) => {
      toast.success(res.message || "Payment updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      onClose();
    },
    onError: (error: any) => {
        if (error.response?.data?.data) {
            const validationErrors = error.response.data.data;
            Object.keys(validationErrors).forEach((key) => {
                toast.error(`${key}: ${validationErrors[key][0]}`);
            });
        } else {
            toast.error(error?.response?.data?.message || "Failed to update payment");
        }
    },
  });

  const onSubmit = (data: FormValues) => {
    // Transform paid_at from string to ISO string for backend
    let finalPaidAt = null;
    if (data.paid_at) {
      try {
        finalPaidAt = new Date(data.paid_at).toISOString();
      } catch (e) {
        finalPaidAt = data.paid_at;
      }
    }
    const payload: PaymentInput = {
      order_id: data.order_id,
      payment_method_id: data.payment_method_id,
      amount: data.amount,
      status: data.status,
      transaction_id: data.transaction_id || "",
      paid_at: finalPaidAt,
    };
    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[24px] shadow-premium w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 flex-shrink-0">
          <h2 className="text-lg font-semibold text-text-primary font-poppins">
            {isEditing ? "Edit Payment" : "Add New Payment"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Order
              </label>
              <div className="relative">
                <div 
                  className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors ${errors.order_id ? "border-rose-300 ring-1 ring-rose-200" : "border-gray-200"}`}
                  onClick={() => setIsOrderLookupOpen(true)}
                >
                  <span className={`text-sm font-medium ${selectedOrderName ? "text-text-primary" : "text-gray-400"}`}>
                    {selectedOrderName || "Select an Order"}
                  </span>
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input type="hidden" {...register("order_id")} />
              </div>
              {errors.order_id && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.order_id.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Payment Method
              </label>
              <div className="relative">
                <div 
                  className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors ${errors.payment_method_id ? "border-rose-300 ring-1 ring-rose-200" : "border-gray-200"}`}
                  onClick={() => setIsMethodLookupOpen(true)}
                >
                  <span className={`text-sm font-medium ${selectedMethodName ? "text-text-primary" : "text-gray-400"}`}>
                    {selectedMethodName || "Select a Method"}
                  </span>
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input type="hidden" {...register("payment_method_id")} />
              </div>
              {errors.payment_method_id && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.payment_method_id.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="amount">
                Amount
              </label>
              <input
                id="amount"
                type="number"
                {...register("amount")}
                className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                  errors.amount ? "border-rose-300 ring-rose-200" : "border-gray-200"
                }`}
                placeholder="e.g. 1250000"
              />
              {errors.amount && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.amount.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                {errors.status && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.status.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="transaction_id">
                  Transaction ID
                </label>
                <input
                  id="transaction_id"
                  {...register("transaction_id")}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium ${
                    errors.transaction_id ? "border-rose-300 ring-rose-200" : "border-gray-200"
                  }`}
                  placeholder="e.g. TRX-12345"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5" htmlFor="paid_at">
                Paid At (Optional)
              </label>
              <input
                id="paid_at"
                type="datetime-local"
                {...register("paid_at")}
                className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all duration-300 text-sm font-medium`}
              />
              <p className="mt-1 text-xs text-text-secondary">Leave blank if pending or cancelled.</p>
            </div>
          </form>
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
            form="payment-form"
            disabled={isPending}
            className="px-5 py-2.5 bg-primary-blue hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-70 flex items-center"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Payment"}
          </button>
        </div>
      </div>
      <LookupModal<Order>
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
        onSelect={(order) => {
          setValue("order_id", order.id, { shouldValidate: true });
          // Automatically set amount from order to make things easier
          setValue("amount", order.total_amount, { shouldValidate: true });
          setSelectedOrderName(`Order User ID: ${order.user_id.slice(0, 8)} (${order.id.slice(0, 8)})`);
        }}
        title="Select Order"
        queryKey="orders"
        queryFn={orderService.getOrders}
        columns={[
          { header: "Order ID", accessor: "id", sortable: false, render: (ord) => ord.id.slice(0, 8) + '...' },
          { header: "User ID", accessor: "user_id", sortable: false, render: (ord) => ord.user_id.slice(0, 8) + '...' },
          { header: "Total Amount", accessor: "total_amount", sortable: true },
          { header: "Status", accessor: "status", sortable: true },
        ]}
        searchPlaceholder="Search order status..."
      />
      
      <LookupModal<PaymentMethod>
        isOpen={isMethodLookupOpen}
        onClose={() => setIsMethodLookupOpen(false)}
        onSelect={(method) => {
          setValue("payment_method_id", method.id, { shouldValidate: true });
          setSelectedMethodName(method.name);
        }}
        title="Select Payment Method"
        queryKey="payment-methods"
        queryFn={paymentMethodService.getPaymentMethods}
        columns={[
          { header: "Name", accessor: "name", sortable: true },
        ]}
        searchPlaceholder="Search method name..."
      />
    </div>
  );
}
