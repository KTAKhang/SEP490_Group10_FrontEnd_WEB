import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, CheckSquare, Calendar, CheckCircle, XCircle, AlertCircle, Building2, Package, Scale, TrendingUp } from "lucide-react";
import { getQualityVerificationByIdRequest } from "../../../../redux/actions/supplierActions";
import Loading from "../../../../components/Loading/Loading";

const ReadQualityVerification = ({ isOpen, onClose, verificationId }) => {
  const dispatch = useDispatch();
  const {
    qualityVerificationDetail,
    qualityVerificationDetailLoading,
  } = useSelector((state) => state.supplier);

  useEffect(() => {
    if (isOpen && verificationId) {
      dispatch(getQualityVerificationByIdRequest(verificationId));
    }
  }, [dispatch, isOpen, verificationId]);

  const getResultBadge = (result) => {
    switch (result) {
      case "PASSED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle size={16} className="mr-1" />
            Passed
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle size={16} className="mr-1" />
            Failed
          </span>
        );
      case "CONDITIONAL":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle size={16} className="mr-1" />
            Conditional
          </span>
        );
      default:
        return <span className="text-gray-500">N/A</span>;
    }
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

  if (!isOpen || !verificationId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <CheckSquare size={24} />
            <span>Quality Verification Details</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {qualityVerificationDetailLoading ? (
          <div className="p-6">
            <Loading message="Loading quality verification details..." />
          </div>
        ) : qualityVerificationDetail ? (
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Verification Result</p>
                  {getResultBadge(qualityVerificationDetail.verificationResult)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                    <Calendar size={16} className="text-gray-400" />
                    <span>Verified At</span>
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDateTime(qualityVerificationDetail.verifiedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                    <TrendingUp size={16} className="text-gray-400" />
                    <span>Overall Score</span>
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {qualityVerificationDetail.overallScore || 0}/100
                  </p>
                </div>
              </div>
            </div>

            {/* Supplier & Product Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Supplier & Product</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                    <Building2 size={16} className="text-gray-400" />
                    <span>Supplier</span>
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {qualityVerificationDetail.supplier?.name || "N/A"}
                  </p>
                  {qualityVerificationDetail.supplier?.code && (
                    <p className="text-xs text-gray-500 mt-1">
                      Code: {qualityVerificationDetail.supplier.code}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                    <Package size={16} className="text-gray-400" />
                    <span>Product</span>
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {qualityVerificationDetail.product?.name || "N/A"}
                  </p>
                  {qualityVerificationDetail.product?.brand && (
                    <p className="text-xs text-gray-500 mt-1">
                      Brand: {qualityVerificationDetail.product.brand}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Harvest Batch Information */}
            {qualityVerificationDetail.harvestBatch && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Harvest Batch</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Batch Code</p>
                    <p className="text-base font-medium text-gray-900">
                      {qualityVerificationDetail.harvestBatch.batchCode || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Batch Number</p>
                    <p className="text-base font-medium text-gray-900">
                      {qualityVerificationDetail.harvestBatch.batchNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quality Metrics */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quality Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                    <Scale size={16} className="text-gray-400" />
                    <span>Approved Quantity</span>
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {qualityVerificationDetail.approvedQuantity || 0} KG
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                    <Scale size={16} className="text-gray-400" />
                    <span>Rejected Quantity</span>
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {qualityVerificationDetail.rejectedQuantity || 0} KG
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Quantity</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(qualityVerificationDetail.approvedQuantity || 0) + 
                     (qualityVerificationDetail.rejectedQuantity || 0)} KG
                  </p>
                </div>
              </div>
              {(qualityVerificationDetail.approvedQuantity > 0 || qualityVerificationDetail.rejectedQuantity > 0) && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Approval Rate</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(qualityVerificationDetail.approvedQuantity || 0) / 
                            ((qualityVerificationDetail.approvedQuantity || 0) + 
                             (qualityVerificationDetail.rejectedQuantity || 0)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {((qualityVerificationDetail.approvedQuantity || 0) / 
                        ((qualityVerificationDetail.approvedQuantity || 0) + 
                         (qualityVerificationDetail.rejectedQuantity || 0)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quality Checks */}
            {qualityVerificationDetail.qualityChecks && Object.keys(qualityVerificationDetail.qualityChecks).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quality Checks</h3>
                <div className="space-y-2">
                  {Object.entries(qualityVerificationDetail.qualityChecks).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {qualityVerificationDetail.notes && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
                <p className="text-base text-gray-700 whitespace-pre-wrap">
                  {qualityVerificationDetail.notes}
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
                    {formatDateTime(qualityVerificationDetail.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Updated At</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDateTime(qualityVerificationDetail.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600">Quality verification not found</p>
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

export default ReadQualityVerification;
