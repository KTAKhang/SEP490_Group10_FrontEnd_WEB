import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Package, ChevronLeft, ChevronRight } from "lucide-react";
import {
  orderHistoryRequest,
  orderDetailRequest,
  orderCancelRequest,
  clearOrderMessages,
} from "../../redux/actions/orderActions";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const FILTERABLE_STATUSES = STATUS_OPTIONS.filter(
  (status) => status.value !== "ALL"
);

const STATUS_BADGE = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const formatCurrency = (value) =>
  (value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ";

const formatDate = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "N/A";

const OrderHistory = () => {
  const dispatch = useDispatch();
  const {
    orders,
    ordersPagination,
    orderDetail,
    historyLoading,
    detailLoading,
    message,
  } = useSelector((state) => state.order || {});

  const [statusFilters, setStatusFilters] = useState([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const cancelingRef = useRef(null);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      status_names: statusFilters.length > 0 ? statusFilters : undefined,
      sortBy,
      sortOrder,
    }),
    [page, limit, statusFilters, sortBy, sortOrder]
  );

  useEffect(() => {
    dispatch(orderHistoryRequest(queryParams));
  }, [dispatch, queryParams]);

  useEffect(() => {
    if (message && cancelingRef.current) {
      dispatch(orderHistoryRequest(queryParams));
      if (selectedOrderId) {
        dispatch(orderDetailRequest(selectedOrderId));
      }
      cancelingRef.current = null;
      dispatch(clearOrderMessages());
    }
  }, [message, dispatch, queryParams, selectedOrderId]);

  const handleViewDetail = (orderId) => {
    setSelectedOrderId(orderId);
    setShowDetail(true);
    dispatch(orderDetailRequest(orderId));
  };

  const handleCancelOrder = (orderId) => {
    if (!orderId) return;
    const confirmed = window.confirm("Bạn có chắc muốn hủy đơn hàng này?");
    if (!confirmed) return;
    cancelingRef.current = orderId;
    dispatch(orderCancelRequest(orderId));
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
  };

  const canCancelOrder = (order) => {
    const statusName = order?.order_status_id?.name;
    return statusName === "PENDING" || statusName === "PAID";
  };

  const renderStatusBadge = (statusName) => {
    const badgeClass = STATUS_BADGE[statusName] || "bg-gray-100 text-gray-800";
    const label =
      STATUS_OPTIONS.find((option) => option.value === statusName)?.label ||
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

  const totalPages = ordersPagination?.totalPages || 1;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử mua hàng</h1>
          <p className="text-sm text-gray-600 mt-1">
           
          </p>
        </div>

        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái (chọn nhiều)
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setStatusFilters([]);
                    setPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    statusFilters.length === 0
                      ? "bg-green-600 text-white border-green-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Tất cả
                </button>
                {FILTERABLE_STATUSES.map((status) => {
                  const isActive = statusFilters.includes(status.value);
                  return (
                    <button
                      key={status.value}
                      onClick={() => {
                        setStatusFilters((prev) => {
                          const next = prev.includes(status.value)
                            ? prev.filter((item) => item !== status.value)
                            : [...prev, status.value];
                          return next;
                        });
                        setPage(1);
                      }}
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        isActive
                          ? "bg-green-600 text-white border-green-600"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {status.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sắp xếp
              </label>
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [nextSortBy, nextSortOrder] = e.target.value.split(":");
                  setSortBy(nextSortBy);
                  setSortOrder(nextSortOrder);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="createdAt:desc">Mới nhất</option>
                <option value="createdAt:asc">Cũ nhất</option>
                <option value="total_price:desc">Tổng tiền giảm dần</option>
                <option value="total_price:asc">Tổng tiền tăng dần</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {historyLoading ? (
            <div className="py-10 text-center text-gray-600">
              Đang tải lịch sử đơn hàng...
            </div>
          ) : orders?.length === 0 ? (
            <div className="py-12 text-center text-gray-600">
              <Package className="mx-auto mb-3 text-gray-400" size={32} />
              Chưa có đơn hàng nào
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border rounded-lg p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        Mã đơn: {order._id}
                      </span>
                      {renderStatusBadge(order.order_status_id?.name)}
                    </div>
                    <div className="text-sm text-gray-700">
                      Ngày đặt: {formatDate(order.createdAt)}
                    </div>
                    <div className="text-sm text-gray-700">
                      Người nhận: {order.receiver_name} ({order.receiver_phone})
                    </div>
                    <div className="text-sm text-gray-700">
                      Địa chỉ: {order.receiver_address}
                    </div>
                  </div>

                  <div className="flex flex-col items-start lg:items-end gap-2">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(order.total_price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Thanh toán: {order.payment_method || "N/A"}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetail(order._id)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                      >
                        Xem chi tiết
                      </button>
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
                        >
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {ordersPagination && totalPages > 1 && (
          <div className="px-6 pb-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-gray-600">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {showDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Chi tiết đơn hàng
              </h2>
              <button
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
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
                        {renderStatusBadge(
                          orderDetail.order?.order_status_id?.name
                        )}
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
                      {orderDetail.details?.map((item) => (
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
      )}
    </div>
  );
};

export default OrderHistory;