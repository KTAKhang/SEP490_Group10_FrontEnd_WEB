import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import {
  orderHistoryRequest,
  orderCancelRequest,
  clearOrderMessages,
} from "../../redux/actions/orderActions";
import { OrderHistoryDetailContent } from "./OrderHistoryDetail";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "READY-TO-SHIP", label: "Sẵn sàng giao" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "RETURNED", label: "Trả hàng" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const FILTERABLE_STATUSES = STATUS_OPTIONS.filter(
  (status) => status.value !== "ALL"
);

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

const toApiStatus = (value) => normalizeStatus(value).replace(/-/g, "_");

const formatCurrency = (value) =>
  (value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ";

const formatDate = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "N/A";

const OrderHistory = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    orders,
    ordersPagination,
    historyLoading,
    message,
  } = useSelector((state) => state.order || {});

  const [statusFilters, setStatusFilters] = useState([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [detailOrderId, setDetailOrderId] = useState(null);
  const cancelingRef = useRef(null);

  // Mở popup từ URL ?orderId= (deep link)
  const orderIdFromUrl = searchParams.get("orderId");
  const effectiveDetailId = detailOrderId ?? orderIdFromUrl;

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      status_names:
        statusFilters.length > 0
          ? statusFilters.map((status) => toApiStatus(status))
          : undefined,
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
      cancelingRef.current = null;
      dispatch(clearOrderMessages());
    }
  }, [message, dispatch, queryParams]);

  const handleViewDetail = (orderId) => {
    setDetailOrderId(orderId);
  };

  const handleCloseDetailModal = () => {
    setDetailOrderId(null);
    if (orderIdFromUrl) {
      searchParams.delete("orderId");
      setSearchParams(searchParams, { replace: true });
    }
  };

  const handleCancelOrder = (orderId) => {
    if (!orderId) return;
    const confirmed = window.confirm("Bạn có chắc muốn hủy đơn hàng này?");
    if (!confirmed) return;
    cancelingRef.current = orderId;
    dispatch(orderCancelRequest(orderId));
  };


  // Backend: chỉ đơn COD và trạng thái PENDING mới được khách hủy
  const canCancelOrder = (order) => {
    const statusName = normalizeStatus(order?.order_status_id?.name);
    const paymentMethod = (order?.payment_method || "").toString().trim().toUpperCase();
    return statusName === "PENDING" && paymentMethod === "COD";
  };

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
                Trạng thái
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
                        setStatusFilters((prev) =>
                          prev.includes(status.value) ? [] : [status.value]
                        );
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

      {/* Popup chi tiết đơn hàng (nội dung nằm ở OrderHistoryDetail.jsx) */}
      {effectiveDetailId && (
        <OrderHistoryDetailContent
          orderId={effectiveDetailId}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

export default OrderHistory;