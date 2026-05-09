import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderHeart, Edit2, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

import { Layout } from "../components/Layout";
import { blogCategoryService, BlogCategoriesQueryParams, BlogCategory } from "../services/blogCategory.service";
import { BlogCategoryFormModal } from "../components/blogs/BlogCategoryFormModal";
import { useTableState } from "../hooks/useTableState";
import { PageHeader } from "../components/ui/PageHeader";
import { TableToolbar } from "../components/ui/TableToolbar";
import { CommonTable } from "../components/ui/CommonTable";
import { TableSortHeader } from "../components/ui/TableSortHeader";

export function BlogCategories() {
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
  } = useTableState<BlogCategoriesQueryParams["sort_by"]>("created_at", "desc");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["blog-categories", { page, per_page: perPage, sort_by: sortBy, order, q: debouncedSearch }],
    queryFn: () => blogCategoryService.getCategories({
      page,
      per_page: perPage,
      sort_by: sortBy,
      order,
      ...(debouncedSearch ? { q: debouncedSearch } : {})
    }),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogCategoryService.deleteCategory(id),
    onSuccess: (res) => {
      toast.success(res.message || "Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  });

  const actions = {
    create: () => {
      setSelectedCategory(null);
      setIsFormOpen(true);
    },
    edit: (category: BlogCategory) => {
      setSelectedCategory(category);
      setIsFormOpen(true);
    },
    delete: (category: BlogCategory) => {
      if (window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
        deleteMutation.mutate(category.id);
      }
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Blog Categories"
        description="Manage categories for your blog posts."
        icon={FolderHeart}
        actionButtonLabel="Add Category"
        onAction={actions.create}
      />

      <div className="bg-white rounded-[24px] shadow-premium overflow-hidden border border-gray-50 flex flex-col min-h-[500px]">
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          perPage={perPage}
          onPerPageChange={setPerPage}
          searchPlaceholder="Search category name or slug..."
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
              <TableSortHeader label="Category Name" column="name" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
              <TableSortHeader label="Slug" column="slug" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
              <TableSortHeader label="Created At" column="created_at" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
              <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {data?.data?.data?.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4 px-6 font-medium text-text-secondary">
                  {category.name}
                </td>
                <td className="py-4 px-6 text-text-secondary">
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-mono text-xs">
                    {category.slug}
                  </span>
                </td>
                <td className="py-4 px-6 text-text-secondary">
                  {category.created_at ? format(new Date(category.created_at), "MMM dd, yyyy") : "-"}
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  <button 
                    onClick={() => actions.edit(category)}
                    className="text-gray-400 hover:text-primary-blue transition-colors p-2 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 inline-flex"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => actions.delete(category)}
                    disabled={deleteMutation.isPending && deleteMutation.variables === category.id}
                    className="text-gray-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500/30 inline-flex disabled:opacity-50"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === category.id ? (
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

      <BlogCategoryFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        categoryToEdit={selectedCategory} 
      />
    </Layout>
  );
}
