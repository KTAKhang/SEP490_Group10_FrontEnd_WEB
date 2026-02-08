/**
 * RefundOrdersPage.jsx (Sales Staff)
 * Dedicated page for REFUND orders — "Confirm refund" action.
 * Standalone page for Sales Staff, separate from Admin.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RotateCcw, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import ReadOrderDetail from "./ReadOrderDetail";
import {
  orderAdminListRequest,
  orderAdminDetailRequest,
  orderConfirmRefundPaymentRequest,
  clearOrderMessages,
} from "../../../redux/actions/orderActions";

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

const normalizeStatus = (value) =>
  (value || "").toString().trim().toUpperCase().replace(/[_\s]+/g, "-");

const formatCurrency = (value) =>
  (value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

const formatDate = (value) =>
  value ? new Date(value).toLocaleString("en-US") : "N/A";

const RefundOrdersPage = () => {
  const dispatch = useDispatch();
  const {
    adminOrders,
    adminPagination,
    adminLoading,
    adminDetail,
    adminDetailLoading,
    message,
  } = useSelector((state) => state.order || {});

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailOrderId, setDetailOrderId] = useState(null);
  const prevConfirmRefundRef = useRef(false);

  const adminUpdateLoading = useSelector(
    (state) => state.order?.adminUpdateLoading ?? false
  );
  const confirmRefundLoading = adminUpdateLoading;

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      status_names: ["REFUND"],
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [page, limit]
  );

  useEffect(() => {
    dispatch(orderAdminListRequest(queryParams));
  }, [dispatch, queryParams]);

  useEffect(() => {
    if (showDetailModal && detailOrderId) {
      dispatch(orderAdminDetailRequest(detailOrderId));
    }
  }, [dispatch, showDetailModal, detailOrderId]);

  useEffect(() => {
    if (prevConfirmRefundRef.current && !adminUpdateLoading && message) {
      dispatch(orderAdminListRequest(queryParams));
      dispatch(clearOrderMessages());
      setShowDetailModal(false);
    }
    prevConfirmRefundRef.current = adminUpdateLoading;
  }, [adminUpdateLoading, message, dispatch, queryParams]);

  const handleOpenDetail = (orderId) => {
    setDetailOrderId(orderId);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setDetailOrderId(null);
  };

  const handleConfirmRefundPayment = (orderId) => {
    dispatch(orderConfirmRefundPaymentRequest(orderId));
  };

  const renderPaymentBadge = (payment) => {
    const status = (payment?.status || "").toString().trim().toUpperCase();
    const label =
      status === "PENDING"
        ? "Pending refund"
        : status === "SUCCESS"
        ? "Refunded"
        : status || "N/A";
    const badgeClass =
      PAYMENT_STATUS_BADGE[status] || "bg-gray-100 text-gray-700";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}`}
      >
        {label}
      </span>
    );
  };

  const renderStatusBadge = () => (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
      REFUND
    </span>
  );

  const orders = adminOrders || [];
  const totalPages = adminPagination?.totalPages ?? 1;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <RotateCcw size={28} className="text-amber-600" />
          Refund Orders
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Orders with REFUND status — Confirm refund when processing is complete. (Separate action from Update order status)
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {adminLoading ? (
          <div className="py-16 text-center text-gray-500">
            Loading REFUND orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No orders with REFUND status.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Receiver
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Payment status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => {
                    const paymentStatus = normalizeStatus(
                      order?.payment?.status || ""
                    );
                    const canConfirm =
                      order?.order_status_id?.name &&
                      normalizeStatus(order.order_status_id.name) === "REFUND" &&
                      paymentStatus === "PENDING";

                    return (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-mono text-gray-700">
                          {order._id?.slice(-8)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {order.receiver_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <div>{formatCurrency(order.total_price)} VND</div>
                          {!!(order.discount_code || (order.discount_amount != null && order.discount_amount > 0)) && (
                            <div className="text-xs text-green-600 font-normal mt-0.5">
                              Code: {order.discount_code} • -{formatCurrency(order.discount_amount)} VND
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {renderPaymentBadge(order.payment)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(order._id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye size={16} />
                              Details
                            </button>
                            {canConfirm && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleConfirmRefundPayment(order._id)
                                }
                                disabled={confirmRefundLoading}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50 transition-colors"
                              >
                                <RotateCcw size={16} />
                                {confirmRefundLoading ? "Processing..." : "Confirm refund"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-600">
                  Page {page} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page >= totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ReadOrderDetail
        isOpen={showDetailModal}
        adminDetailLoading={adminDetailLoading}
        adminDetail={adminDetail}
        onClose={handleCloseDetail}
        formatDate={formatDate}
        renderStatusBadge={renderStatusBadge}
        renderPaymentBadge={renderPaymentBadge}
        formatCurrency={formatCurrency}
        onConfirmRefund={handleConfirmRefundPayment}
        confirmRefundLoading={confirmRefundLoading}
      />
    </div>
  );
};

export default RefundOrdersPage;
