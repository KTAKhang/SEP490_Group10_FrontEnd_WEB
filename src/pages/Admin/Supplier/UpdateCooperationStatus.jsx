import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { updateCooperationStatusRequest } from "../../../redux/actions/supplierActions";

const UpdateCooperationStatus = ({ isOpen, onClose, supplierId, supplierName, currentStatus }) => {
  const dispatch = useDispatch();
  const { updateCooperationStatusLoading } = useSelector((state) => state.supplier);

  const [formData, setFormData] = useState({
    cooperationStatus: "ACTIVE",
    notes: "",
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (currentStatus) {
      setFormData((prev) => ({
        ...prev,
        cooperationStatus: currentStatus,
      }));
    }
  }, [currentStatus]);

  useEffect(() => {
    if (hasSubmitted && !updateCooperationStatusLoading) {
      setHasSubmitted(false);
      setFormData({
        cooperationStatus: "ACTIVE",
        notes: "",
      });
      onClose();
    }
  }, [hasSubmitted, updateCooperationStatusLoading, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.cooperationStatus) {
      return;
    }

    if (formData.cooperationStatus === currentStatus) {
      onClose();
      return;
    }

    setHasSubmitted(true);
    dispatch(
      updateCooperationStatusRequest(supplierId, formData)
    );
  };

  const handleCancel = () => {
    setHasSubmitted(false);
    setFormData({
      cooperationStatus: currentStatus || "ACTIVE",
      notes: "",
    });
    onClose();
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "ACTIVE":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          label: "Active",
        };
      case "SUSPENDED":
        return {
          icon: AlertCircle,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          label: "Suspended",
        };
      case "TERMINATED":
        return {
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          label: "Terminated",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          label: "Unknown",
        };
    }
  };

  if (!isOpen || !supplierId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <AlertCircle size={24} className="text-blue-600" />
            <span>Update Cooperation Status</span>
          </h2>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Supplier:</strong> {supplierName || "N/A"}
              </p>
              {currentStatus && (
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Current Status:</strong> {getStatusInfo(currentStatus).label}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cooperation Status <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                {["ACTIVE", "SUSPENDED", "TERMINATED"].map((status) => {
                  const statusInfo = getStatusInfo(status);
                  const Icon = statusInfo.icon;
                  const isSelected = formData.cooperationStatus === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, cooperationStatus: status })}
                      className={`px-4 py-3 border-2 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors ${
                        isSelected
                          ? `${statusInfo.borderColor} ${statusInfo.bgColor} ${statusInfo.color}`
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Icon size={24} />
                      <span className="font-medium text-sm">{statusInfo.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.cooperationStatus !== currentStatus && (
              <div className={`rounded-lg p-4 border-2 ${
                formData.cooperationStatus === "ACTIVE"
                  ? "bg-green-50 border-green-200"
                  : formData.cooperationStatus === "SUSPENDED"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-red-50 border-red-200"
              }`}>
                <p className="text-sm font-medium">
                  Status will change from <strong>{getStatusInfo(currentStatus).label}</strong> to{" "}
                  <strong>{getStatusInfo(formData.cooperationStatus).label}</strong>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
                placeholder="Enter reason or notes for status change"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/1000</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateCooperationStatusLoading || formData.cooperationStatus === currentStatus}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateCooperationStatusLoading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCooperationStatus;
