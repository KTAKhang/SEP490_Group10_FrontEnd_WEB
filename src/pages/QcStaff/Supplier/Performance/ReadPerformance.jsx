import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, BarChart3, TrendingUp, Calendar, Building2, Award } from "lucide-react";
import { getPerformanceByIdRequest } from "../../../../redux/actions/supplierActions";
import Loading from "../../../../components/Loading/Loading";

const ReadPerformance = ({ isOpen, onClose, performanceId }) => {
  const dispatch = useDispatch();
  const {
    performanceDetail,
    performanceDetailLoading,
  } = useSelector((state) => state.supplier);

  useEffect(() => {
    if (isOpen && performanceId) {
      dispatch(getPerformanceByIdRequest(performanceId));
    }
  }, [dispatch, isOpen, performanceId]);

  const getRatingBadge = (rating) => {
    switch (rating) {
      case "EXCELLENT":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <Award size={16} className="mr-1" />
            Excellent
          </span>
        );
      case "GOOD":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Award size={16} className="mr-1" />
            Good
          </span>
        );
      case "FAIR":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Award size={16} className="mr-1" />
            Fair
          </span>
        );
      case "POOR":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <Award size={16} className="mr-1" />
            Poor
          </span>
        );
      default:
        return <span className="text-gray-500">N/A</span>;
    }
  };

  const formatPeriod = (period) => {
    if (!period) return "N/A";
    const [year, month] = period.split("-");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen || !performanceId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <BarChart3 size={24} />
            <span>Performance Evaluation Details</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {performanceDetailLoading ? (
          <div className="p-6">
            <Loading message="Loading performance evaluation details..." />
          </div>
        ) : performanceDetail ? (
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                    <Calendar size={16} className="text-gray-400" />
                    <span>Period</span>
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {formatPeriod(performanceDetail.period)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rating</p>
                  {getRatingBadge(performanceDetail.rating)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                    <TrendingUp size={16} className="text-gray-400" />
                    <span>Overall Score</span>
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {performanceDetail.overallScore || performanceDetail.metrics?.overallScore || 0}/100
                  </p>
                </div>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Supplier</h3>
              <div className="flex items-start space-x-3">
                <Building2 size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-base font-medium text-gray-900">
                    {performanceDetail.supplier?.name || "N/A"}
                  </p>
                  {performanceDetail.supplier?.code && (
                    <p className="text-xs text-gray-500 mt-1">
                      Code: {performanceDetail.supplier.code}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-sm text-gray-500 mb-1">Quality Rate</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${performanceDetail.metrics?.qualityRate || 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {performanceDetail.metrics?.qualityRate || 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-sm text-gray-500 mb-1">On-Time Delivery Rate</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${performanceDetail.metrics?.onTimeDeliveryRate || 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {performanceDetail.metrics?.onTimeDeliveryRate || 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-sm text-gray-500 mb-1">Total Batches</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {performanceDetail.metrics?.totalBatches || 0}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-sm text-gray-500 mb-1">Average Batch Quality</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {performanceDetail.metrics?.averageBatchQuality || 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            {performanceDetail.metrics && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Metrics</h3>
                <div className="space-y-3">
                  {performanceDetail.metrics.qualityRate !== undefined && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium text-gray-700">Quality Rate</span>
                      <span className="text-sm text-gray-900">{performanceDetail.metrics.qualityRate}%</span>
                    </div>
                  )}
                  {performanceDetail.metrics.onTimeDeliveryRate !== undefined && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium text-gray-700">On-Time Delivery Rate</span>
                      <span className="text-sm text-gray-900">{performanceDetail.metrics.onTimeDeliveryRate}%</span>
                    </div>
                  )}
                  {performanceDetail.metrics.totalBatches !== undefined && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium text-gray-700">Total Batches</span>
                      <span className="text-sm text-gray-900">{performanceDetail.metrics.totalBatches}</span>
                    </div>
                  )}
                  {performanceDetail.metrics.averageBatchQuality !== undefined && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium text-gray-700">Average Batch Quality</span>
                      <span className="text-sm text-gray-900">{performanceDetail.metrics.averageBatchQuality}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Comments */}
            {performanceDetail.comments && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Comments</h3>
                <p className="text-base text-gray-700 whitespace-pre-wrap">
                  {performanceDetail.comments}
                </p>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Timestamps</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created At</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDateTime(performanceDetail.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Updated At</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDateTime(performanceDetail.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600">Performance evaluation not found</p>
          </div>
        )}

        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadPerformance;
