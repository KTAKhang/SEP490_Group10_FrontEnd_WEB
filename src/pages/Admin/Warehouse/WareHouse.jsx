import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Filter,
  Download,
  Upload,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  getProductsRequest,
  deleteProductRequest,
  getProductStatsRequest,
} from "../../../redux/actions/productActions";
import { getCategoriesRequest } from "../../../redux/actions/categoryActions";
import { confirmResetProductRequest } from "../../../redux/actions/productBatchActions";
import CreateProduct from "./CreateProduct";
import UpdateProduct from "./UpdateProduct";
import DetailProduct from "./DetailProduct";
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
<<<<<<< HEAD
  const { 
    products, 
    productsLoading, 
    productsPagination, 
    categories,
    createProductLoading,
    createProductError,
    deleteProductLoading,
    deleteProductError,
    createReceiptLoading,
    createReceiptError,
  } = useSelector((state) => state.warehouse);
=======
  const {
    products,
    productsLoading,
    productsPagination,
    productStats,
    createProductLoading,
    updateProductLoading,
    deleteProductLoading,
    createProductError,
    updateProductError,
    deleteProductError,
  } = useSelector((state) => state.product);
  
  const { categories } = useSelector((state) => state.category);
>>>>>>> 22a3f19a9774da34e8f3624342ffe7c2e62850f3

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStockStatus, setFilterStockStatus] = useState("all"); // all, IN_STOCK, OUT_OF_STOCK
  const [filterReceivingStatus, setFilterReceivingStatus] = useState("all"); // all, NOT_RECEIVED, PARTIAL, RECEIVED
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
<<<<<<< HEAD
  const [selectedProductForReceipt, setSelectedProductForReceipt] = useState(null);
  const [hasDeletedProduct, setHasDeletedProduct] = useState(false);
  const [hasCreatedReceipt, setHasCreatedReceipt] = useState(false);
=======
  const [prevCreateLoading, setPrevCreateLoading] = useState(false);
  const [prevUpdateLoading, setPrevUpdateLoading] = useState(false);
  const [prevDeleteLoading, setPrevDeleteLoading] = useState(false);
  const [confirmingProductId, setConfirmingProductId] = useState(null);
  
  const { confirmResetLoading } = useSelector((state) => state.productBatch);
>>>>>>> 22a3f19a9774da34e8f3624342ffe7c2e62850f3

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

  // Auto refresh after successful create
  useEffect(() => {
    if (prevCreateLoading && !createProductLoading && !createProductError) {
      // Create was just completed successfully
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
    setPrevCreateLoading(createProductLoading);
  }, [dispatch, createProductLoading, createProductError, prevCreateLoading, currentPage, searchTerm, filterStockStatus, filterReceivingStatus, selectedCategory, sortBy, sortOrder]);

  // Auto refresh after successful update
  useEffect(() => {
    if (prevUpdateLoading && !updateProductLoading && !updateProductError) {
      // Update was just completed successfully
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
    setPrevUpdateLoading(updateProductLoading);
  }, [dispatch, updateProductLoading, updateProductError, prevUpdateLoading, currentPage, searchTerm, filterStockStatus, filterReceivingStatus, selectedCategory, sortBy, sortOrder]);

  // Auto refresh after successful delete
  useEffect(() => {
    if (prevDeleteLoading && !deleteProductLoading && !deleteProductError) {
      // Delete was just completed successfully
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
    setPrevDeleteLoading(deleteProductLoading);
  }, [dispatch, deleteProductLoading, deleteProductError, prevDeleteLoading, currentPage, searchTerm, filterStockStatus, filterReceivingStatus, selectedCategory, sortBy, sortOrder]);


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

  const handleAddProduct = () => {
    setShowCreateModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowReadModal(true);
  };

  const handleDeleteProduct = (id) => {
<<<<<<< HEAD
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    setHasDeletedProduct(true);
    dispatch(deleteProductRequest(id));
  };

  // Show toast when product is deleted successfully
  useEffect(() => {
    if (hasDeletedProduct && !deleteProductLoading && !deleteProductError) {
      // Product deletion completed successfully
      toast.success("Product deleted successfully!");
      setHasDeletedProduct(false);
    }
    if (hasDeletedProduct && deleteProductError) {
      toast.error(deleteProductError);
      setHasDeletedProduct(false);
    }
  }, [hasDeletedProduct, deleteProductLoading, deleteProductError]);

  // Show toast when receipt is created successfully
  useEffect(() => {
    if (hasCreatedReceipt && !createReceiptLoading && !createReceiptError) {
      // Receipt creation completed successfully
      toast.success("Receipt created successfully!");
      setHasCreatedReceipt(false);
    }
    if (hasCreatedReceipt && createReceiptError) {
      toast.error(createReceiptError);
      setHasCreatedReceipt(false);
    }
  }, [hasCreatedReceipt, createReceiptLoading, createReceiptError]);

  const handleOpenReceiptModal = (product) => {
    setSelectedProductForReceipt(product);
    setReceiptData({
      productId: product._id,
      quantity: 0,
      expiryDate: "",
      shelfLifeDays: "",
      note: "",
    });
    setShowReceiptModal(true);
=======
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    dispatch(deleteProductRequest(id));
  };

  const handleConfirmReset = (productId) => {
    if (window.confirm("Bạn có chắc chắn muốn xác nhận reset lô hàng này không? Hệ thống sẽ tạo batch history và reset sản phẩm về 0.")) {
      setConfirmingProductId(productId);
      dispatch(confirmResetProductRequest(productId));
    }
>>>>>>> 22a3f19a9774da34e8f3624342ffe7c2e62850f3
  };

  // Reload products after successful confirmation
  useEffect(() => {
    if (!confirmResetLoading && confirmingProductId) {
      setConfirmingProductId(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmResetLoading]);

<<<<<<< HEAD
    // Validate expiryDate if provided (must be at least tomorrow)
    if (receiptData.expiryDate) {
      const selectedDate = new Date(receiptData.expiryDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < tomorrow) {
        toast.error(`Hạn sử dụng phải tối thiểu từ ngày ${tomorrow.toISOString().split('T')[0]} (ngày mai)`);
        return;
      }
    }

    // Prepare receipt data (prioritize expiryDate over shelfLifeDays)
    const receiptPayload = {
      productId: receiptData.productId,
      quantity: receiptData.quantity,
      note: receiptData.note || "",
    };
    
    // Ưu tiên expiryDate từ date picker
    if (receiptData.expiryDate) {
      receiptPayload.expiryDate = receiptData.expiryDate;
    } 
    // Backward compatible: nếu không có expiryDate, dùng shelfLifeDays
    else if (receiptData.shelfLifeDays && receiptData.shelfLifeDays > 0) {
      receiptPayload.shelfLifeDays = parseInt(receiptData.shelfLifeDays);
    }

    setHasCreatedReceipt(true);
    dispatch(createReceiptRequest(receiptPayload));
    setShowReceiptModal(false);
    setReceiptData({
      productId: "",
      quantity: 0,
      expiryDate: "",
      shelfLifeDays: "",
      note: "",
    });
  };

  // Calculate stats from products
=======
  // Use stats from API
>>>>>>> 22a3f19a9774da34e8f3624342ffe7c2e62850f3
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
          <h1 className="text-3xl font-bold text-gray-800">Warehouse management</h1>
          <p className="text-gray-600 mt-1">Manage products and inventory</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Upload size={18} />
            <span>Import Excel</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={18} />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleAddProduct}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={18} />
            <span>Add product</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total products</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <Package className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In stock</p>
                <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low stock</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
              <TrendingDown className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-500" />
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
                placeholder="Search by product name..."
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
                value={filterStockStatus}
                onChange={(e) => {
                  setFilterStockStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All statuses</option>
                <option value="IN_STOCK">In stock</option>
                <option value="OUT_OF_STOCK">Out of stock</option>
              </select>
              <select
                value={filterReceivingStatus}
                onChange={(e) => {
                  setFilterReceivingStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All receipts</option>
                <option value="NOT_RECEIVED">Not received</option>
                <option value="PARTIAL">Partial</option>
                <option value="RECEIVED">Fully received</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All categories</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
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
                <option value="price">Price</option>
                <option value="onHandQuantity">Stock</option>
                <option value="receivedQuantity">Received</option>
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

      {/* Products Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Product list ({productsPagination?.total || products.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {productsLoading || createProductLoading || updateProductLoading || deleteProductLoading ? (
            <Loading message="Loading data..." />
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No products found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
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
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product);
                      const receivingStatus = getReceivingStatus(product);
                      const StatusIcon = stockStatus.icon;
                      return (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-lg object-cover mr-3"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                                  <Package size={20} className="text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                  {product.short_desc}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {product.category?.name || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">
                                Stock: {product.onHandQuantity || 0}
                              </p>
                              <p className="text-xs text-gray-500">
                                Planned: {product.plannedQuantity || 0} | Received:{" "}
                                {product.receivedQuantity || 0}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(product.price || 0)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}
                              >
                                <StatusIcon size={14} />
                                <span>{stockStatus.label}</span>
                              </span>
                              <br />
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${receivingStatus.color}`}
                              >
                                {receivingStatus.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleViewProduct(product)}
                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                title="View details"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                title="Edit product"
                              >
                                <Edit size={18} />
                              </button>
                              {/* Show Confirm Reset button when onHandQuantity === 0 and pendingBatchReset === true */}
                              {product.onHandQuantity === 0 && product.pendingBatchReset && (
                                <button
                                  onClick={() => handleConfirmReset(product._id)}
                                  disabled={confirmResetLoading || confirmingProductId === product._id}
                                  className={`p-1 rounded transition-colors ${
                                    confirmingProductId === product._id || confirmResetLoading
                                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      : "bg-orange-500 text-white hover:bg-orange-600"
                                  }`}
                                  title="Xác nhận reset lô hàng"
                                >
                                  {confirmingProductId === product._id || confirmResetLoading ? (
                                    <RefreshCw size={18} className="animate-spin" />
                                  ) : (
                                    <RefreshCw size={18} />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                title="Delete product"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {productsPagination && productsPagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {productsPagination.page * productsPagination.limit - productsPagination.limit + 1} -{" "}
                    {Math.min(productsPagination.page * productsPagination.limit, productsPagination.total)} of{" "}
                    {productsPagination.total} products
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(productsPagination.totalPages)].map((_, index) => (
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
                      onClick={() => setCurrentPage((prev) => Math.min(productsPagination.totalPages, prev + 1))}
                      disabled={currentPage === productsPagination.totalPages}
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

      {/* Create Product Modal */}
      <CreateProduct isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      {/* Update Product Modal */}
      <UpdateProduct
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />

      {/* Detail Product Modal */}
      <DetailProduct
        isOpen={showReadModal}
        onClose={() => {
          setShowReadModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </div>
  );
};

export default WareHouse;
