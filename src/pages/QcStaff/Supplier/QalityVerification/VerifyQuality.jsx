import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, CheckCircle, XCircle, AlertTriangle, Star } from "lucide-react";
import { verifyQualityRequest } from "../../../../redux/actions/supplierActions";
import { getSuppliersRequest } from "../../../../redux/actions/supplierActions";
import { getProductsRequest } from "../../../../redux/actions/productActions";

const VerifyQuality = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { suppliers } = useSelector((state) => state.supplier);
  const { products } = useSelector((state) => state.product);
  const { verifyQualityLoading } = useSelector((state) => state.supplier);

  const [formData, setFormData] = useState({
    supplierId: "",
    productId: "",
    harvestBatchId: "",
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

  useEffect(() => {
    if (isOpen) {
      dispatch(getSuppliersRequest({ page: 1, limit: 1000, status: true }));
      dispatch(getProductsRequest({ page: 1, limit: 1000 }));
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (hasSubmitted && !verifyQualityLoading) {
      setHasSubmitted(false);
      setFormData({
        supplierId: "",
        productId: "",
        harvestBatchId: "",
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
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSubmitted, verifyQualityLoading]);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.supplierId || !formData.productId || !formData.verificationResult) {
      return;
    }

    const approvedQty = parseInt(formData.approvedQuantity) || 0;
    const rejectedQty = parseInt(formData.rejectedQuantity) || 0;

    if (approvedQty < 0 || rejectedQty < 0) {
      return;
    }

    // Ensure criteria values are numbers, not strings
    const criteriaNumeric = {
      appearance: Number(formData.criteria.appearance) || 0,
      freshness: Number(formData.criteria.freshness) || 0,
      size: Number(formData.criteria.size) || 0,
      color: Number(formData.criteria.color) || 0,
      defects: Number(formData.criteria.defects) || 0,
    };

    setHasSubmitted(true);
    dispatch(
      verifyQualityRequest({
        ...formData,
        criteria: criteriaNumeric,
        approvedQuantity: approvedQty,
        rejectedQuantity: rejectedQty,
        harvestBatchId: formData.harvestBatchId || undefined, // Send undefined if empty
      })
    );
  };

  const handleCancel = () => {
    setHasSubmitted(false);
    setFormData({
      supplierId: "",
      productId: "",
      harvestBatchId: "",
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
    onClose();
  };

  // Calculate overall score based on criteria
  const calculateOverallScore = () => {
    const { appearance, freshness, size, color, defects } = formData.criteria;
    const baseScore = (appearance + freshness + size + color) / 4 * 10;
    return Math.max(0, Math.min(100, baseScore - defects * 2));
  };

  const overallScore = calculateOverallScore();

  // Filter suppliers: only ACTIVE and status true
  const activeSuppliers = suppliers?.filter(
    (s) => s.cooperationStatus === "ACTIVE" && s.status === true
  ) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <CheckCircle size={24} className="text-green-600" />
            <span>Verify Product Quality</span>
          </h2>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value, productId: "", harvestBatchId: "" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select supplier</option>
                  {activeSuppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name} ({supplier.type === "FARM" ? "Farm" : supplier.type === "COOPERATIVE" ? "Cooperative" : "Business"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value, harvestBatchId: "" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  disabled={!formData.supplierId}
                >
                  <option value="">Select product</option>
                  {products?.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} {product.brand && `(${product.brand})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Harvest Batch (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harvest Batch (Optional)
              </label>
              <input
                type="text"
                value={formData.harvestBatchId}
                onChange={(e) => setFormData({ ...formData, harvestBatchId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter harvest batch ID (optional)"
              />
            </div>

            {/* Verification Result */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Result <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, verificationResult: "PASSED" })}
                  className={`px-4 py-3 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                    formData.verificationResult === "PASSED"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-300 hover:border-green-300"
                  }`}
                >
                  <CheckCircle size={20} />
                  <span className="font-medium">PASSED</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, verificationResult: "FAILED" })}
                  className={`px-4 py-3 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                    formData.verificationResult === "FAILED"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-300 hover:border-red-300"
                  }`}
                >
                  <XCircle size={20} />
                  <span className="font-medium">FAILED</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, verificationResult: "CONDITIONAL" })}
                  className={`px-4 py-3 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                    formData.verificationResult === "CONDITIONAL"
                      ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                      : "border-gray-300 hover:border-yellow-300"
                  }`}
                >
                  <AlertTriangle size={20} />
                  <span className="font-medium">CONDITIONAL</span>
                </button>
              </div>
            </div>

            {/* Quality Criteria */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Star size={20} className="text-yellow-500" />
                <span>Quality Criteria (0-10 points each)</span>
              </h3>
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
              disabled={verifyQualityLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyQualityLoading ? "Verifying..." : "Verify Quality"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyQuality;
