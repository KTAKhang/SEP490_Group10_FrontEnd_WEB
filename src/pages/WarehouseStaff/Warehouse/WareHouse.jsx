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
  Calendar,
} from "lucide-react";
import {
  getProductsRequest,
  getCategoriesRequest,
} from "../../../redux/actions/warehouseActions";
import ReadProduct from "./ReadProduct";
import CreateReceipt from "./CreateReceipt";
import UpdateExpiryDate from "./UpdateExpiryDate";
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
    categories,
    createReceiptLoading,
    updateProductExpiryDateLoading,
    createReceiptError,
    updateProductExpiryDateError,
  } = useSelector((state) => state.warehouse);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStockStatus, setFilterStockStatus] = useState("all"); // all, IN_STOCK, OUT_OF_STOCK
  const [filterReceivingStatus, setFilterReceivingStatus] = useState("all"); // all, NOT_RECEIVED, PARTIAL, RECEIVED
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showReadModal, setShowReadModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showUpdateExpiryModal, setShowUpdateExpiryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductForReceipt, setSelectedProductForReceipt] = useState(null);
  const [selectedProductForUpdateExpiry, setSelectedProductForUpdateExpiry] = useState(null);
  const [prevCreateReceiptLoading, setPrevCreateReceiptLoading] = useState(false);
  const [prevUpdateExpiryLoading, setPrevUpdateExpiryLoading] = useState(false);

  // Fetch products and categories on mount
  useEffect(() => {
    dispatch(getProductsRequest({ page: currentPage, limit: 10 }));
    dispatch(getCategoriesRequest({ page: 1, limit: 100 }));
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
    };
    dispatch(getProductsRequest(params));
  }, [dispatch, currentPage, searchTerm, filterStockStatus, filterReceivingStatus, selectedCategory]);

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
      };
      dispatch(getProductsRequest(params));
    }
    setPrevCreateReceiptLoading(createReceiptLoading);
  }, [dispatch, createReceiptLoading, createReceiptError, prevCreateReceiptLoading, currentPage, searchTerm, filterStockStatus, filterReceivingStatus, selectedCategory]);

  // Auto refresh after successful update expiry date
  useEffect(() => {
    if (prevUpdateExpiryLoading && !updateProductExpiryDateLoading && !updateProductExpiryDateError) {
      // Update expiry date was just completed successfully
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        stockStatus: filterStockStatus !== "all" ? filterStockStatus : undefined,
        receivingStatus: filterReceivingStatus !== "all" ? filterReceivingStatus : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
      };
      dispatch(getProductsRequest(params));
    }
    setPrevUpdateExpiryLoading(updateProductExpiryDateLoading);
  }, [dispatch, updateProductExpiryDateLoading, updateProductExpiryDateError, prevUpdateExpiryLoading, currentPage, searchTerm, filterStockStatus, filterReceivingStatus, selectedCategory]);

  const getStockStatus = (product) => {
    if (product.stockStatus === "OUT_OF_STOCK" || product.onHandQuantity === 0) {
      return { label: "Hết hàng", color: "bg-red-100 text-red-800", icon: AlertCircle };
    }
    if (product.onHandQuantity <= 10) {
      return { label: "Sắp hết", color: "bg-yellow-100 text-yellow-800", icon: TrendingDown };
    }
    return { label: "Còn hàng", color: "bg-green-100 text-green-800", icon: CheckCircle };
  };

  const getReceivingStatus = (product) => {
    switch (product.receivingStatus) {
      case "NOT_RECEIVED":
        return { label: "Chưa nhập", color: "bg-gray-100 text-gray-800" };
      case "PARTIAL":
        return { label: "Chưa đủ", color: "bg-yellow-100 text-yellow-800" };
      case "RECEIVED":
        return { label: "Đã nhập đủ", color: "bg-green-100 text-green-800" };
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

  const handleOpenUpdateExpiryModal = (product) => {
    setSelectedProductForUpdateExpiry(product);
    setShowUpdateExpiryModal(true);
  };

  // Calculate stats from products
  const stats = {
    total: productsPagination?.total || products.length,
    inStock: products.filter((p) => p.stockStatus === "IN_STOCK").length,
    outOfStock: products.filter((p) => p.stockStatus === "OUT_OF_STOCK").length,
    lowStock: products.filter((p) => p.onHandQuantity > 0 && p.onHandQuantity <= 10).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý sản phẩm</h1>
          <p className="text-gray-600 mt-1">Xem và nhập kho sản phẩm</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng sản phẩm</p>
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
                <p className="text-sm text-gray-600">Còn hàng</p>
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
                <p className="text-sm text-gray-600">Hết hàng</p>
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
                <p className="text-sm text-gray-600">Sắp hết</p>
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
          <CardTitle className="text-lg font-semibold">Bộ lọc và tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
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
              <option value="all">Tất cả danh mục</option>
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
              <option value="all">Tất cả trạng thái</option>
              <option value="IN_STOCK">Còn hàng</option>
              <option value="OUT_OF_STOCK">Hết hàng</option>
            </select>

            {/* Receiving Status Filter */}
            <select
              value={filterReceivingStatus}
              onChange={(e) => setFilterReceivingStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái nhập</option>
              <option value="NOT_RECEIVED">Chưa nhập</option>
              <option value="PARTIAL">Chưa đủ</option>
              <option value="RECEIVED">Đã nhập đủ</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Danh sách sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading || createReceiptLoading || updateProductExpiryDateLoading ? (
            <Loading message="Đang tải dữ liệu..." />
          ) : (
            <>
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Không có sản phẩm nào</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Tên sản phẩm</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Danh mục</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Tồn kho</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Đã nhập</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Kế hoạch</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Trạng thái</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Trạng thái nhập</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Thao tác</th>
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
                                  title="Xem chi tiết"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => handleOpenReceiptModal(product)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Nhập kho"
                                >
                                  <Upload size={18} />
                                </button>
                                {product.warehouseEntryDate && (
                                  <button
                                    onClick={() => handleOpenUpdateExpiryModal(product)}
                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                    title="Cập nhật hạn sử dụng"
                                  >
                                    <Calendar size={18} />
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
                    {productsPagination.total} sản phẩm)
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Trước
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

      {/* Update Expiry Date Modal */}
      <UpdateExpiryDate
        isOpen={showUpdateExpiryModal}
        onClose={() => {
          setShowUpdateExpiryModal(false);
          setSelectedProductForUpdateExpiry(null);
        }}
        product={selectedProductForUpdateExpiry}
      />
    </div>
  );
};

export default WareHouse;
