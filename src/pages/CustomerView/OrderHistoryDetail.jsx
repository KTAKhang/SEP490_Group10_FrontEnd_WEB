import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  orderDetailRequest,
  clearOrderMessages,
} from "../../redux/actions/orderActions";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "READY-TO-SHIP", label: "Sẵn sàng giao" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const STATUS_BADGE = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  "READY-TO-SHIP": "bg-purple-100 text-purple-800",
  SHIPPING: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const normalizeStatus = (value) =>
  value ? value.toString().trim().toUpperCase().replace(/[_\s]+/g, "-") : "";

const formatCurrency = (value) =>
  (value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ";

const formatDate = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "N/A";

const OrderHistoryDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();

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

  if (!orderId) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="text-center text-gray-600">
            <p>Không tìm thấy đơn hàng</p>
            <Link
              to="/customer/orders"
              className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Quay lại lịch sử đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Link
              to="/customer/orders"
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
          </div>
        </div>

        <div className="p-6">
          {detailLoading || !orderDetail ? (
            <div className="py-10 text-center text-gray-600">
              Đang tải chi tiết đơn hàng...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Sản phẩm
                </h3>
                <div className="space-y-3">
                  {orderDetail.details?.map((item) => {
                    const productId = item.product_id?._id || item.product_id;
                    // Tìm review: ưu tiên item.review, sau đó tìm trong orderDetail.reviews theo product_id
                    const rawReview = item.review || orderDetail.reviews?.find((r) => {
                      const rProductId = r.product_id?._id ?? r.product_id;
                      return rProductId != null && productId != null && String(rProductId) === String(productId);
                    });
                    // Chuẩn hóa review (API có thể trả edited_count/created_at)
                    const review = rawReview ? {
                      ...rawReview,
                      _id: rawReview._id,
                      editedCount: rawReview.editedCount ?? rawReview.edited_count ?? 0,
                      createdAt: rawReview.createdAt ?? rawReview.created_at,
                    } : null;

                    // Có thể sửa đánh giá: đã review, chưa sửa quá 1 lần, và trong vòng 3 ngày
                    const canEditReview = review &&
                      (review.editedCount ?? 0) < 1 &&
                      review.createdAt &&
                      (() => {
                        const createdAt = new Date(review.createdAt);
                        const now = new Date();
                        const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
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
                          {isCompleted && productId && (
                            <div className="mt-2 flex flex-col gap-1">
                              {review ? (
                                // ✅ Đã có review: chỉ hiển thị "Đánh giá lại" nếu trong 3 ngày và chưa edit
                                canEditReview ? (
                                  <>
                                    <Link
                                      to={`/customer/reviews/${review._id}/edit`}
                                      state={{ review }}
                                      className="inline-flex items-center gap-1 mt-1 text-xs font-medium px-3 py-1.5 rounded-md border border-green-600 text-green-600 bg-green-50 hover:bg-green-100"
                                    >
                                      Sửa đánh giá
                                    </Link>
                                    <span className="block text-xs text-gray-500 mt-0.5">
                                      Đã đánh giá {review.rating}⭐
                                    </span>
                                  </>
                                ) : (
                                  // ✅ Đã hết hạn hoặc đã edit 1 lần: không hiển thị nút
                                  <span className="text-xs text-gray-500">
                                    Đã đánh giá {review.rating}⭐
                                  </span>
                                )
                              ) : (
                                // ✅ Chưa có review: hiển thị "Đánh giá" (không giới hạn thời gian)
                                <Link
                                  to={`/customer/reviews/create?orderId=${orderDetail.order?._id}&productId=${productId}`}
                                  className="inline-block text-xs px-2 py-1 rounded text-green-600 hover:text-green-700 hover:bg-green-50"
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

              <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-700">
                <span>Tổng tiền</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(orderDetail.order?.total_price)}
                </span>
              </div>

              {orderDetail.order?.status_history?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Lịch sử trạng thái
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    {orderDetail.order.status_history.map((history, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-3 bg-gray-50"
                      >
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

export default OrderHistoryDetail;
