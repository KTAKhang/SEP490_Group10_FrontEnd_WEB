import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { evaluatePerformanceRequest } from "../../../../redux/actions/supplierActions";
import { getSuppliersRequest } from "../../../../redux/actions/supplierActions";

const EvaluatePerformance = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { suppliers } = useSelector((state) => state.supplier);
  const { evaluatePerformanceLoading } = useSelector((state) => state.supplier);

  const [formData, setFormData] = useState({
    supplierId: "",
    period: "",
    metrics: {
      qualityRate: "",
      onTimeDeliveryRate: "",
      totalQuantitySupplied: "",
      totalBatches: "",
      rejectedBatches: "",
      averageQualityScore: "",
    },
    notes: "",
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(getSuppliersRequest({ page: 1, limit: 1000, status: true }));
      // Set default period to current month (YYYY-MM)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      setFormData((prev) => ({
        ...prev,
        period: `${year}-${month}`,
      }));
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (hasSubmitted && !evaluatePerformanceLoading) {
      setHasSubmitted(false);
      setFormData({
        supplierId: "",
        period: "",
        metrics: {
          qualityRate: "",
          onTimeDeliveryRate: "",
          totalQuantitySupplied: "",
          totalBatches: "",
          rejectedBatches: "",
          averageQualityScore: "",
        },
        notes: "",
      });
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSubmitted, evaluatePerformanceLoading]);

  const handleMetricChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    let clampedValue = numValue;

    if (field === "qualityRate" || field === "onTimeDeliveryRate" || field === "averageQualityScore") {
      clampedValue = Math.max(0, Math.min(100, numValue));
    } else {
      clampedValue = Math.max(0, numValue);
    }

    setFormData({
      ...formData,
      metrics: {
        ...formData.metrics,
        [field]: clampedValue,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.supplierId || !formData.period) {
      return;
    }

    if (!/^\d{4}-\d{2}$/.test(formData.period)) {
      return;
    }

    // ✅ Validation: period không được là tháng tương lai
    const [year, month] = formData.period.split('-').map(Number);
    const periodDate = new Date(year, month - 1, 1);
    const today = new Date();
    const currentPeriod = new Date(today.getFullYear(), today.getMonth(), 1);
    if (periodDate > currentPeriod) {
      alert("Period không được là tháng tương lai. Chỉ có thể đánh giá cho tháng hiện tại hoặc quá khứ.");
      return;
    }

    // Parse metrics
    const totalBatches = Number(formData.metrics.totalBatches) || 0;
    const rejectedBatches = Number(formData.metrics.rejectedBatches) || 0;

    // ✅ Validation: rejectedBatches không được lớn hơn totalBatches
    if (rejectedBatches > totalBatches) {
      alert(`rejectedBatches (${rejectedBatches}) không được lớn hơn totalBatches (${totalBatches})`);
      return;
    }

    // Calculate quarter based on month
    const quarter = month <= 3 ? 1 : month <= 6 ? 2 : month <= 9 ? 3 : 4;

    // Prepare payload with parsed period data
    // Backend requires period string (YYYY-MM) - backend sẽ tự parse thành periodType, year, month, quarter
    const payload = {
      supplierId: formData.supplierId,
      period: formData.period, // Backend validates format YYYY-MM
      metrics: {
        qualityRate: Number(formData.metrics.qualityRate) || 0,
        onTimeDeliveryRate: Number(formData.metrics.onTimeDeliveryRate) || 0,
        totalQuantitySupplied: Number(formData.metrics.totalQuantitySupplied) || 0,
        totalBatches: totalBatches,
        rejectedBatches: rejectedBatches,
        averageQualityScore: Number(formData.metrics.averageQualityScore) || 0,
      },
      notes: formData.notes || "",
    };

    setHasSubmitted(true);
    dispatch(evaluatePerformanceRequest(payload));
  };

  const handleCancel = () => {
    setHasSubmitted(false);
    setFormData({
      supplierId: "",
      period: "",
      metrics: {
        qualityRate: "",
        onTimeDeliveryRate: "",
        totalQuantitySupplied: "",
        totalBatches: "",
        rejectedBatches: "",
        averageQualityScore: "",
      },
      notes: "",
    });
    onClose();
  };

  // Calculate overall score preview
  const calculateOverallScore = () => {
    const { qualityRate, onTimeDeliveryRate, averageQualityScore } = formData.metrics;
    const quality = parseFloat(qualityRate) || 0;
    const onTime = parseFloat(onTimeDeliveryRate) || 0;
    const avgQuality = parseFloat(averageQualityScore) || 0;
    return Math.round(quality * 0.4 + onTime * 0.3 + avgQuality * 0.3);
  };

  const overallScore = calculateOverallScore();

  const getRating = (score) => {
    if (score >= 90) return { label: "EXCELLENT", color: "bg-green-100 text-green-800" };
    if (score >= 75) return { label: "GOOD", color: "bg-blue-100 text-blue-800" };
    if (score >= 60) return { label: "FAIR", color: "bg-yellow-100 text-yellow-800" };
    return { label: "POOR", color: "bg-red-100 text-red-800" };
  };

  const rating = getRating(overallScore);

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
            <BarChart3 size={24} className="text-purple-600" />
            <span>Evaluate Supplier Performance</span>
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
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Period (YYYY-MM) <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="month"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Evaluation period (month/year)</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <TrendingUp size={20} className="text-green-600" />
                <span>Performance Metrics</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quality Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.metrics.qualityRate}
                    onChange={(e) => handleMetricChange("qualityRate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0-100"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Percentage of products passing quality check</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    On-Time Delivery Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.metrics.onTimeDeliveryRate}
                    onChange={(e) => handleMetricChange("onTimeDeliveryRate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0-100"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Percentage of deliveries on time</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Quantity Supplied
                  </label>
                  <input
                    type="number"
                    value={formData.metrics.totalQuantitySupplied}
                    onChange={(e) => handleMetricChange("totalQuantitySupplied", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter total quantity"
                    min="0"
                    step="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Batches
                  </label>
                  <input
                    type="number"
                    value={formData.metrics.totalBatches}
                    onChange={(e) => handleMetricChange("totalBatches", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter total batches"
                    min="0"
                    step="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejected Batches
                  </label>
                  <input
                    type="number"
                    value={formData.metrics.rejectedBatches}
                    onChange={(e) => handleMetricChange("rejectedBatches", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter rejected batches"
                    min="0"
                    step="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Average Quality Score (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.metrics.averageQualityScore}
                    onChange={(e) => handleMetricChange("averageQualityScore", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0-100"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Average quality score from verifications</p>
                </div>
              </div>
            </div>

            {/* Overall Score Preview */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Performance Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                  <p className="text-3xl font-bold text-purple-900">{overallScore}/100</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rating</p>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${rating.color}`}>
                    {rating.label}
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                <p>Formula: (Quality Rate × 0.4) + (On-Time Delivery Rate × 0.3) + (Average Quality Score × 0.3)</p>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
                placeholder="Enter evaluation notes"
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
              disabled={evaluatePerformanceLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {evaluatePerformanceLoading ? "Evaluating..." : "Evaluate Performance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluatePerformance;
