import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Edit2, Trash2, Loader2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

import { Layout } from "../components/Layout";
import { paymentService, PaymentsQueryParams, Payment } from "../services/payment.service";
import { PaymentFormModal } from "../components/payments/PaymentFormModal";
import { useTableState } from "../hooks/useTableState";
import { PageHeader } from "../components/ui/PageHeader";
import { TableToolbar } from "../components/ui/TableToolbar";
import { CommonTable } from "../components/ui/CommonTable";
import { TableSortHeader } from "../components/ui/TableSortHeader";
import { useNavigate } from "react-router-dom";

export function Payments() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    page,
    perPage,
    sortBy,
    order,
    searchQuery,
    debouncedSearch,
    setPage,
    setPerPage,
    setSearchQuery,
    handleSort
  } = useTableState<PaymentsQueryParams["sort_by"]>("created_at", "desc");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["payments", { page, per_page: perPage, sort_by: sortBy, order, q: debouncedSearch }],
    queryFn: () => paymentService.getPayments({
      page,
      per_page: perPage,
      sort_by: sortBy,
      order,
      ...(debouncedSearch ? { q: debouncedSearch } : {})
    }),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentService.deletePayment(id),
    onSuccess: (res) => {
      toast.success(res.message || "Payment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete payment");
    }
  });

  const actions = {
    create: () => {
      setSelectedPayment(null);
      setIsFormOpen(true);
    },
    edit: (payment: Payment) => {
      setSelectedPayment(payment);
      setIsFormOpen(true);
    },
    delete: (payment: Payment) => {
      if (window.confirm(`Are you sure you want to delete this payment?`)) {
        deleteMutation.mutate(payment.id);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid':
      case 'completed':
      case 'success':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'failed':
      case 'cancelled':
      case 'refunded':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Payments"
        description="Manage transactions and payments."
        icon={CreditCard}
        actionButtonLabel="Add Payment"
        onAction={actions.create}
      />

      <div className="bg-white rounded-[24px] shadow-premium overflow-hidden border border-gray-50 flex flex-col min-h-[500px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-50 gap-4">
          <div className="w-full sm:w-96">
            <TableToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              perPage={perPage}
              onPerPageChange={setPerPage}
              searchPlaceholder="Search TRX ID or status..."
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
               onClick={() => navigate('/payment-methods')}
               className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center whitespace-nowrap"
            >
              Manage Payment Methods
              <ArrowRight className="w-4 h-4 ml-2 text-gray-400" />
            </button>
          </div>
        </div>

        <CommonTable
          isLoading={isLoading}
          isError={isError}
          items={data?.data?.data || []}
          pagination={data?.data ? {
            current_page: data.data.current_page,
            last_page: data.data.last_page,
            from: data.data.from,
            to: data.data.to,
            total: data.data.total
          } : undefined}
          onPageChange={setPage}
        >
          <thead>
            <tr className="bg-gray-50/50">
              <TableSortHeader label="Transaction ID" column="transaction_id" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
              <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">Order ID</th>
              <TableSortHeader label="Amount" column="amount" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
              <TableSortHeader label="Date" column="created_at" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
              <TableSortHeader label="Status" column="status" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
              <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {data?.data?.data?.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4 px-6 font-medium text-text-secondary font-mono text-xs">
                  {payment.transaction_id || "-"}
                </td>
                <td className="py-4 px-6 text-text-secondary font-mono text-xs">
                  {payment.order_id ? payment.order_id.slice(0, 8) + '...' : "-"}
                </td>
                <td className="py-4 px-6 font-semibold text-text-primary">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payment.amount)}
                </td>
                <td className="py-4 px-6 text-text-secondary">
                  {payment.created_at ? format(new Date(payment.created_at), "MMM dd, yyyy HH:mm") : "-"}
                  {payment.paid_at && (
                     <div className="text-xs text-gray-400 mt-0.5">Paid: {format(new Date(payment.paid_at), "HH:mm")}</div>
                  )}
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  <button 
                    onClick={() => actions.edit(payment)}
                    className="text-gray-400 hover:text-primary-blue transition-colors p-2 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 inline-flex"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => actions.delete(payment)}
                    disabled={deleteMutation.isPending && deleteMutation.variables === payment.id}
                    className="text-gray-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500/30 inline-flex disabled:opacity-50"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === payment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </CommonTable>
      </div>

      <PaymentFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        paymentToEdit={selectedPayment} 
      />
    </Layout>
  );
}
