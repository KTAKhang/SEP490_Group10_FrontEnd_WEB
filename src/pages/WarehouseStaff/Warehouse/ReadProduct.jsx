import { X, Package, CheckCircle, AlertCircle, TrendingDown, Eye } from "lucide-react";

const ReadProduct = ({ isOpen, onClose, product }) => {

  if (!isOpen || !product) return null;

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

  const stockStatus = getStockStatus(product);
  const receivingStatus = getReceivingStatus(product);
  const StatusIcon = stockStatus.icon;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <Eye size={24} />
              <span>Chi tiết sản phẩm</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 space-y-6">
            {/* Images */}
            {product.images && product.images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Hình ảnh</h3>
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/200";
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</h3>
                <p className="text-lg font-semibold text-gray-900">{product.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Danh mục</h3>
                <p className="text-gray-900">{product.category?.name || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Thương hiệu</h3>
                <p className="text-gray-900">{product.brand || "Chưa có"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Giá</h3>
                <p className="text-lg font-semibold text-green-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(product.price || 0)}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Trạng thái tồn kho</h3>
                <span
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}
                >
                  <StatusIcon size={16} />
                  <span>{stockStatus.label}</span>
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Trạng thái nhập kho</h3>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${receivingStatus.color}`}
                >
                  {receivingStatus.label}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Hiển thị</h3>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.status
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {product.status ? "Đang hiển thị" : "Đã ẩn"}
                </span>
              </div>
            </div>

            {/* Inventory Info */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Thông tin tồn kho</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Kế hoạch</p>
                  <p className="text-2xl font-bold text-blue-600">{product.plannedQuantity || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Đã nhập</p>
                  <p className="text-2xl font-bold text-purple-600">{product.receivedQuantity || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Tồn thực tế</p>
                  <p className="text-2xl font-bold text-green-600">{product.onHandQuantity || 0}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Đã giữ hàng</p>
                  <p className="text-2xl font-bold text-orange-600">{product.reservedQuantity || 0}</p>
                </div>
              </div>
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Số lượng có sẵn (có thể bán)</p>
                <p className="text-xl font-bold text-gray-900">
                  {Math.max(0, (product.onHandQuantity || 0) - (product.reservedQuantity || 0))}
                </p>
              </div>

              {/* Expiry Date & Warehouse Entry Info */}
              {(product.expiryDate || product.warehouseEntryDate || product.shelfLifeDays) && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {product.warehouseEntryDate && (
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Ngày nhập kho</p>
                      <p className="text-lg font-semibold text-indigo-600">
                        {new Date(product.warehouseEntryDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  )}
                  {product.expiryDate && (
                    <div className={`p-4 rounded-lg ${
                      (() => {
                        const expiry = new Date(product.expiryDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        expiry.setHours(0, 0, 0, 0);
                        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                        if (diffDays < 0) return "bg-red-50";
                        if (diffDays <= 7) return "bg-yellow-50";
                        return "bg-green-50";
                      })()
                    }`}>
                      <p className="text-xs text-gray-600 mb-1">Hạn sử dụng</p>
                      <p className={`text-lg font-semibold ${
                        (() => {
                          const expiry = new Date(product.expiryDate);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          expiry.setHours(0, 0, 0, 0);
                          const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                          if (diffDays < 0) return "text-red-600";
                          if (diffDays <= 7) return "text-yellow-600";
                          return "text-green-600";
                        })()
                      }`}>
                        {new Date(product.expiryDate).toLocaleDateString("vi-VN")}
                      </p>
                      {(() => {
                        const expiry = new Date(product.expiryDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        expiry.setHours(0, 0, 0, 0);
                        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                        if (diffDays < 0) {
                          return <p className="text-xs text-red-600 mt-1">Đã hết hạn</p>;
                        } else if (diffDays <= 7) {
                          return <p className="text-xs text-yellow-600 mt-1">Còn {diffDays} ngày</p>;
                        } else {
                          return <p className="text-xs text-gray-500 mt-1">Còn {diffDays} ngày</p>;
                        }
                      })()}
                    </div>
                  )}
                  {product.shelfLifeDays && (
                    <div className="bg-cyan-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Thời hạn sử dụng</p>
                      <p className="text-lg font-semibold text-cyan-600">
                        {product.shelfLifeDays} ngày
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Descriptions */}
            {product.short_desc && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Mô tả ngắn</h3>
                <p className="text-gray-900">{product.short_desc}</p>
              </div>
            )}

            {product.detail_desc && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{product.detail_desc}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <p>Ngày tạo: {product.createdAt ? new Date(product.createdAt).toLocaleString("vi-VN") : "N/A"}</p>
              </div>
              <div>
                <p>Cập nhật lần cuối: {product.updatedAt ? new Date(product.updatedAt).toLocaleString("vi-VN") : "N/A"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end p-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReadProduct;
