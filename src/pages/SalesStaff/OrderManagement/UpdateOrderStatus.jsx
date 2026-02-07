import { X } from "lucide-react";


const UpdateOrderStatus = ({
  isOpen,
  selectedOrder,
  nextStatus,
  note,
  onChangeNextStatus,
  onChangeNote,
  onClose,
  onSubmit,
  adminUpdateLoading,
  getNextStatuses,
  statusOptions,
  renderStatusBadge,
}) => {
  if (!isOpen || !selectedOrder) return null;


  const availableStatuses = getNextStatuses(
    selectedOrder.payment_method,
    selectedOrder.order_status_id?.name
  );


  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Update order status
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-sm text-gray-700">
            Order ID: <span className="font-medium">{selectedOrder._id}</span>
          </div>
          <div className="text-sm text-gray-700">
            Current status:{" "}
            {renderStatusBadge(selectedOrder.order_status_id?.name)}
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New status
            </label>
            <select
              value={nextStatus}
              onChange={(e) => onChangeNextStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {availableStatuses.length === 0 && (
                <option value="">N/A</option>
              )}
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusOptions.find((opt) => opt.value === status)?.label ||
                    status}
                </option>
              ))}
            </select>
            {availableStatuses.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No valid status to transition to.
              </p>
            )}
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => onChangeNote(e.target.value)}
              rows={3}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Note for this status update"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-5 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!nextStatus || adminUpdateLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adminUpdateLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrderStatus;

