import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Package, User, Calendar, FileText, Info } from "lucide-react";
import { getReceiptByIdRequest } from "../../../redux/actions/inventoryActions";
import Loading from "../../../components/Loading/Loading";

const ReceiptDetailModal = ({ isOpen, onClose, receiptId }) => {
  const dispatch = useDispatch();
  const { receiptDetail, receiptDetailLoading, receiptDetailError } = useSelector(
    (state) => state.inventory
  );

  useEffect(() => {
    if (isOpen && receiptId) {
      dispatch(getReceiptByIdRequest(receiptId));
    }
  }, [isOpen, receiptId, dispatch]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-green-50">
          <div className="flex items-center space-x-3">
            <Package className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Chi tiết phiếu nhập hàng</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {receiptDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loading message="Đang tải chi tiết phiếu nhập hàng..." />
            </div>
          ) : receiptDetailError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Info className="text-red-400 mb-4" size={48} />
              <p className="text-red-600 font-medium">{receiptDetailError}</p>
            </div>
          ) : receiptDetail ? (
            <div className="space-y-6">
              {/* Product Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <Package size={20} />
                  <span>Thông tin sản phẩm</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {receiptDetail.product?.images && receiptDetail.product.images.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        {receiptDetail.product.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${receiptDetail.product?.name} - ${index + 1}`}
                            className="h-32 w-32 rounded-lg object-cover border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tên sản phẩm</label>
                    <p className="text-base text-gray-900 font-medium">
                      {receiptDetail.product?.name || "N/A"}
                    </p>
                  </div>
                  {receiptDetail.product?.brand && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Thương hiệu</label>
                      <p className="text-base text-gray-900">{receiptDetail.product.brand}</p>
                    </div>
                  )}
                  {receiptDetail.product?.category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Danh mục</label>
                      <p className="text-base text-gray-900">{receiptDetail.product.category.name}</p>
                    </div>
                  )}
                  {receiptDetail.product?.price && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Giá</label>
                      <p className="text-base text-gray-900 font-medium">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(receiptDetail.product.price)}
                      </p>
                    </div>
                  )}
                  {receiptDetail.product?.description && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Mô tả</label>
                      <p className="text-base text-gray-900">{receiptDetail.product.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Information */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <FileText size={20} />
                  <span>Thông tin giao dịch</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Số lượng nhập</label>
                    <p className="text-base text-gray-900 font-semibold text-blue-600">
                      {receiptDetail.quantity || 0}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Ngày nhập</label>
                    <p className="text-base text-gray-900">
                      {receiptDetail.createdAt
                        ? new Date(receiptDetail.createdAt).toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </p>
                  </div>
                  {receiptDetail.note && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Ghi chú</label>
                      <p className="text-base text-gray-900 bg-white p-3 rounded border border-gray-200">
                        {receiptDetail.note}
                      </p>
                    </div>
                  )}
                  {receiptDetail.referenceType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Loại tham chiếu</label>
                      <p className="text-base text-gray-900">{receiptDetail.referenceType}</p>
                    </div>
                  )}
                  {receiptDetail.referenceId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">ID tham chiếu</label>
                      <p className="text-base text-gray-900 font-mono text-sm">{receiptDetail.referenceId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Staff Information */}
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <User size={20} />
                  <span>Thông tin nhân viên nhập hàng</span>
                </h3>
                {receiptDetail.createdBy ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {receiptDetail.createdBy.avatar && (
                      <div className="md:col-span-2 mb-2">
                        <img
                          src={receiptDetail.createdBy.avatar}
                          alt={receiptDetail.createdBy.user_name}
                          className="h-20 w-20 rounded-full object-cover border-2 border-purple-200"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Tên đăng nhập</label>
                      <p className="text-base text-gray-900 font-medium">
                        {receiptDetail.createdBy.user_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                      <p className="text-base text-gray-900">{receiptDetail.createdBy.email || "N/A"}</p>
                    </div>
                    {receiptDetail.createdBy.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Số điện thoại</label>
                        <p className="text-base text-gray-900">{receiptDetail.createdBy.phone}</p>
                      </div>
                    )}
                    {receiptDetail.createdBy.role_id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Vai trò</label>
                        <p className="text-base text-gray-900">{receiptDetail.createdBy.role_id.name || "N/A"}</p>
                      </div>
                    )}
                    {receiptDetail.createdBy.address && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Địa chỉ</label>
                        <p className="text-base text-gray-900">{receiptDetail.createdBy.address}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">Không có thông tin nhân viên</p>
                )}
              </div>

              {/* Product Inventory Details */}
              <div className="bg-amber-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <Info size={20} />
                  <span>Thông tin tồn kho sản phẩm</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {receiptDetail.product?.warehouseEntryDateStr && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Ngày nhập kho
                      </label>
                      <p className="text-base text-gray-900">{receiptDetail.product.warehouseEntryDateStr}</p>
                    </div>
                  )}
                  {receiptDetail.product?.expiryDateStr && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Hạn sử dụng</label>
                      <p className="text-base text-gray-900 font-medium text-red-600">
                        {receiptDetail.product.expiryDateStr}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Số lượng kế hoạch</label>
                    <p className="text-base text-gray-900">{receiptDetail.product?.plannedQuantity || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Số lượng đã nhận</label>
                    <p className="text-base text-gray-900 font-medium text-green-600">
                      {receiptDetail.product?.receivedQuantity || 0}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tồn kho hiện tại</label>
                    <p className="text-base text-gray-900 font-medium text-blue-600">
                      {receiptDetail.product?.onHandQuantity || 0}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Trạng thái nhận hàng</label>
                    <p className="text-base text-gray-900">
                      {receiptDetail.product?.receivingStatus === "RECEIVED"
                        ? "Đã nhận đủ"
                        : receiptDetail.product?.receivingStatus === "PARTIAL"
                        ? "Nhận một phần"
                        : receiptDetail.product?.receivingStatus === "NOT_RECEIVED"
                        ? "Chưa nhận"
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Trạng thái tồn kho</label>
                    <p className="text-base text-gray-900">
                      {receiptDetail.product?.stockStatus === "IN_STOCK" ? "Còn hàng" : "Hết hàng"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Info className="text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Không có dữ liệu</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDetailModal;
