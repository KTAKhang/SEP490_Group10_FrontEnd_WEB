import { X, User, ArrowRightLeft, Clock, FileText, Package } from "lucide-react";

const ROLE_LABEL = {
  admin: "Admin",
  "sales-staff": "Sales staff",
  customer: "Customer",
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "READY-TO-SHIP", label: "Ready to ship" },
  { value: "SHIPPING", label: "Shipping" },
  { value: "COMPLETED", label: "Completed" },
  { value: "RETURNED", label: "Returned" },
  { value: "CANCELLED", label: "Cancelled" },
];
const STATUS_LABEL = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]));
const getStatusLabel = (name) => {
  if (!name) return "—";
  const normalized = String(name).trim().replace(/_/g, "-");
  return STATUS_LABEL[name] || STATUS_LABEL[normalized] || name;
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const formatVND = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0);

/**
 * Modal chi tiết một bản ghi thay đổi trạng thái đơn hàng (layout giống ReceiptDetailModal).
 */
const OrderLogDetail = ({ isOpen, log, onClose }) => {
  if (!isOpen || !log) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const orderId =
    typeof log.order_id === "object" && log.order_id?._id
      ? log.order_id._id
      : log.order_id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200/80">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-green-50">
          <div className="flex items-center space-x-3">
            <ArrowRightLeft className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Order status change detail</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Status change information */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <ArrowRightLeft size={20} />
                <span>Status change information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Changed at</label>
                  <p className="text-base text-gray-900 font-medium flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    {formatDate(log.changed_at)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">From status</label>
                  <p className="text-base text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {getStatusLabel(log.from_status?.name)}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">To status</label>
                  <p className="text-base text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {getStatusLabel(log.to_status?.name)}
                    </span>
                  </p>
                </div>
                {(log.note || "").trim() && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Note</label>
                    <p className="text-base text-gray-900 bg-white p-3 rounded border border-gray-200 whitespace-pre-wrap">
                      {log.note}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order information */}
            {(orderId || (log.order_id && typeof log.order_id === "object")) && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <Package size={20} />
                  <span>Order information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orderId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Order ID</label>
                      <p className="text-base text-gray-900 font-mono text-sm break-all">
                        {typeof orderId === "string" ? orderId : String(orderId)}
                      </p>
                    </div>
                  )}
                  {log.order_id?.receiver_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Receiver name</label>
                      <p className="text-base text-gray-900 font-medium">
                        {log.order_id.receiver_name}
                      </p>
                    </div>
                  )}
                  {log.order_id?.receiver_phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Receiver phone</label>
                      <p className="text-base text-gray-900">{log.order_id.receiver_phone}</p>
                    </div>
                  )}
                  {log.order_id?.total_price != null && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Order total</label>
                      <p className="text-base text-gray-900 font-medium text-green-700">
                        {formatVND(log.order_id.total_price)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Changed by (staff / user) */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <User size={20} />
                <span>Changed by</span>
              </h3>
              {log.changed_by ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {log.changed_by.avatar && (
                    <div className="md:col-span-2 mb-2">
                      <img
                        src={log.changed_by.avatar}
                        alt={log.changed_by.user_name || "User"}
                        className="h-20 w-20 rounded-full object-cover border-2 border-purple-200"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                    <p className="text-base text-gray-900 font-medium">
                      {log.changed_by.user_name || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <p className="text-base text-gray-900">{log.changed_by.email || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                    <p className="text-base text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ROLE_LABEL[log.changed_by_role] || log.changed_by_role}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No user information</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderLogDetail;
