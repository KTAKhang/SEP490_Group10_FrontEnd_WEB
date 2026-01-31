import { X } from "lucide-react";

const ReadOrderDetail = ({
  isOpen,
  adminDetailLoading,
  adminDetail,
  onClose,
  formatDate,
  renderStatusBadge,
  renderPaymentBadge,
  formatCurrency,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Chi tiết đơn hàng
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">
          {adminDetailLoading || !adminDetail ? (
            <div className="py-10 text-center text-gray-600">
              Đang tải chi tiết đơn hàng...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2 text-sm text-gray-700">
                  <div>Mã đơn: {adminDetail.order?._id}</div>
                  <div>Ngày đặt: {formatDate(adminDetail.order?.createdAt)}</div>
                  <div>
                    Trạng thái:{" "}
                    {renderStatusBadge(adminDetail.order?.order_status_id?.name)}
                  </div>
                  <div>Thanh toán: {adminDetail.order?.payment_method || "N/A"}</div>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>Người nhận: {adminDetail.order?.receiver_name}</div>
                  <div>Điện thoại: {adminDetail.order?.receiver_phone}</div>
                  <div>Địa chỉ: {adminDetail.order?.receiver_address}</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Sản phẩm
                </h3>
                <div className="space-y-3">
                  {adminDetail.details?.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.product_image ||
                            "https://via.placeholder.com/60?text=No+Image"
                          }
                          alt={item.product_name}
                          className="w-14 h-14 object-cover rounded-lg border"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.product_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.product_category_name || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-700">
                        <div>Số lượng: {item.quantity}</div>
                        <div>{formatCurrency(item.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Thanh toán
                </h3>
                <div className="text-sm text-gray-700 flex items-center gap-3">
                  {renderPaymentBadge(adminDetail.payment)}
                  <span>
                    {adminDetail.payment?.method || "N/A"} •{" "}
                    {formatCurrency(adminDetail.payment?.amount)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-700">
                <span>Tổng tiền</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(adminDetail.order?.total_price)}
                </span>
              </div>

              {adminDetail.order?.status_history?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Lịch sử trạng thái
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    {adminDetail.order.status_history.map((history, idx) => (
                      <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                        <div>
                          {history.from_status?.name || "N/A"} →{" "}
                          {history.to_status?.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(history.changed_at)} •{" "}
                          {history.changed_by_role}
                        </div>
                        {history.note && (
                          <div className="text-xs text-gray-600 mt-1">
                            {history.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadOrderDetail;
