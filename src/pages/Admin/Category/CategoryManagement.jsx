import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FolderTree,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
} from "lucide-react";
import {
  getCategoriesRequest,
  deleteCategoryRequest,
  getCategoryStatsRequest,
} from "../../../redux/actions/categoryActions";
import CreateCategory from "./CreateCategory";
import UpdateCategory from "./UpdateCategory";
import ReadCategory from "./ReadCategory";
import DeleteCategory from "./DeleteCategory";
import Loading from "../../../components/Loading/Loading";


const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden ${className}`}>{children}</div>
);


const CardHeader = ({ children, className = "" }) => (
  <div className={`px-5 py-4 border-b border-gray-100 ${className}`}>{children}</div>
);


const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-base font-semibold text-gray-800 ${className}`}>{children}</h3>
);


const CardContent = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);


const CategoryManagement = () => {
  const dispatch = useDispatch();
  const {
    categories,
    categoriesLoading,
    categoriesPagination,
    categoryStats,
    createCategoryLoading,
    updateCategoryLoading,
    deleteCategoryLoading,
    createCategoryError,
    updateCategoryError,
    deleteCategoryError,
  } = useSelector((state) => state.category);


  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, true, false
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [prevCreateLoading, setPrevCreateLoading] = useState(false);
  const [prevUpdateLoading, setPrevUpdateLoading] = useState(false);
  const [prevDeleteLoading, setPrevDeleteLoading] = useState(false);


  // Fetch categories and stats on mount
  useEffect(() => {
    dispatch(getCategoriesRequest({ page: currentPage, limit: 10, sortBy, sortOrder }));
    dispatch(getCategoryStatsRequest());
  }, [dispatch]);


  // Fetch categories when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined,
      status: filterStatus !== "all" ? filterStatus : undefined,
      sortBy,
      sortOrder,
    };
    dispatch(getCategoriesRequest(params));
  }, [dispatch, currentPage, searchTerm, filterStatus, sortBy, sortOrder]);


  // Auto refresh after successful create
  useEffect(() => {
    if (prevCreateLoading && !createCategoryLoading && !createCategoryError) {
// Create was just completed successfully
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        sortBy,
        sortOrder,
      };
      dispatch(getCategoriesRequest(params));
      dispatch(getCategoryStatsRequest());
    }
    setPrevCreateLoading(createCategoryLoading);
  }, [dispatch, createCategoryLoading, createCategoryError, prevCreateLoading, currentPage, searchTerm, filterStatus, sortBy, sortOrder]);


  // Auto refresh after successful update
  useEffect(() => {
    if (prevUpdateLoading && !updateCategoryLoading && !updateCategoryError) {
      // Update was just completed successfully
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        sortBy,
        sortOrder,
      };
      dispatch(getCategoriesRequest(params));
      dispatch(getCategoryStatsRequest());
    }
    setPrevUpdateLoading(updateCategoryLoading);
  }, [dispatch, updateCategoryLoading, updateCategoryError, prevUpdateLoading, currentPage, searchTerm, filterStatus, sortBy, sortOrder]);


  // Auto refresh after successful delete
  useEffect(() => {
    if (prevDeleteLoading && !deleteCategoryLoading && !deleteCategoryError) {
      // Delete was just completed successfully
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        sortBy,
        sortOrder,
      };
      dispatch(getCategoriesRequest(params));
      dispatch(getCategoryStatsRequest());
    }
    setPrevDeleteLoading(deleteCategoryLoading);
  }, [dispatch, deleteCategoryLoading, deleteCategoryError, prevDeleteLoading, currentPage, searchTerm, filterStatus, sortBy, sortOrder]);


  const handleAddCategory = () => {
    setShowCreateModal(true);
  };


  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowUpdateModal(true);
  };


  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setShowReadModal(true);
  };


  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };


  // Use stats from API
  const stats = {
    total: categoryStats?.total || 0,
    active: categoryStats?.active || 0,
    inactive: categoryStats?.hidden || 0,
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <FolderTree size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Category management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage product categories</p>
          </div>
        </div>
        <button
          onClick={handleAddCategory}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-sm hover:shadow font-medium transition-all"
        >
          <Plus size={18} />
          <span>Add category</span>
        </button>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Total</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FolderTree size={22} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-700/80">Active</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.active}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle size={22} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-red-200/60 bg-red-50/40 p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-red-700/80">Inactive</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <XCircle size={22} />
            </div>
          </div>
        </div>
      </div>


      {/* Filters and Search */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Search & filters</p>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by category name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                <option value="all">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                <option value="createdAt">Created date</option>
                <option value="name">Name</option>
                <option value="updatedAt">Updated date</option>
                <option value="status">Status</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Categories Table */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle>Category list ({categoriesPagination?.total || categories.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {categoriesLoading || createCategoryLoading || updateCategoryLoading || deleteCategoryLoading ? (
            <Loading message="Loading data..." />
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <FolderTree size={28} />
              </div>
              <p className="text-sm font-medium text-gray-600">No categories found</p>
              <p className="mt-1 text-xs text-gray-500">Try adjusting search or filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Category</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Description</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map((category) => (
                      <tr key={category._id} className="transition-colors hover:bg-gray-50/80">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {category.image ? (
                              <img src={category.image} alt={category.name} className="h-10 w-10 rounded-xl object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                                <FolderTree size={18} />
                              </div>
                            )}
                            <span className="font-medium text-gray-900">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 max-w-xs truncate">{category.description || "—"}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${category.status ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                            {category.status ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            {category.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleViewCategory(category)} className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700" title="View"><Eye size={18} /></button>
                            <button onClick={() => handleEditCategory(category)} className="rounded-xl p-2 text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700" title="Edit"><Edit size={18} /></button>
                            <button onClick={() => handleDeleteCategory(category)} className="rounded-xl p-2 text-red-600 transition hover:bg-red-50 hover:text-red-700" title="Delete"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {categoriesPagination && categoriesPagination.totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    Showing {categoriesPagination.page * categoriesPagination.limit - categoriesPagination.limit + 1}–{Math.min(categoriesPagination.page * categoriesPagination.limit, categoriesPagination.total)} of {categoriesPagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50">Previous</button>
                    {[...Array(categoriesPagination.totalPages)].map((_, i) => (
                      <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`min-w-[2.25rem] rounded-xl px-3 py-2 text-sm font-medium transition ${currentPage === i + 1 ? "bg-emerald-600 text-white shadow-sm" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>{i + 1}</button>
                    ))}
                    <button onClick={() => setCurrentPage((p) => Math.min(categoriesPagination.totalPages, p + 1))} disabled={currentPage === categoriesPagination.totalPages} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>


      {/* Create Category Modal */}
      <CreateCategory isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />


      {/* Update Category Modal */}
      <UpdateCategory
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />


      {/* Read Category Modal */}
      <ReadCategory
        isOpen={showReadModal}
        onClose={() => {
          setShowReadModal(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />


      {/* Delete Category Modal */}
      <DeleteCategory
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSuccess={() => {
          const params = {
            page: currentPage,
            limit: 10,
            search: searchTerm || undefined,
            status: filterStatus !== "all" ? filterStatus : undefined,
            sortBy,
            sortOrder,
          };
          dispatch(getCategoriesRequest(params));
          dispatch(getCategoryStatsRequest());
        }}
      />
    </div>
  );
};


export default CategoryManagement;


