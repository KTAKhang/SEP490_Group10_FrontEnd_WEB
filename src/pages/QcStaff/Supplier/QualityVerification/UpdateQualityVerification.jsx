import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, CheckSquare, CheckCircle, XCircle, AlertCircle, TrendingUp } from "lucide-react";
import { updateQualityVerificationRequest } from "../../../../redux/actions/supplierActions";
import { getSuppliersRequest } from "../../../../redux/actions/supplierActions";
import { getProductsRequest } from "../../../../redux/actions/productActions";

const UpdateQualityVerification = ({ isOpen, onClose, verification }) => {
  const dispatch = useDispatch();
  const { 
    suppliers, 
    updateQualityVerificationLoading,
    qualityVerificationDetail 
  } = useSelector((state) => state.supplier);
  const { products } = useSelector((state) => state.product);

  const [formData, setFormData] = useState({
    verificationResult: "PASSED",
    criteria: {
      appearance: 0,
      freshness: 0,
      size: 0,
      color: 0,
      defects: 0,
    },
    approvedQuantity: "",
    rejectedQuantity: "",
    notes: "",
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const loadedVerificationIdRef = useRef(null);

  // Load form data when modal opens or when qualityVerificationDetail is available
  useEffect(() => {
    if (!isOpen) {
      loadedVerificationIdRef.current = null;
      return;
    }

    const source = qualityVerificationDetail || verification;
    if (source && source._id) {
      // Only update if we haven't loaded this verification yet or if it's a different one
      if (loadedVerificationIdRef.current !== source._id) {
        loadedVerificationIdRef.current = source._id;
        setFormData({
          verificationResult: source.verificationResult || "PASSED",
          criteria: {
            appearance: source.criteria?.appearance || 0,
            freshness: source.criteria?.freshness || 0,
            size: source.criteria?.size || 0,
            color: source.criteria?.color || 0,
            defects: source.criteria?.defects || 0,
          },
          approvedQuantity: source.approvedQuantity || "",
          rejectedQuantity: source.rejectedQuantity || "",
          notes: source.notes || "",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, qualityVerificationDetail]);

  useEffect(() => {
    if (isOpen) {
      dispatch(getSuppliersRequest({ page: 1, limit: 1000, status: true }));
      dispatch(getProductsRequest({ page: 1, limit: 1000 }));
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (hasSubmitted && !updateQualityVerificationLoading) {
      setHasSubmitted(false);
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSubmitted, updateQualityVerificationLoading]);

  const handleCriteriaChange = (field, value) => {
    const numValue = Math.max(0, Math.min(10, parseFloat(value) || 0));
    setFormData({
      ...formData,
      criteria: {
        ...formData.criteria,
        [field]: numValue,
      },
    });
  };

  const calculateOverallScore = () => {
    const { appearance, freshness, size, color, defects } = formData.criteria;
    const baseScore = (appearance + freshness + size + color) / 4 * 10;
    return Math.max(0, Math.min(100, baseScore - defects * 2));
  };

  const overallScore = calculateOverallScore();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.verificationResult) {
      return;
    }

    // Ensure quantities are integers
    const approvedQtyValue = formData.approvedQuantity === "" || formData.approvedQuantity === null || formData.approvedQuantity === undefined 
      ? 0 
      : Math.max(0, Math.floor(Number(formData.approvedQuantity)) || 0);
    const rejectedQtyValue = formData.rejectedQuantity === "" || formData.rejectedQuantity === null || formData.rejectedQuantity === undefined 
      ? 0 
      : Math.max(0, Math.floor(Number(formData.rejectedQuantity)) || 0);

    const approvedQty = Number.isInteger(approvedQtyValue) ? approvedQtyValue : 0;
    const rejectedQty = Number.isInteger(rejectedQtyValue) ? rejectedQtyValue : 0;

    if (approvedQty < 0 || rejectedQty < 0) {
      return;
    }

    // Backend validation: total must be > 0
    if (approvedQty + rejectedQty === 0) {
      alert("Tổng approvedQuantity + rejectedQuantity phải lớn hơn 0");
      return;
    }

    // Backend validation: if PASSED, approvedQuantity must be > 0
    if (formData.verificationResult === "PASSED" && approvedQty === 0) {
      alert("Nếu kết quả kiểm tra là PASSED, approvedQuantity phải lớn hơn 0");
      return;
    }

    // Ensure criteria values are numbers
    const criteriaNumeric = {
      appearance: Number(formData.criteria.appearance) || 0,
      freshness: Number(formData.criteria.freshness) || 0,
      size: Number(formData.criteria.size) || 0,
      color: Number(formData.criteria.color) || 0,
      defects: Number(formData.criteria.defects) || 0,
    };

    // ✅ Validation: criteria values phải trong range 0-10
    const criteriaFields = ["appearance", "freshness", "size", "color", "defects"];
    for (const field of criteriaFields) {
      const value = criteriaNumeric[field];
      if (!Number.isFinite(value) || value < 0 || value > 10) {
        alert(`Criteria.${field} phải là số từ 0 đến 10.`);
        return;
      }
    }

    const source = qualityVerificationDetail || verification;
    if (!source || !source._id) return;

    setHasSubmitted(true);
    dispatch(
      updateQualityVerificationRequest(source._id, {
        verificationResult: formData.verificationResult,
        criteria: criteriaNumeric,
        approvedQuantity: approvedQty,
        rejectedQuantity: rejectedQty,
        notes: formData.notes,
      })
    );
  };

  const handleCancel = () => {
    setHasSubmitted(false);
    onClose();
  };

  const source = qualityVerificationDetail || verification;
  if (!isOpen || !source) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <CheckSquare size={24} className="text-green-600" />
            <span>Update Quality Verification</span>
          </h2>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Supplier & Product Info (Read-only) */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Supplier</p>
                  <p className="text-base font-medium text-gray-900">
                    {source.supplier?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Product</p>
                  <p className="text-base font-medium text-gray-900">
                    {source.product?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Result */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Result <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.verificationResult}
                onChange={(e) => setFormData({ ...formData, verificationResult: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="PASSED">Passed</option>
                <option value="FAILED">Failed</option>
                <option value="CONDITIONAL">Conditional</option>
              </select>
            </div>

            {/* Criteria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Criteria (0-10 scale)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Appearance</label>
                  <input
                    type="number"
                    value={formData.criteria.appearance}
                    onChange={(e) => handleCriteriaChange("appearance", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    max="10"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Freshness</label>
                  <input
                    type="number"
                    value={formData.criteria.freshness}
                    onChange={(e) => handleCriteriaChange("freshness", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    max="10"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <input
                    type="number"
                    value={formData.criteria.size}
                    onChange={(e) => handleCriteriaChange("size", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    max="10"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="number"
                    value={formData.criteria.color}
                    onChange={(e) => handleCriteriaChange("color", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    max="10"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Defects</label>
                  <input
                    type="number"
                    value={formData.criteria.defects}
                    onChange={(e) => handleCriteriaChange("defects", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    max="10"
                    step="0.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower is better</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  Overall Score: <span className="text-xl">{overallScore.toFixed(1)}/100</span>
                </p>
              </div>
            </div>

            {/* Quantities */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approved Quantity
                </label>
                <input
                  type="number"
                  value={formData.approvedQuantity}
                  onChange={(e) => setFormData({ ...formData, approvedQuantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter approved quantity"
                  min="0"
                  step="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejected Quantity
                </label>
                <input
                  type="number"
                  value={formData.rejectedQuantity}
                  onChange={(e) => setFormData({ ...formData, rejectedQuantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter rejected quantity"
                  min="0"
                  step="1"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
                placeholder="Enter verification notes"
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
              disabled={updateQualityVerificationLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateQualityVerificationLoading ? "Updating..." : "Update Verification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateQualityVerification;
