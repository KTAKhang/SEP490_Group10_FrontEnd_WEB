import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Package,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  MapPin,
  Calendar,
  User,
  CreditCard,
  Search,
} from "lucide-react";
import {
  orderHistoryRequest,
  orderCancelRequest,
  clearOrderMessages,
  retryPaymentRequest,
} from "../../redux/actions/orderActions";
import { OrderHistoryDetailContent } from "./OrderHistoryDetail";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "READY-TO-SHIP", label: "Ready to ship" },
  { value: "SHIPPING", label: "Shipping" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REFUND", label: "Refund" },
  { value: "CANCELLED", label: "Cancelled" },
];

const FILTERABLE_STATUSES = STATUS_OPTIONS.filter(
  (status) => status.value !== "ALL",
);

const STATUS_BADGE = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  "READY-TO-SHIP": "bg-purple-100 text-purple-800",
  SHIPPING: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-green-100 text-green-800",
  REFUND: "bg-amber-100 text-amber-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const STATUS_PAYMEMT_BADGE = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SUCCESS: "bg-blue-100 text-blue-800",
  UNPAID: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-amber-100 text-amber-800",
  FAILED: "bg-red-100 text-red-800",
};

const normalizeStatus = (value) =>
  value
    ? value
      .toString()
      .trim()
      .toUpperCase()
      .replace(/[_\s]+/g, "-")
    : "";

/** Chuẩn hóa tên trạng thái từ backend (vd. READY_TO_SHIP) rồi lấy label hiển thị. */
const getStatusLabel = (name) => {
  if (!name) return "N/A";
  const normalized = normalizeStatus(name);
  return STATUS_OPTIONS.find((o) => o.value === normalized)?.label || name;
};

const toApiStatus = (value) => normalizeStatus(value).replace(/-/g, "_");

const formatCurrency = (value) =>
  (value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

const formatDate = (value) =>
  value ? new Date(value).toLocaleString("en-US") : "N/A";

const OrderHistory = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { orders, ordersPagination, historyLoading, message } = useSelector(
    (state) => state.order || {},
  );
  const navigate = useNavigate();

  const [statusFilters, setStatusFilters] = useState([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [detailOrderId, setDetailOrderId] = useState(null);
  const cancelingRef = useRef(null);

  // Debounce search: apply 400ms after user stops typing
  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Mở popup từ URL ?orderId= (deep link)
  const orderIdFromUrl = searchParams.get("orderId");
  const effectiveDetailId = detailOrderId ?? orderIdFromUrl;

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: appliedSearch || undefined,
      status_names:
        statusFilters.length > 0
          ? statusFilters.map((status) => toApiStatus(status))
          : undefined,
      sortBy,
      sortOrder,
    }),
    [page, limit, appliedSearch, statusFilters, sortBy, sortOrder],
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
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );
    if (!confirmed) return;
    cancelingRef.current = orderId;
    dispatch(orderCancelRequest(orderId));
  };

  const handleRePaymentOrder = (orderId) => {
    if (!orderId) return;
    const confirmed = window.confirm(
      "Are you sure you want to repayment this order?",
    );
    if (!confirmed) return;
    cancelingRef.current = orderId;
    dispatch(retryPaymentRequest(orderId));
  };

  // Backend: chỉ đơn COD và trạng thái PENDING mới được khách hủy
  const canCancelOrder = (order) => {
    const statusName = normalizeStatus(order?.order_status_id?.name);
    const paymentMethod = (order?.payment_method || "")
      .toString()
      .trim()
      .toUpperCase();
    return statusName === "PENDING" && paymentMethod === "COD";
  };

  const renderStatusBadge = (statusName) => {
    const normalized = normalizeStatus(statusName);
    const badgeClass = STATUS_BADGE[normalized] || "bg-gray-100 text-gray-800";
    const label = getStatusLabel(statusName);
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
      >
        {label}
      </span>
    );
  };
  const renderPaymentStatusBadge = (statusName) => {
    const normalized = normalizeStatus(statusName);
    const badgeClass =
      STATUS_PAYMEMT_BADGE[normalized] || "bg-gray-100 text-gray-800";
    const label = getStatusLabel(statusName);
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
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Full-width header strip (rectangle) */}
      <section className="w-full border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Order history
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  View and track all your orders
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width content area - rectangular layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Search + Filter bar */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order ID (24 characters)"
              className={`w-full pl-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm ${searchTerm ? "pr-9" : "pr-4"}`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600 mr-1 hidden sm:inline">
                Status:
              </span>
              <button
                onClick={() => {
                  setStatusFilters([]);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilters.length === 0
                    ? "bg-green-600 text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-700"
                  }`}
              >
                All
              </button>
              {FILTERABLE_STATUSES.map((status) => {
                const isActive = statusFilters.includes(status.value);
                return (
                  <button
                    key={status.value}
                    onClick={() => {
                      setStatusFilters((prev) =>
                        prev.includes(status.value) ? [] : [status.value],
                      );
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
                        ? "bg-green-600 text-white"
                        : "bg-white border border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-700"
                      }`}
                  >
                    {status.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-medium text-gray-600">Sort:</span>
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [nextSortBy, nextSortOrder] = e.target.value.split(":");
                  setSortBy(nextSortBy);
                  setSortOrder(nextSortOrder);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none cursor-pointer min-w-[160px]"
              >
                <option value="createdAt:desc">Newest first</option>
                <option value="createdAt:asc">Oldest first</option>
                <option value="total_price:desc">Total (high → low)</option>
                <option value="total_price:asc">Total (low → high)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Order list: wide rectangular cards */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {historyLoading ? (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 mb-4">
                <Package className="w-7 h-7 animate-pulse" />
              </div>
              <p className="text-gray-600 font-medium">
                Loading order history...
              </p>
              <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
            </div>
          ) : orders?.length === 0 ? (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 text-gray-400 mb-4">
                <Package className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No orders yet
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                When you place an order, it will show up here. Start shopping to
                see your history.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col xl:flex-row xl:items-stretch gap-0 hover:bg-gray-50/80 transition-colors"
                >
                  {/* Left: Order ID + Status (fixed width on large screens) */}
                  <div className="xl:w-56 flex-shrink-0 p-4 xl:py-5 xl:pr-0 flex flex-row xl:flex-col justify-between xl:justify-center gap-2 border-b xl:border-b-0 xl:border-r border-gray-100">
                    <span
                      className="text-xs font-mono text-gray-500 truncate max-w-[140px] xl:max-w-none"
                      title={order._id}
                    >
                      {order._id}
                    </span>
                    Order{renderStatusBadge(order.order_status_id?.name)}
                    Payment{renderPaymentStatusBadge(order.payment?.status)}
                  </div>

                  {/* Center: Date, Recipient, Address (flex grow - main content) */}
                  <div className="flex-1 min-w-0 p-4 xl:py-6 xl:px-7">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {/* Ngày đặt hàng */}
                      <div className="flex items-center gap-2.5 text-gray-700">
                        <div className="p-1.5 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="font-medium">{formatDate(order.createdAt)}</span>
                      </div>

                      {/* Thông tin người nhận */}
                      <div className="flex items-center gap-2.5 text-gray-700 md:col-span-2 min-w-0">
                        <div className="p-1.5 bg-gray-50 rounded-lg flex-shrink-0">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="truncate font-medium">
                          {order.receiver_name} <span className="text-gray-400">·</span>{" "}
                          <span className="text-gray-600">{order.receiver_phone}</span>
                        </span>
                      </div>

                      {/* Địa chỉ */}
                      <div className="flex items-start gap-2.5 text-gray-600 md:col-span-3 min-w-0">
                        <div className="p-1.5 bg-gray-50 rounded-lg flex-shrink-0">
                          <MapPin className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="truncate font-medium mt-1">
                          {order.receiver_address}
                        </span>
                      </div>

                      {/* Thông báo thanh toán thất bại */}
                      {order.payment.status === "PENDING" && (
                        <div className="md:col-span-3 mt-2 p-4 bg-red-50 border border-red-100 rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-red-100 rounded-lg flex-shrink-0">
                              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <div className="flex-1 space-y-2">
                              <p className="text-red-800 font-medium">Payment Incomplete</p>
                              <p className="text-red-600 text-sm leading-relaxed">
                                Your payment process is incomplete. Please create a new order to continue shopping.
                              </p>
                              <button
                                onClick={() => navigate("/products")}
                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Continue Shopping
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {order.payment.status === "FAILED" && (
                        <div className="md:col-span-3 mt-2 p-4 bg-red-50 border border-red-100 rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-red-100 rounded-lg flex-shrink-0">
                              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <div className="flex-1 space-y-2">
                              <p className="text-red-800 font-medium">Payment Pailed</p>
                              <p className="text-red-600 text-sm leading-relaxed">
                                Payment failed for yhis order. The order will disappear in 10 minutes. Please re-pay before then!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Total, Payment, Actions (fixed width column) */}
                  <div className="flex-shrink-0 p-4 xl:py-5 xl:pl-6 flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-3 border-t xl:border-t-0 xl:border-l border-gray-100 bg-gray-50/50 xl:bg-transparent">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(order.total_price)}
                        <span className="text-xs font-normal text-gray-500 ml-1">
                          VND
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5 text-gray-500 text-xs mt-0.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{order.payment_method || "N/A"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetail(order._id)}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer"
                      >
                        View details
                      </button>
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="px-3 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      {order.payment.status === "FAILED" && (
                        <button
                          onClick={() => handleRePaymentOrder(order._id)}
                          className="px-3 py-2 rounded-lg text-sm font-medium border border-green-200 text-green-600 hover:bg-green-50 transition-colors cursor-pointer"
                        >
                          Repayment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {ordersPagination && totalPages > 1 && (
            <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-center gap-3 bg-gray-50">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page === totalPages}
                className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

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