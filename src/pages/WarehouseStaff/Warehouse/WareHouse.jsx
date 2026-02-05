import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Package,
  Search,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Filter,
  Upload,
  Eye,
} from "lucide-react";
import {
  getProductsRequest,
  getProductStatsRequest,
} from "../../../redux/actions/productActions";
import { getCategoriesRequest } from "../../../redux/actions/categoryActions";
import ReadProduct from "./ReadProduct";
import CreateReceipt from "./CreateReceipt";
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

const WareHouse = () => {
  const dispatch = useDispatch();
  const {
    products,
    productsLoading,
    productsPagination,
    productStats,
  } = useSelector((state) => state.product);
  
  const { categories } = useSelector((state) => state.category);
  const { createReceiptLoading, createReceiptError } = useSelector((state) => state.inventory);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStockStatus, setFilterStockStatus] = useState("all"); // all, IN_STOCK, OUT_OF_STOCK
  const [filterReceivingStatus, setFilterReceivingStatus] = useState("all"); // all, NOT_RECEIVED, PARTIAL, RECEIVED
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showReadModal, setShowReadModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductForReceipt, setSelectedProductForReceipt] = useState(null);
  const [prevCreateReceiptLoading, setPrevCreateReceiptLoading] = useState(false);

  // Fetch products, categories and stats on mount
  useEffect(() => {
    dispatch(getProductsRequest({ page: currentPage, limit: 10, sortBy, sortOrder }));
    dispatch(getCategoriesRequest({ page: 1, limit: 100 }));
    dispatch(getProductStatsRequest());
  }, [dispatch]);

  // Fetch products when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined,
      stockStatus: filterStockStatus !== "all" ? filterStockStatus : undefined,
      receivingStatus: filterReceivingStatus !== "all" ? filterReceivingStatus : undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      sortBy,
      sortOrder,
    };
    dispatch(getProductsRequest(params));
  }, [dispatch, currentPage, searchTerm, filterStockStatus, filterReceivingStatus, selectedCategory, sortBy, sortOrder]);

  // Auto refresh after successful create receipt
  useEffect(() => {
    if (prevCreateReceiptLoading && !createReceiptLoading && !createReceiptError) {
      // Create receipt was just completed successfully
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        stockStatus: filterStockStatus !== "all" ? filterStockStatus : undefined,
        receivingStatus: filterReceivingStatus !== "all" ? filterReceivingStatus : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        sortBy,
        sortOrder,
      };
      dispatch(getProductsRequest(params));
      dispatch(getProductStatsRequest());
    }
    setPrevCreateReceiptLoading(createReceiptLoading);
  }, [dispatch, createReceiptLoading, createReceiptError, prevCreateReceiptLoading, currentPage, searchTerm, filterStockStatus, filterReceivingStatus, selectedCategory, sortBy, sortOrder]);


  const getStockStatus = (product) => {
    if (product.stockStatus === "OUT_OF_STOCK" || product.onHandQuantity === 0) {
      return { label: "Out of stock", color: "bg-red-100 text-red-800", icon: AlertCircle };
    }
    if (product.onHandQuantity <= 10) {
      return { label: "Low stock", color: "bg-yellow-100 text-yellow-800", icon: TrendingDown };
    }
    return { label: "In stock", color: "bg-green-100 text-green-800", icon: CheckCircle };
  };

  const getReceivingStatus = (product) => {
    switch (product.receivingStatus) {
      case "NOT_RECEIVED":
        return { label: "Not received", color: "bg-gray-100 text-gray-800" };
      case "PARTIAL":
        return { label: "Partial", color: "bg-yellow-100 text-yellow-800" };
      case "RECEIVED":
        return { label: "Fully received", color: "bg-green-100 text-green-800" };
      default:
        return { label: "N/A", color: "bg-gray-100 text-gray-800" };
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowReadModal(true);
  };

  const handleOpenReceiptModal = (product) => {
    setSelectedProductForReceipt(product);
    setShowReceiptModal(true);
  };

  // Helper function to check if product can receive more inventory
  // According to new backend logic: Can receive multiple times on the same day,
  // but cannot receive on a different day (even if expiryDate is already set)
  const canReceiveInventory = (product) => {
    // If product has warehouseEntryDate, check if it's the same day (using date string if available)
    if (product.warehouseEntryDateStr) {
      // Use date string comparison (more reliable with timezone)
      const today = new Date();
      const vnToday = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
      vnToday.setHours(0, 0, 0, 0);
      const todayStr = `${vnToday.getFullYear()}-${String(vnToday.getMonth() + 1).padStart(2, "0")}-${String(vnToday.getDate()).padStart(2, "0")}`;
      
      // Can only receive on the same day
      return product.warehouseEntryDateStr === todayStr;
    } else if (product.warehouseEntryDate) {
      // Fallback: compare Date objects (for old data)
      const entryDate = new Date(product.warehouseEntryDate);
      entryDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Can only receive on the same day
      return entryDate.getTime() === today.getTime();
    }

    // If no warehouseEntryDate, can receive (first receipt)
    return true;
  };

  // Use stats from API
  const stats = {
    total: productStats?.total || 0,
    inStock: productStats?.inStock || 0,
    outOfStock: productStats?.outOfStock || 0,
    lowStock: productStats?.lowStock || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <Package size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Product management</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and receive products</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Total products</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Package size={22} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-700/80">In stock</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.inStock}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle size={22} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-red-200/60 bg-red-50/50 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-red-700/80">Out of stock</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{stats.outOfStock}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertCircle size={22} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-amber-700/80">Low stock</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">{stats.lowStock}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <TrendingDown size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Search & filters</p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl bg-gray-50/50 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filterStockStatus}
            onChange={(e) => setFilterStockStatus(e.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All statuses</option>
            <option value="IN_STOCK">In stock</option>
            <option value="OUT_OF_STOCK">Out of stock</option>
          </select>
          <select
            value={filterReceivingStatus}
            onChange={(e) => setFilterReceivingStatus(e.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All receipt statuses</option>
            <option value="NOT_RECEIVED">Not received</option>
            <option value="PARTIAL">Partial</option>
            <option value="RECEIVED">Fully received</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="createdAt">Created date</option>
            <option value="name">Name</option>
            <option value="onHandQuantity">Stock</option>
            <option value="receivedQuantity">Received</option>
            <option value="updatedAt">Updated date</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
            className="h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Product list</h2>
        </div>
        <div className="p-5">
          {productsLoading || createReceiptLoading ? (
            <Loading message="Loading data..." />
          ) : (
            <>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No products found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/80 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Product name</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Category</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Stock</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Received</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Planned</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Receipt status</th>
                        <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((product) => {
                        const stockStatus = getStockStatus(product);
                        const receivingStatus = getReceivingStatus(product);
                        const StatusIcon = stockStatus.icon;
                        return (
                          <tr key={product._id} className="hover:bg-gray-50/80 transition">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                {product.images && product.images.length > 0 && (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="h-10 w-10 object-cover rounded-lg"
                                  />
                                )}
                                <div>
                                  <p className="font-medium text-gray-800">{product.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {product.short_desc?.substring(0, 50)}...
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {product.category?.name || "N/A"}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {product.onHandQuantity || 0}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {product.receivedQuantity || 0}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {product.plannedQuantity || 0}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                <StatusIcon size={14} />
                                {stockStatus.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${receivingStatus.color}`}>
                                {receivingStatus.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleViewProduct(product)}
                                  className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                                  title="View details"
                                >
                                  <Eye size={18} />
                                </button>
                                {canReceiveInventory(product) ? (
                                  <button
                                    onClick={() => handleOpenReceiptModal(product)}
                                    className="rounded-xl p-2 text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                                    title="Receive stock"
                                  >
                                    <Upload size={18} />
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="rounded-xl p-2 text-gray-400 cursor-not-allowed"
                                    title="Receipt must be completed on the same day (Asia/Ho_Chi_Minh). Cannot receive on a different day."
                                  >
                                    <Upload size={18} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {productsPagination && productsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    Page {productsPagination.page} / {productsPagination.totalPages} ({productsPagination.total} products)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(productsPagination.totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === productsPagination.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[2.25rem] rounded-xl px-3 py-2 text-sm font-medium transition ${
                              currentPage === page ? "bg-emerald-600 text-white shadow-sm" : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page}>...</span>;
                      }
                      return null;
                    })}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(productsPagination.totalPages, prev + 1))}
                      disabled={currentPage === productsPagination.totalPages}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Read Product Modal */}
      <ReadProduct
        isOpen={showReadModal}
        onClose={() => {
          setShowReadModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />

      {/* Receipt Modal */}
      <CreateReceipt
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setSelectedProductForReceipt(null);
        }}
        product={selectedProductForReceipt}
      />

    </div>
  );
};

export default WareHouse;
