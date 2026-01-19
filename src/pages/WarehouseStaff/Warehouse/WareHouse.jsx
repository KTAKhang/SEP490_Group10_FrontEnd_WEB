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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Product management</h1>
          <p className="text-gray-600 mt-1">View and receive products</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total products</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In stock</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.inStock}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of stock</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.outOfStock}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low stock</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.lowStock}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filters and search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Stock Status Filter */}
            <select
              value={filterStockStatus}
              onChange={(e) => setFilterStockStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All statuses</option>
              <option value="IN_STOCK">In stock</option>
              <option value="OUT_OF_STOCK">Out of stock</option>
            </select>

            {/* Receiving Status Filter */}
            <select
              value={filterReceivingStatus}
              onChange={(e) => setFilterReceivingStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All receipt statuses</option>
              <option value="NOT_RECEIVED">Not received</option>
              <option value="PARTIAL">Partial</option>
              <option value="RECEIVED">Fully received</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Created date</option>
              <option value="name">Name</option>
              <option value="onHandQuantity">Stock</option>
              <option value="receivedQuantity">Received</option>
              <option value="updatedAt">Updated date</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Product list</CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading || createReceiptLoading ? (
            <Loading message="Loading data..." />
          ) : (
            <>
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Product name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Received</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Planned</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Receipt status</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const stockStatus = getStockStatus(product);
                        const receivingStatus = getReceivingStatus(product);
                        const StatusIcon = stockStatus.icon;
                        return (
                          <tr key={product._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                {product.images && product.images.length > 0 && (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="h-10 w-10 object-cover rounded"
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
                            <td className="py-3 px-4 text-gray-700">
                              {product.category?.name || "N/A"}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-gray-800">
                                {product.onHandQuantity || 0}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-gray-800">
                                {product.receivedQuantity || 0}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-gray-800">
                                {product.plannedQuantity || 0}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}
                              >
                                <StatusIcon size={14} />
                                <span>{stockStatus.label}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${receivingStatus.color}`}
                              >
                                {receivingStatus.label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleViewProduct(product)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View details"
                                >
                                  <Eye size={18} />
                                </button>
                                {canReceiveInventory(product) ? (
                                  <button
                                    onClick={() => handleOpenReceiptModal(product)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Receive stock"
                                  >
                                    <Upload size={18} />
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="p-2 text-gray-400 cursor-not-allowed rounded-lg"
                                    title="Receipt must be completed on the same day (according to Asia/Ho_Chi_Minh timezone). Cannot receive on a different day."
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
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Trang {productsPagination.page} / {productsPagination.totalPages} (
                    {productsPagination.total} products)
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                            className={`px-3 py-1 border rounded-lg ${
                              currentPage === page
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 hover:bg-gray-50"
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
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
