import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { X } from "lucide-react";
import {
  orderDetailRequest,
  clearOrderMessages,
} from "../../redux/actions/orderActions";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "READY-TO-SHIP", label: "Sẵn sàng giao" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "RETURNED", label: "Trả hàng" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const STATUS_BADGE = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  "READY-TO-SHIP": "bg-purple-100 text-purple-800",
  SHIPPING: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-green-100 text-green-800",
  RETURNED: "bg-amber-100 text-amber-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const normalizeStatus = (value) =>
  value ? value.toString().trim().toUpperCase().replace(/[_\s]+/g, "-") : "";

const formatCurrency = (value) =>
  (value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ";

const formatDate = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "N/A";

/**
 * Nội dung popup chi tiết đơn hàng.
 * Dùng trong OrderHistory: <OrderHistoryDetailContent orderId={...} onClose={...} />
 */
export const OrderHistoryDetailContent = ({ orderId, onClose }) => {
  const dispatch = useDispatch();
  const { orderDetail, detailLoading } = useSelector((state) => state.order || {});

  useEffect(() => {
    if (orderId) {
      dispatch(orderDetailRequest(orderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    return () => {
      dispatch(clearOrderMessages());
    };
  }, [dispatch]);

  const renderStatusBadge = (statusName) => {
    const normalized = normalizeStatus(statusName);
    const badgeClass = STATUS_BADGE[normalized] || "bg-gray-100 text-gray-800";
    const label =
      STATUS_OPTIONS.find((option) => option.value === normalized)?.label ||
      statusName ||
      "N/A";
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
      >
        {label}
      </span>
    );
  };

  const isCompleted = normalizeStatus(orderDetail?.order?.order_status_id?.name) === "COMPLETED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Chi tiết đơn hàng</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {detailLoading || !orderDetail ? (
            <div className="py-10 text-center text-gray-600">
              Đang tải chi tiết đơn hàng...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2 text-sm text-gray-700">
                  <div>Mã đơn: {orderDetail.order?._id}</div>
                  <div>Ngày đặt: {formatDate(orderDetail.order?.createdAt)}</div>
                  <div>
                    Trạng thái:{" "}
                    {renderStatusBadge(orderDetail.order?.order_status_id?.name)}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>Người nhận: {orderDetail.order?.receiver_name}</div>
                  <div>Điện thoại: {orderDetail.order?.receiver_phone}</div>
                  <div>Địa chỉ: {orderDetail.order?.receiver_address}</div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Sản phẩm</h3>
                <div className="space-y-2">
                  {orderDetail.details?.map((item) => {
                    const productId = item.product_id?._id || item.product_id;
                    const rawReview =
                      item.review ||
                      orderDetail.reviews?.find((r) => {
                        const rProductId = r.product_id?._id ?? r.product_id;
                        return (
                          rProductId != null &&
                          productId != null &&
                          String(rProductId) === String(productId)
                        );
                      });
                    const review = rawReview
                      ? {
                          ...rawReview,
                          _id: rawReview._id,
                          editedCount:
                            rawReview.editedCount ?? rawReview.edited_count ?? 0,
                          createdAt: rawReview.createdAt ?? rawReview.created_at,
                        }
                      : null;
                    const canEditReview =
                      review &&
                      (review.editedCount ?? 0) < 1 &&
                      review.createdAt &&
                      (() => {
                        const createdAt = new Date(review.createdAt);
                        const diffDays = Math.floor(
                          (new Date() - createdAt) / (1000 * 60 * 60 * 24)
                        );
                        return diffDays <= 3;
                      })();

                    return (
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
                            className="w-12 h-12 object-cover rounded-lg border"
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
                          {isCompleted && productId && (
                            <div className="mt-1 flex flex-col gap-0.5">
                              {review ? (
                                canEditReview ? (
                                  <>
                                    <Link
                                      to={`/customer/reviews/${review._id}/edit`}
                                      state={{ review }}
                                      className="inline-flex text-xs font-medium px-2 py-1 rounded border border-green-600 text-green-600 bg-green-50 hover:bg-green-100"
                                      onClick={onClose}
                                    >
                                      Sửa đánh giá
                                    </Link>
                                    <span className="block text-xs text-gray-500">
                                      Đã đánh giá {review.rating}⭐
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    Đã đánh giá {review.rating}⭐
                                  </span>
                                )
                              ) : (
                                <Link
                                  to={`/customer/reviews/create?orderId=${orderDetail.order?._id}&productId=${productId}`}
                                  className="inline-block text-xs px-2 py-1 rounded text-green-600 hover:bg-green-50"
                                  onClick={onClose}
                                >
                                  Đánh giá
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-3 text-sm text-gray-700">
                <span>Tổng tiền</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(orderDetail.order?.total_price)}
                </span>
              </div>

              {orderDetail.order?.status_history?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    Lịch sử trạng thái
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    {orderDetail.order.status_history.map((history, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-2 bg-gray-50 text-xs"
                      >
                        <div>
                          {history.from_status?.name || "N/A"} →{" "}
                          {history.to_status?.name || "N/A"}
                        </div>
                        <div className="text-gray-500">
                          {formatDate(history.changed_at)} •{" "}
                          {history.changed_by_role}
                        </div>
                        {history.note && (
                          <div className="text-gray-600 mt-0.5">{history.note}</div>
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

/**
 * Redirect /customer/orders/:orderId → /customer/orders?orderId=...
 * Để link cũ vẫn mở popup chi tiết tại trang Lịch sử đơn hàng.
 */
const OrderHistoryDetailRedirect = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (orderId) {
      navigate(`/customer/orders?orderId=${encodeURIComponent(orderId)}`, {
        replace: true,
      });
    } else {
      navigate("/customer/orders", { replace: true });
    }
  }, [orderId, navigate]);

  return (
    <div className="p-6 flex items-center justify-center min-h-[200px] text-gray-600">
      Đang chuyển đến lịch sử đơn hàng...
    </div>
  );
};

export default OrderHistoryDetailRedirect;
