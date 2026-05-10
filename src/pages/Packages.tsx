import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Map, Edit2, Trash2, Eye, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Layout } from "../components/Layout";
import { packageService, PackagesQueryParams, Package } from "../services/package.service";
import { PackageFormModal } from "../components/packages/PackageFormModal";
import { PackageReviewsModal } from "../components/packages/PackageReviewsModal";
import { CommonTable } from "../components/ui/CommonTable";
import { TableSortHeader } from "../components/ui/TableSortHeader";
import { DeleteModal } from "../components/ui/DeleteModal";
import { useTableState } from "../hooks/useTableState";
import { PageHeader } from "../components/ui/PageHeader";
import { TableToolbar } from "../components/ui/TableToolbar";

export function Packages() {
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
  } = useTableState<PackagesQueryParams["sort_by"]>("created_at", "desc");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["packages", { page, per_page: perPage, sort_by: sortBy, order, q: debouncedSearch }],
    queryFn: () => packageService.getPackages({
      page,
      per_page: perPage,
      sort_by: sortBy,
      order,
      ...(debouncedSearch ? { q: debouncedSearch } : {})
    }),
    placeholderData: (previousData) => previousData,
  });

  const actions = {
    create: () => {
      setSelectedPackage(null);
      setIsFormOpen(true);
    },
    edit: (item: Package) => {
      setSelectedPackage(item);
      setIsFormOpen(true);
    },
    delete: (item: Package) => {
      setSelectedPackage(item);
      setIsDeleteOpen(true);
    },
    preview: (item: Package) => {
        setSelectedPackage(item);
        setIsPreviewOpen(true);
    },
    reviews: (item: Package) => {
        setSelectedPackage(item);
        setIsReviewsOpen(true);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Tour Packages"
        description="Manage all travel packages and variants."
        icon={Map}
        actionButtonLabel="Add Package"
        onAction={actions.create}
      />

      <div className="bg-white rounded-[24px] shadow-premium overflow-hidden border border-gray-50 flex flex-col min-h-[500px]">
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          perPage={perPage}
          onPerPageChange={setPerPage}
          searchPlaceholder="Search packages..."
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
                <TableSortHeader label="Package Name" column="name" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
                <TableSortHeader label="Duration" column="duration" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
                <TableSortHeader label="Price" column="price" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
                <TableSortHeader label="Start Date" column="start_date" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
                <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
                {data?.data?.data?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-4 px-6">
                            <span className="font-semibold text-text-primary block">{item.name}</span>
                            {item.destination?.name && <span className="text-xs text-text-secondary">{item.destination.name}</span>}
                        </td>
                        <td className="py-4 px-6 font-medium text-text-secondary">{item.duration} Days</td>
                        <td className="py-4 px-6 font-semibold text-emerald-600">${item.price?.toLocaleString()}</td>
                        <td className="py-4 px-6 text-text-secondary">{item.start_date ? format(new Date(item.start_date), "MMM dd, yyyy") : "-"}</td>
                        <td className="py-4 px-6">
                            {item.is_featured ? (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-500/20">Featured</span>
                            ) : (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-600 ring-1 ring-gray-500/20">Standard</span>
                            )}
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                        <button 
                            onClick={() => actions.preview(item)}
                            className="text-gray-400 hover:text-emerald-500 transition-colors p-2 rounded-lg hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 inline-flex"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => actions.reviews(item)}
                            className="text-gray-400 hover:text-purple-500 transition-colors p-2 rounded-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 inline-flex"
                        >
                            <MessageSquare className="w-4 h-4" />
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

      <PackageFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        packageToEdit={selectedPackage} 
      />

      <DeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Package"
        description={`Are you sure you want to delete ${selectedPackage?.name}?`}
        onDelete={() => packageService.deletePackage(selectedPackage!.id)}
        queryKeyToInvalidate="packages"
      />

      <PackageFormModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        packageToEdit={selectedPackage}
        isViewMode={true}
      />

      <PackageReviewsModal
        isOpen={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
        packageId={selectedPackage?.id}
        packageName={selectedPackage?.name}
      />
    </Layout>
  );
}
