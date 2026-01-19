import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Calendar, Package, MapPin, AlertCircle } from "lucide-react";
import { updateHarvestBatchRequest, getHarvestBatchByIdRequest } from "../../../redux/actions/supplierActions";

const UpdateHarvestBatch = ({ isOpen, onClose, harvestBatchId }) => {
  const dispatch = useDispatch();
  const {
    harvestBatchDetail,
    harvestBatchDetailLoading,
    updateHarvestBatchLoading,
  } = useSelector((state) => state.supplier);

  const [formData, setFormData] = useState({
    batchNumber: "",
    harvestDate: "",
    quantity: "",
    location: "",
    qualityGrade: "A",
    notes: "",
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Load harvest batch data when modal opens
  useEffect(() => {
    if (isOpen && harvestBatchId) {
      dispatch(getHarvestBatchByIdRequest(harvestBatchId));
    }
  }, [dispatch, isOpen, harvestBatchId]);

  // Populate form when harvest batch detail is loaded
  useEffect(() => {
    if (harvestBatchDetail) {
      // Format harvestDate to YYYY-MM-DD
      const harvestDate = harvestBatchDetail.harvestDate
        ? new Date(harvestBatchDetail.harvestDate).toISOString().split("T")[0]
        : "";

      setFormData({
        batchNumber: harvestBatchDetail.batchNumber || "",
        harvestDate: harvestDate,
        quantity: harvestBatchDetail.quantity?.toString() || "",
        location: harvestBatchDetail.location || "",
        qualityGrade: harvestBatchDetail.qualityGrade || "A",
        notes: harvestBatchDetail.notes || "",
      });
    }
  }, [harvestBatchDetail]);

  // Close modal after successful update
  useEffect(() => {
    if (hasSubmitted && !updateHarvestBatchLoading) {
      setHasSubmitted(false);
      onClose();
    }
  }, [hasSubmitted, updateHarvestBatchLoading, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.batchNumber || !formData.harvestDate || !formData.quantity) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    // ✅ BR-SUP-12: Validation harvestDate không được lớn hơn ngày hiện tại
    const harvestDateObj = new Date(formData.harvestDate);
    harvestDateObj.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (harvestDateObj > today) {
      alert("Ngày thu hoạch không được lớn hơn ngày hiện tại.");
      return;
    }

    const quantityNum = parseInt(formData.quantity);
    if (isNaN(quantityNum) || quantityNum <= 0 || !Number.isInteger(quantityNum)) {
      alert("Số lượng phải là số nguyên lớn hơn 0.");
      return;
    }

    // Validation: quantity không được nhỏ hơn receivedQuantity
    const receivedQuantity = harvestBatchDetail?.receivedQuantity || 0;
    if (quantityNum < receivedQuantity) {
      alert(`Số lượng không thể nhỏ hơn số lượng đã nhập kho (${receivedQuantity} KG).`);
      return;
    }

    // Clean data - chỉ gửi các fields được phép update
    const cleanedData = {
      batchNumber: formData.batchNumber.trim(),
      harvestDate: formData.harvestDate,
      quantity: quantityNum,
      location: formData.location?.trim() || "",
      qualityGrade: formData.qualityGrade || "A",
      notes: formData.notes?.trim() || "",
    };

    setHasSubmitted(true);
    dispatch(updateHarvestBatchRequest(harvestBatchId, cleanedData));
  };

  const handleCancel = () => {
    setHasSubmitted(false);
    onClose();
  };

  if (!isOpen || !harvestBatchId) return null;

  const receivedQuantity = harvestBatchDetail?.receivedQuantity || 0;
  const canEdit = receivedQuantity === 0; // Chỉ cho phép edit nếu chưa nhập kho

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <Package size={24} />
            <span>Update Harvest Batch</span>
          </h2>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {harvestBatchDetailLoading ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Loading harvest batch details...</p>
          </div>
        ) : !harvestBatchDetail ? (
          <div className="p-6 text-center">
            <p className="text-red-600">Harvest batch not found</p>
          </div>
        ) : (
          <>
            {/* Warning if receivedQuantity > 0 */}
            {!canEdit && (
              <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Không thể chỉnh sửa lô thu hoạch đã được nhập kho
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Lô này đã có {receivedQuantity} KG được nhập kho. Chỉ có thể xem thông tin, không thể chỉnh sửa.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {/* Read-only Supplier & Product Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin không thể chỉnh sửa</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Supplier</p>
                      <p className="text-sm font-medium text-gray-900">
                        {harvestBatchDetail.supplier?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Product</p>
                      <p className="text-sm font-medium text-gray-900">
                        {harvestBatchDetail.product?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Batch Code</p>
                      <p className="text-sm font-medium text-gray-900">
                        {harvestBatchDetail.batchCode || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Received Quantity</p>
                      <p className="text-sm font-medium text-gray-900">
                        {receivedQuantity} KG
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter batch number"
                      required
                      disabled={!canEdit}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harvest Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        value={formData.harvestDate}
                        onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        max={today}
                        required
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity (KG) <span className="text-red-500">*</span>
                    {receivedQuantity > 0 && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Tối thiểu: {receivedQuantity} KG)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter quantity in KG"
                    min={receivedQuantity > 0 ? receivedQuantity : 1}
                    step="1"
                    required
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>Location</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter harvest location"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quality Grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.qualityGrade}
                    onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={!canEdit}
                  >
                    <option value="A">Grade A (Best)</option>
                    <option value="B">Grade B (Good)</option>
                    <option value="C">Grade C (Fair)</option>
                    <option value="D">Grade D (Poor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    rows="3"
                    placeholder="Enter notes"
                    maxLength={500}
                    disabled={!canEdit}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/500</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {canEdit ? "Cancel" : "Close"}
                </button>
                {canEdit && (
                  <button
                    type="submit"
                    disabled={updateHarvestBatchLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateHarvestBatchLoading ? "Updating..." : "Update Harvest Batch"}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdateHarvestBatch;
