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
import Loading from "../../../components/Loading/Loading";

// Simple Card component
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={className}>{children}</h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
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

  const handleDeleteCategory = (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    dispatch(deleteCategoryRequest(id));
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Category management</h1>
          <p className="text-gray-600 mt-1">Manage product categories</p>
        </div>
        <button
          onClick={handleAddCategory}
className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={18} />
          <span>Add category</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total categories</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <FolderTree className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by category name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
<option value="all">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="createdAt">Created date</option>
                <option value="name">Name</option>
                <option value="updatedAt">Updated date</option>
                <option value="status">Status</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Category list ({categoriesPagination?.total || categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {categoriesLoading || createCategoryLoading || updateCategoryLoading || deleteCategoryLoading ? (
            <Loading message="Loading data..." />
          ) : categories.length === 0 ? (
            <div className="p-8 text-center">
              <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No categories found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="h-10 w-10 rounded-lg object-cover mr-3"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                                <FolderTree size={20} className="text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{category.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-500 truncate max-w-md">
                            {category.description || "No description"}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              category.status
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {category.status ? (
                              <>
                                <CheckCircle size={14} className="mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle size={14} className="mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewCategory(category)}
className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              title="View details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {categoriesPagination && categoriesPagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {categoriesPagination.page * categoriesPagination.limit - categoriesPagination.limit + 1} -{" "}
                    {Math.min(categoriesPagination.page * categoriesPagination.limit, categoriesPagination.total)} of{" "}
                    {categoriesPagination.total} categories
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(categoriesPagination.totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 border rounded-lg ${
                          currentPage === index + 1
                            ? "bg-green-600 text-white border-green-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
onClick={() => setCurrentPage((prev) => Math.min(categoriesPagination.totalPages, prev + 1))}
                      disabled={currentPage === categoriesPagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
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
    </div>
  );
};

export default CategoryManagement;