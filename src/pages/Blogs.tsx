import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Edit2, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { Layout } from "../components/Layout";
import { blogService, BlogsQueryParams, Blog } from "../services/blog.service";
import { BlogFormModal } from "../components/blogs/BlogFormModal";
import { CommonTable } from "../components/ui/CommonTable";
import { TableSortHeader } from "../components/ui/TableSortHeader";
import { DeleteModal } from "../components/ui/DeleteModal";
import { PreviewModal } from "../components/ui/PreviewModal";
import { useTableState } from "../hooks/useTableState";
import { PageHeader } from "../components/ui/PageHeader";
import { TableToolbar } from "../components/ui/TableToolbar";

export function Blogs() {
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
  } = useTableState<BlogsQueryParams["sort_by"]>("created_at", "desc");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["blogs", { page, per_page: perPage, sort_by: sortBy, order, q: debouncedSearch }],
    queryFn: () => blogService.getBlogs({
      page,
      per_page: perPage,
      sort_by: sortBy,
      order,
      ...(debouncedSearch ? { q: debouncedSearch } : {})
    }),
    placeholderData: (previousData) => previousData,
  });

  const { data: previewData, isLoading: isPreviewLoading } = useQuery({
    queryKey: ["blog", selectedBlog?.id],
    queryFn: () => blogService.getBlog(selectedBlog!.id),
    enabled: !!selectedBlog?.id && isPreviewOpen,
  });

  const actions = {
    create: () => {
      setSelectedBlog(null);
      setIsFormOpen(true);
    },
    edit: (item: Blog) => {
      setSelectedBlog(item);
      setIsFormOpen(true);
    },
    delete: (item: Blog) => {
      setSelectedBlog(item);
      setIsDeleteOpen(true);
    },
    preview: (item: Blog) => {
        setSelectedBlog(item);
        setIsPreviewOpen(true);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Blog Posts"
        description="Manage articles, news, and SEO content."
        icon={FileText}
        actionButtonLabel="Write Post"
        onAction={actions.create}
      />

      <div className="bg-white rounded-[24px] shadow-premium overflow-hidden border border-gray-50 flex flex-col min-h-[500px]">
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          perPage={perPage}
          onPerPageChange={setPerPage}
          searchPlaceholder="Search title, slug..."
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
                <TableSortHeader label="Title" column="title" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
                <TableSortHeader label="Slug" column="slug" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
                <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <TableSortHeader label="Published" column="published_at" currentSort={sortBy!} currentOrder={order!} onSort={handleSort} />
                <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
                {data?.data?.data?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-4 px-6 font-semibold text-text-primary truncate max-w-[200px]">{item.title}</td>
                        <td className="py-4 px-6 font-medium text-text-secondary truncate max-w-[150px]">{item.slug}</td>
                        <td className="py-4 px-6">
                            {item.is_published ? (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">Published</span>
                            ) : (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">Draft</span>
                            )}
                        </td>
                        <td className="py-4 px-6 text-text-secondary">
                        {item.published_at ? format(new Date(item.published_at), "MMM dd, yyyy") : "-"}
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

      <BlogFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        blogToEdit={selectedBlog} 
      />

      <DeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Post"
        description={`Are you sure you want to delete "${selectedBlog?.title}"?`}
        onDelete={() => blogService.deleteBlog(selectedBlog!.id)}
        queryKeyToInvalidate="blogs"
      />

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Blog Post"
        data={previewData}
        isLoading={isPreviewLoading}
      />
    </Layout>
  );
}
