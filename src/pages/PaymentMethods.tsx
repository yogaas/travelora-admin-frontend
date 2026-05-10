import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Edit2, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

import { Layout } from "../components/Layout";
import { paymentMethodService, PaymentMethodsQueryParams, PaymentMethod } from "../services/paymentMethod.service";
import { PaymentMethodFormModal } from "../components/payments/PaymentMethodFormModal";
import { useTableState } from "../hooks/useTableState";
import { PageHeader } from "../components/ui/PageHeader";
import { TableToolbar } from "../components/ui/TableToolbar";
import { CommonTable } from "../components/ui/CommonTable";
import { TableSortHeader } from "../components/ui/TableSortHeader";

export function PaymentMethods() {
  const queryClient = useQueryClient();
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
  } = useTableState<PaymentMethodsQueryParams["sort_by"]>("created_at", "desc");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["payment-methods", { page, per_page: perPage, sort_by: sortBy, order, q: debouncedSearch }],
    queryFn: () => paymentMethodService.getPaymentMethods({
      page,
      per_page: perPage,
      sort_by: sortBy,
      order,
      ...(debouncedSearch ? { q: debouncedSearch } : {})
    }),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentMethodService.deletePaymentMethod(id),
    onSuccess: (res) => {
      toast.success(res.message || "Payment method deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete payment method");
    }
  });

  const actions = {
    create: () => {
      setSelectedMethod(null);
      setIsFormOpen(true);
    },
    edit: (method: PaymentMethod) => {
      setSelectedMethod(method);
      setIsFormOpen(true);
    },
    delete: (method: PaymentMethod) => {
      if (window.confirm(`Are you sure you want to delete "${method.name}"?`)) {
        deleteMutation.mutate(method.id);
      }
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Payment Methods"
        description="Manage payment options available for users."
        icon={CreditCard}
        actionButtonLabel="Add Method"
        onAction={actions.create}
      />

      <div className="bg-white rounded-[24px] shadow-premium overflow-hidden border border-gray-50 flex flex-col min-h-[500px]">
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          perPage={perPage}
          onPerPageChange={setPerPage}
          searchPlaceholder="Search method name..."
        />

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
              <TableSortHeader label="Method Name" column="name" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
              <TableSortHeader label="Created At" column="created_at" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
              <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {data?.data?.data?.map((method) => (
              <tr key={method.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4 px-6 font-medium text-text-secondary">
                  {method.name}
                </td>
                <td className="py-4 px-6 text-text-secondary">
                  {method.created_at ? format(new Date(method.created_at), "MMM dd, yyyy") : "-"}
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  <button 
                    onClick={() => actions.edit(method)}
                    className="text-gray-400 hover:text-primary-blue transition-colors p-2 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 inline-flex"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => actions.delete(method)}
                    disabled={deleteMutation.isPending && deleteMutation.variables === method.id}
                    className="text-gray-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500/30 inline-flex disabled:opacity-50"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === method.id ? (
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

      <PaymentMethodFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        methodToEdit={selectedMethod} 
      />
    </Layout>
  );
}
