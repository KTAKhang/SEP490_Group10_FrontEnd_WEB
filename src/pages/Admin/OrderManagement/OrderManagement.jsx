import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Package,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
} from "lucide-react";
import {
  orderAdminListRequest,
  orderAdminUpdateRequest,
  orderAdminDetailRequest,
  orderAdminStatsRequest,
  clearOrderMessages,
} from "../../../redux/actions/orderActions";

const STATUS_OPTIONS = [
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

const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "SUCCESS", label: "Thanh toán thành công" },
  { value: "FAILED", label: "Thanh toán thất bại" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "REFUND_PENDING", label: "Chờ hoàn tiền" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
  { value: "REFUND_FAILED", label: "Hoàn tiền thất bại" },
];

const PAYMENT_STATUS_BADGE = {
  PENDING: "bg-yellow-50 text-yellow-700",
  SUCCESS: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
  UNPAID: "bg-orange-50 text-orange-700",
  REFUND_PENDING: "bg-purple-50 text-purple-700",
  REFUNDED: "bg-blue-50 text-blue-700",
  REFUND_FAILED: "bg-red-50 text-red-700",
};

const STATS_ORDER = [
  "PENDING",
  "PAID",
  "READY-TO-SHIP",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
];

const normalizeStatus = (value) =>
  value ? value.toString().trim().toUpperCase().replace(/[_\s]+/g, "-") : "";

const getNextStatuses = (paymentMethod, currentStatus) => {
  const method = normalizeStatus(paymentMethod);
  const current = normalizeStatus(currentStatus);
  const transitions = {
    COD: {
      PENDING: ["READY-TO-SHIP", "CANCELLED"],
      "READY-TO-SHIP": ["SHIPPING"],
      SHIPPING: ["COMPLETED"],
    },
    VNPAY: {
      PENDING: ["PAID", "CANCELLED"],
      PAID: ["READY-TO-SHIP"],
      "READY-TO-SHIP": ["SHIPPING"],
      SHIPPING: ["COMPLETED"],
    },
  };
  return transitions[method]?.[current] || [];
};

const formatCurrency = (value) =>
  (value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ";

const formatDate = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "N/A";

const OrderManagement = () => {
  const dispatch = useDispatch();
  const {
    adminOrders,
    adminPagination,
    adminLoading,
    adminUpdateLoading,
    adminDetail,
    adminDetailLoading,
    adminStats,
    message,
  } = useSelector((state) => state.order || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilters, setStatusFilters] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [nextStatus, setNextStatus] = useState("");
  const [note, setNote] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailOrderId, setDetailOrderId] = useState(null);
  const prevUpdateLoadingRef = useRef(false);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: searchTerm || undefined,
      status_names: statusFilters.length > 0 ? statusFilters : undefined,
      payment_method: paymentMethod !== "ALL" ? paymentMethod : undefined,
      payment_status: paymentStatus !== "ALL" ? paymentStatus : undefined,
      sortBy,
      sortOrder,
    }),
    [
      page,
      limit,
      searchTerm,
      statusFilters,
      paymentMethod,
      paymentStatus,
      sortBy,
      sortOrder,
    ]
  );

  useEffect(() => {
    dispatch(orderAdminListRequest(queryParams));
  }, [dispatch, queryParams]);

  useEffect(() => {
    dispatch(orderAdminStatsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (prevUpdateLoadingRef.current && !adminUpdateLoading && message) {
      dispatch(orderAdminListRequest(queryParams));
      dispatch(orderAdminStatsRequest());
      setShowUpdateModal(false);
      setSelectedOrder(null);
      setNextStatus("");
      setNote("");
      dispatch(clearOrderMessages());
    }
    prevUpdateLoadingRef.current = adminUpdateLoading;
  }, [adminUpdateLoading, message, dispatch, queryParams]);

  useEffect(() => {
    if (showDetailModal && detailOrderId) {
      dispatch(orderAdminDetailRequest(detailOrderId));
    }
  }, [dispatch, showDetailModal, detailOrderId]);

  const handleOpenUpdate = (order) => {
    const currentStatus = order?.order_status_id?.name;
    const available = getNextStatuses(order.payment_method, currentStatus);
    setSelectedOrder(order);
    setNextStatus(available[0] || "");
    setNote("");
    setShowUpdateModal(true);
  };

  const handleOpenDetail = (orderId) => {
    setDetailOrderId(orderId);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
  };

  const handleSubmitUpdate = () => {
    if (!selectedOrder || !nextStatus) return;
    dispatch(orderAdminUpdateRequest(selectedOrder._id, nextStatus, note));
  };

  const renderStatusBadge = (statusName) => {
    const normalized = normalizeStatus(statusName);
    const label =
      STATUS_OPTIONS.find((option) => option.value === normalized)?.label ||
      statusName ||
      "N/A";
    const badgeClass =
      STATUS_BADGE[normalized] || "bg-gray-100 text-gray-800";
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
      >
        {label}
      </span>
    );
  };

  const renderStatsCards = () => {
    const counts = adminStats?.statusCounts || [];
    const countMap = new Map(
      counts.map((item) => [normalizeStatus(item.status_name), item.total])
    );
    const totalOrders = adminStats?.totalOrders || 0;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500">Tổng đơn</div>
          <div className="text-2xl font-semibold text-gray-900">
            {totalOrders}
          </div>
        </div>
        {STATS_ORDER.map((status) => (
          <div
            key={status}
            className="bg-white border rounded-lg p-4 shadow-sm"
          >
            <div className="text-sm text-gray-500">
              {STATUS_OPTIONS.find((opt) => opt.value === status)?.label ||
                status}
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {countMap.get(status) || 0}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPaymentBadge = (payment) => {
    if (!payment?.status) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          N/A
        </span>
      );
    }
    const normalized = normalizeStatus(payment.status);
    const label =
      PAYMENT_STATUS_OPTIONS.find((opt) => opt.value === normalized)?.label ||
      payment.status;
    const badgeClass =
      PAYMENT_STATUS_BADGE[normalized] || "bg-gray-100 text-gray-700";
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
      >
        {label}
      </span>
    );
  };

  const totalPages = adminPagination?.totalPages || 1;

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Theo dõi và cập nhật trạng thái đơn hàng.
        </p>
      </div>

      <div className="p-6 border-b bg-gray-50 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">
          Tổng quan trạng thái đơn hàng
        </h2>
        {adminStats ? (
          renderStatsCards()
        ) : (
          <div className="text-sm text-gray-500">Đang tải thống kê...</div>
        )}
      </div>

      <div className="p-6 border-b bg-gray-50 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên hoặc SĐT người nhận"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="ALL">Tất cả phương thức</option>
              <option value="COD">COD</option>
              <option value="VNPAY">VNPAY</option>
            </select>
          </div>

          <div>
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="ALL">Tất cả trạng thái thanh toán</option>
              {PAYMENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái đơn hàng
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
              {STATUS_OPTIONS.map((status) => {
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
        {adminLoading ? (
          <div className="py-10 text-center text-gray-600">
            Đang tải đơn hàng...
          </div>
        ) : adminOrders?.length === 0 ? (
          <div className="py-12 text-center text-gray-600">
            <Package className="mx-auto mb-3 text-gray-400" size={32} />
            Chưa có đơn hàng nào
          </div>
        ) : (
          <div className="space-y-4">
            {adminOrders.map((order) => (
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
                  <div className="text-sm text-gray-700">
                    Thanh toán: {order.payment_method}
                  </div>
                </div>

                <div className="flex flex-col items-start lg:items-end gap-2">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(order.total_price)}
                  </div>
                  <div>{renderPaymentBadge(order.payment)}</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleOpenDetail(order._id)}
                      className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => handleOpenUpdate(order)}
                      className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      <ArrowRightLeft size={16} />
                      Cập nhật trạng thái
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {adminPagination && totalPages > 1 && (
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

      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Cập nhật trạng thái đơn hàng
              </h2>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-sm text-gray-700">
                Mã đơn: <span className="font-medium">{selectedOrder._id}</span>
              </div>
              <div className="text-sm text-gray-700">
                Trạng thái hiện tại:{" "}
                {renderStatusBadge(selectedOrder.order_status_id?.name)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái mới
                </label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {getNextStatuses(
                    selectedOrder.payment_method,
                    selectedOrder.order_status_id?.name
                  ).map((status) => (
                    <option key={status} value={status}>
                      {STATUS_OPTIONS.find((opt) => opt.value === status)?.label ||
                        status}
                    </option>
                  ))}
                </select>
                {getNextStatuses(
                  selectedOrder.payment_method,
                  selectedOrder.order_status_id?.name
                ).length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Không có trạng thái hợp lệ để chuyển tiếp.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú (tuỳ chọn)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ghi chú cho lần cập nhật trạng thái"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitUpdate}
                disabled={!nextStatus || adminUpdateLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adminUpdateLoading ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
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
                        {renderStatusBadge(
                          adminDetail.order?.order_status_id?.name
                        )}
                      </div>
                      <div>
                        Thanh toán: {adminDetail.order?.payment_method || "N/A"}
                      </div>
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

export default OrderManagement;