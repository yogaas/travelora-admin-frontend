import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Edit2, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { Layout } from "../components/Layout";
import { destinationService, DestinationsQueryParams, Destination } from "../services/destination.service";
import { DestinationFormModal } from "../components/destinations/DestinationFormModal";
import { CommonTable } from "../components/ui/CommonTable";
import { TableSortHeader } from "../components/ui/TableSortHeader";
import { DeleteModal } from "../components/ui/DeleteModal";
import { PreviewModal } from "../components/ui/PreviewModal";
import { useTableState } from "../hooks/useTableState";
import { PageHeader } from "../components/ui/PageHeader";
import { TableToolbar } from "../components/ui/TableToolbar";

export function Destinations() {
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
  } = useTableState<DestinationsQueryParams["sort_by"]>("created_at", "desc");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["destinations", { page, per_page: perPage, sort_by: sortBy, order, q: debouncedSearch }],
    queryFn: () => destinationService.getDestinations({
      page,
      per_page: perPage,
      sort_by: sortBy,
      order,
      ...(debouncedSearch ? { q: debouncedSearch } : {})
    }),
    placeholderData: (previousData) => previousData,
  });

  const { data: previewData, isLoading: isPreviewLoading } = useQuery({
    queryKey: ["destination", selectedDestination?.id],
    queryFn: () => destinationService.getDestination(selectedDestination!.id),
    enabled: !!selectedDestination?.id && isPreviewOpen,
  });

  const actions = {
    create: () => {
      setSelectedDestination(null);
      setIsFormOpen(true);
    },
    edit: (item: Destination) => {
      setSelectedDestination(item);
      setIsFormOpen(true);
    },
    delete: (item: Destination) => {
      setSelectedDestination(item);
      setIsDeleteOpen(true);
    },
    preview: (item: Destination) => {
        setSelectedDestination(item);
        setIsPreviewOpen(true);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Destinations"
        description="Manage all available travel destinations."
        icon={MapPin}
        actionButtonLabel="Add Destination"
        onAction={actions.create}
      />

      <div className="bg-white rounded-[24px] shadow-premium overflow-hidden border border-gray-50 flex flex-col min-h-[500px]">
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          perPage={perPage}
          onPerPageChange={setPerPage}
          searchPlaceholder="Search name, slug..."
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
                <TableSortHeader label="Name" column="name" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
                <TableSortHeader label="Slug" column="slug" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
                <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <TableSortHeader label="Created At" column="created_at" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
                <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
                {data?.data?.data?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-4 px-6 font-semibold text-text-primary">{item.name}</td>
                        <td className="py-4 px-6 font-medium text-text-secondary">{item.slug}</td>
                        <td className="py-4 px-6">
                            {item.is_featured ? (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">Featured</span>
                            ) : (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-600 ring-1 ring-gray-500/20">Standard</span>
                            )}
                        </td>
                        <td className="py-4 px-6 text-text-secondary">
                        {item.created_at ? format(new Date(item.created_at), "MMM dd, yyyy") : "-"}
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                        <button 
                            onClick={() => actions.preview(item)}
                            className="text-gray-400 hover:text-emerald-500 transition-colors p-2 rounded-lg hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 inline-flex"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => actions.edit(item)}
                            className="text-gray-400 hover:text-primary-blue transition-colors p-2 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 inline-flex"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => actions.delete(item)}
                            className="text-gray-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500/30 inline-flex"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </CommonTable>
      </div>

      <DestinationFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        destinationToEdit={selectedDestination} 
      />

      <DeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Destination"
        description={`Are you sure you want to delete ${selectedDestination?.name}?`}
        onDelete={() => destinationService.deleteDestination(selectedDestination!.id)}
        queryKeyToInvalidate="destinations"
      />

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Destination"
        data={previewData}
        isLoading={isPreviewLoading}
      />
    </Layout>
  );
}
