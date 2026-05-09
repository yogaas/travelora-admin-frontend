import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Edit2, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

import { Layout } from "../components/Layout";
import { orderService, OrdersQueryParams, Order } from "../services/order.service";
import { OrderFormModal } from "../components/orders/OrderFormModal";
import { useTableState } from "../hooks/useTableState";
import { PageHeader } from "../components/ui/PageHeader";
import { TableToolbar } from "../components/ui/TableToolbar";
import { CommonTable } from "../components/ui/CommonTable";
import { TableSortHeader } from "../components/ui/TableSortHeader";

export function Orders() {
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
  } = useTableState<OrdersQueryParams["sort_by"]>("created_at", "desc");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", { page, per_page: perPage, sort_by: sortBy, order, q: debouncedSearch }],
    queryFn: () => orderService.getOrders({
      page,
      per_page: perPage,
      sort_by: sortBy,
      order,
      ...(debouncedSearch ? { q: debouncedSearch } : {})
    }),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orderService.deleteOrder(id),
    onSuccess: (res) => {
      toast.success(res.message || "Order deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  });

  const actions = {
    create: () => {
      setSelectedOrder(null);
      setIsFormOpen(true);
    },
    edit: (order: Order) => {
      setSelectedOrder(order);
      setIsFormOpen(true);
    },
    delete: (ord: Order) => {
      if (window.confirm(`Are you sure you want to delete this order?`)) {
        deleteMutation.mutate(ord.id);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
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
        title="Orders"
        description="Manage customer orders and payments."
        icon={CreditCard}
        actionButtonLabel="Add Order"
        onAction={actions.create}
      />

      <div className="bg-white rounded-[24px] shadow-premium overflow-hidden border border-gray-50 flex flex-col min-h-[500px]">
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          perPage={perPage}
          onPerPageChange={setPerPage}
          searchPlaceholder="Search by status..."
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
              <TableSortHeader label="Created At" column="created_at" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
              <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">User ID</th>
              <TableSortHeader label="Total Amount" column="total_amount" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
              <TableSortHeader label="Status" column="status" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
              <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {data?.data?.data?.map((ord) => (
              <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4 px-6 text-text-secondary">
                  {ord.created_at ? format(new Date(ord.created_at), "MMM dd, yyyy HH:mm") : "-"}
                </td>
                <td className="py-4 px-6 font-medium text-text-secondary font-mono text-xs">
                  {ord.user_id}
                </td>
                <td className="py-4 px-6 font-semibold text-text-primary">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(ord.total_amount)}
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getStatusColor(ord.status)}`}>
                    {ord.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  <button 
                    onClick={() => actions.edit(ord)}
                    className="text-gray-400 hover:text-primary-blue transition-colors p-2 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 inline-flex"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => actions.delete(ord)}
                    disabled={deleteMutation.isPending && deleteMutation.variables === ord.id}
                    className="text-gray-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500/30 inline-flex disabled:opacity-50"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === ord.id ? (
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

      <OrderFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        orderToEdit={selectedOrder} 
      />
    </Layout>
  );
}
