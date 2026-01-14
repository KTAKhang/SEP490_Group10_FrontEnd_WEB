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
  Box,
  Eye,
  X,
} from "lucide-react";
import {
  getProductsRequest,
  getCategoriesRequest,
  deleteProductRequest,
  createReceiptRequest,
} from "../../../redux/actions/warehouseActions";
import CreateProduct from "./CreateProduct";
import UpdateProduct from "./UpdateProduct";
import ReadProduct from "./ReadProduct";

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
    createProductLoading,
    createProductError,
    deleteProductLoading,
    deleteProductError,
    createReceiptLoading,
    createReceiptError,
  } = useSelector((state) => state.warehouse);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStockStatus, setFilterStockStatus] = useState("all"); // all, IN_STOCK, OUT_OF_STOCK
  const [filterReceivingStatus, setFilterReceivingStatus] = useState("all"); // all, NOT_RECEIVED, PARTIAL, RECEIVED
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductForReceipt, setSelectedProductForReceipt] = useState(null);
  const [hasDeletedProduct, setHasDeletedProduct] = useState(false);
  const [hasCreatedReceipt, setHasCreatedReceipt] = useState(false);

  const [receiptData, setReceiptData] = useState({
    productId: "",
    quantity: 0,
    expiryDate: "",
    shelfLifeDays: "",
    note: "",
  });

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
  };

  const handleCreateReceipt = () => {
    if (!receiptData.productId || receiptData.quantity <= 0) {
      toast.error("Vui lòng nhập số lượng hợp lệ");
      return;
    }

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
          <h1 className="text-3xl font-bold text-gray-800">Quản lý kho hàng</h1>
          <p className="text-gray-600 mt-1">Quản lý sản phẩm và tồn kho</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Upload size={18} />
            <span>Nhập Excel</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={18} />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={handleAddProduct}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={18} />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng sản phẩm</p>
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
                <p className="text-sm text-gray-600">Còn hàng</p>
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
                <p className="text-sm text-gray-600">Sắp hết</p>
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
                <p className="text-sm text-gray-600">Hết hàng</p>
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
                placeholder="Tìm kiếm theo tên sản phẩm..."
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
                <option value="all">Tất cả trạng thái</option>
                <option value="IN_STOCK">Còn hàng</option>
                <option value="OUT_OF_STOCK">Hết hàng</option>
              </select>
              <select
                value={filterReceivingStatus}
                onChange={(e) => {
                  setFilterReceivingStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tất cả nhập kho</option>
                <option value="NOT_RECEIVED">Chưa nhập</option>
                <option value="PARTIAL">Chưa đủ</option>
                <option value="RECEIVED">Đã nhập đủ</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tất cả danh mục</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Danh sách sản phẩm ({productsPagination?.total || products.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {productsLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Đang tải...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Danh mục
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nhập kho
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
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
                                Tồn: {product.onHandQuantity || 0}
                              </p>
                              <p className="text-xs text-gray-500">
                                Kế hoạch: {product.plannedQuantity || 0} | Đã nhập:{" "}
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenReceiptModal(product)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              title="Nhập kho"
                            >
                              <Box size={18} />
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
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
                    Hiển thị {productsPagination.page * productsPagination.limit - productsPagination.limit + 1} -{" "}
                    {Math.min(productsPagination.page * productsPagination.limit, productsPagination.total)} trong
                    tổng số {productsPagination.total} sản phẩm
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Trước
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
                      Sau
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
      {showReceiptModal && selectedProductForReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Nhập kho</h2>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sản phẩm</p>
                <p className="font-medium text-gray-900">{selectedProductForReceipt.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Kế hoạch: {selectedProductForReceipt.plannedQuantity} | Đã nhập:{" "}
                  {selectedProductForReceipt.receivedQuantity} | Tồn:{" "}
                  {selectedProductForReceipt.onHandQuantity}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={receiptData.quantity}
                  onChange={(e) =>
                    setReceiptData({ ...receiptData, quantity: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="1"
                  max={
                    selectedProductForReceipt.plannedQuantity -
                    selectedProductForReceipt.receivedQuantity
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Còn có thể nhập tối đa:{" "}
                  {selectedProductForReceipt.plannedQuantity -
                    selectedProductForReceipt.receivedQuantity}
                </p>
              </div>
              {/* Only show shelfLifeDays for first receipt (receivedQuantity = 0) */}
              {selectedProductForReceipt.receivedQuantity === 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hạn sử dụng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={receiptData.expiryDate}
                    onChange={(e) => {
                      setReceiptData({ ...receiptData, expiryDate: e.target.value, shelfLifeDays: "" });
                    }}
                    min={(() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return tomorrow.toISOString().split('T')[0];
                    })()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Chọn ngày hết hạn (tối thiểu từ ngày mai)
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={receiptData.note}
                  onChange={(e) => setReceiptData({ ...receiptData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  placeholder="Nhập ghi chú (nếu có)"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateReceipt}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Nhập kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WareHouse;
