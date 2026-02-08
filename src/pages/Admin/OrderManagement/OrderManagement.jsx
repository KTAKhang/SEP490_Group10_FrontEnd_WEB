import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Package,
  ShoppingCart,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
} from "lucide-react";
import ReadOrderDetail from "./ReadOrderDetail";
import UpdateOrderStatus from "./UpdateOrderStatus";
import {
  orderAdminListRequest,
  orderAdminUpdateRequest,
  orderAdminDetailRequest,
  orderAdminStatsRequest,
  orderConfirmRefundPaymentRequest,
  clearOrderMessages,
} from "../../../redux/actions/orderActions";


const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "READY-TO-SHIP", label: "Ready to ship" },
  { value: "SHIPPING", label: "Shipping" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REFUND", label: "Refund" },
  { value: "CANCELLED", label: "Cancelled" },
];


const STATUS_BADGE = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  "READY-TO-SHIP": "bg-purple-100 text-purple-800",
  SHIPPING: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-green-100 text-green-800",
  REFUND: "bg-amber-100 text-amber-800",
  CANCELLED: "bg-red-100 text-red-800",
};


const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending payment" },
  { value: "SUCCESS", label: "Payment success" },
  { value: "FAILED", label: "Payment failed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "REFUND_PENDING", label: "Refund pending" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "REFUND_FAILED", label: "Refund failed" },
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
  "REFUND",
  "CANCELLED",
];


const normalizeStatus = (value) =>
  value ? value.toString().trim().toUpperCase().replace(/[_\s]+/g, "-") : "";


/** Chuẩn hóa tên trạng thái từ backend (vd. READY_TO_SHIP) rồi lấy label hiển thị. */
const getStatusLabel = (name) => {
  if (!name) return "N/A";
  const normalized = normalizeStatus(name);
  return STATUS_OPTIONS.find((o) => o.value === normalized)?.label || name;
};


const getNextStatuses = (paymentMethod, currentStatus) => {
  const method = normalizeStatus(paymentMethod);
  const current = normalizeStatus(currentStatus);
  // Only COMPLETED orders can be changed to REFUND by admin/sales-staff
  if (current === "COMPLETED") {
    return ["REFUND"];
  }
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
  (value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });


const formatDate = (value) =>
  value ? new Date(value).toLocaleString("en-US") : "N/A";


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
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">Total orders</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{totalOrders}</div>
        </div>
        {STATS_ORDER.map((status) => (
          <div
            key={status}
            className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="text-sm text-gray-500">
              {getStatusLabel(status)}
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {countMap.get(status) || 0}
            </div>
          </div>
        ))}
      </div>
    );
  };


  // Hide "Update status" when: REFUND/CANCELLED (final states) or VNPAY + PENDING + payment PENDING
  const shouldHideUpdateStatusButton = (order) => {
    const orderStatus = normalizeStatus(order?.order_status_id?.name);
    if (orderStatus === "REFUND" || orderStatus === "CANCELLED") return true;
    const method = (order?.payment_method || "").toString().trim().toUpperCase();
    const paymentStatus = (order?.payment?.status || "").toString().trim().toUpperCase();
    return method === "VNPAY" && orderStatus === "PENDING" && paymentStatus === "PENDING";
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
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Order Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track and update order status</p>
          </div>
        </div>
      </div>


      <div className="border-b border-gray-100 bg-gray-50/50 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">
          Order status overview
        </h2>
        {adminStats ? (
          renderStatsCards()
        ) : (
          <div className="text-sm text-gray-500">Loading statistics...</div>
        )}
      </div>


      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50/50 space-y-4">
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
              placeholder="Search by recipient name or phone"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>


          <div>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">All payment methods</option>
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
              className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">All payment statuses</option>
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
              Order status
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setStatusFilters([]);
                  setPage(1);
                }}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  statusFilters.length === 0
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                All
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
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
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
              Sort
            </label>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [nextSortBy, nextSortOrder] = e.target.value.split(":");
                setSortBy(nextSortBy);
                setSortOrder(nextSortOrder);
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="createdAt:desc">Newest</option>
              <option value="createdAt:asc">Oldest</option>
              <option value="total_price:desc">Total (high to low)</option>
              <option value="total_price:asc">Total (low to high)</option>
            </select>
          </div>
        </div>
      </div>


      <div className="p-6">
        {adminLoading ? (
          <div className="py-10 text-center text-gray-600">
            Loading orders...
          </div>
        ) : adminOrders?.length === 0 ? (
          <div className="py-12 text-center text-gray-600">
            <Package className="mx-auto mb-3 text-gray-400" size={32} />
            No orders yet
          </div>
        ) : (
          <div className="space-y-4">
            {adminOrders.map((order) => (
              <div
                key={order._id}
                className="rounded-xl border border-gray-200 bg-gray-50/30 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Order ID: {order._id}
                    </span>
                    {renderStatusBadge(order.order_status_id?.name)}
                  </div>
                  <div className="text-sm text-gray-700">
                    Order date: {formatDate(order.createdAt)}
                  </div>
                  <div className="text-sm text-gray-700">
                    Recipient: {order.receiver_name} ({order.receiver_phone})
                  </div>
                  <div className="text-sm text-gray-700">
                    Address: {order.receiver_address}
                  </div>
                  <div className="text-sm text-gray-700">
                    Payment: {order.payment_method}
                  </div>
                  {(order.discount_code || (order.discount_amount && order.discount_amount > 0)) && (
                    <div className="text-sm text-gray-700 space-y-0.5">
                      <div>Mã giảm giá: <span className="font-medium">{order.discount_code}</span></div>
                      <div>Giảm: <span className="text-green-600 font-medium">-{formatCurrency(order.discount_amount)}</span></div>
                      <div>Tổng sau giảm: <span className="font-medium">{formatCurrency(order.total_price)}</span></div>
                    </div>
                  )}
                </div>


                <div className="flex flex-col items-start lg:items-end gap-2">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(order.total_price)}
                  </div>
                  {(order.discount_code || (order.discount_amount > 0)) && (
                    <div className="text-sm text-gray-600">
                      Mã: {order.discount_code} • Giảm {formatCurrency(order.discount_amount)}
                    </div>
                  )}
                  <div>{renderPaymentBadge(order.payment)}</div>
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      onClick={() => handleOpenDetail(order._id)}
                      className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                      title="View details"
                    >
                      <Eye size={18} />
                    </button>
                    {!shouldHideUpdateStatusButton(order) && (
                      <button
                        onClick={() => handleOpenUpdate(order)}
                        className="rounded-xl p-2 text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                        title="Update status"
                      >
                        <ArrowRightLeft size={18} />
                      </button>
                    )}
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
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-600">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}


      <UpdateOrderStatus
        isOpen={showUpdateModal}
        selectedOrder={selectedOrder}
        nextStatus={nextStatus}
        note={note}
        onChangeNextStatus={setNextStatus}
        onChangeNote={setNote}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleSubmitUpdate}
        adminUpdateLoading={adminUpdateLoading}
        getNextStatuses={getNextStatuses}
        statusOptions={STATUS_OPTIONS}
        renderStatusBadge={renderStatusBadge}
      />


      <ReadOrderDetail
        isOpen={showDetailModal}
        adminDetailLoading={adminDetailLoading}
        adminDetail={adminDetail}
        onClose={handleCloseDetail}
        formatDate={formatDate}
        renderStatusBadge={renderStatusBadge}
        renderPaymentBadge={renderPaymentBadge}
        formatCurrency={formatCurrency}
        onConfirmRefund={(id) => dispatch(orderConfirmRefundPaymentRequest(id))}
        confirmRefundLoading={adminUpdateLoading}
      />
    </div>
  );
};


export default OrderManagement;


