import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Package, Calendar, Building2, Scale, MapPin } from "lucide-react";
import { getHarvestBatchByIdRequest } from "../../../redux/actions/supplierActions";
import Loading from "../../../components/Loading/Loading";

const ReadHarvestBatch = ({ isOpen, onClose, harvestBatchId }) => {
  const dispatch = useDispatch();
  const {
    harvestBatchDetail,
    harvestBatchDetailLoading,
  } = useSelector((state) => state.supplier);

  useEffect(() => {
    if (isOpen && harvestBatchId) {
      dispatch(getHarvestBatchByIdRequest(harvestBatchId));
    }
  }, [dispatch, isOpen, harvestBatchId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
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

  if (!isOpen || !harvestBatchId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <Package size={24} />
            <span>Harvest Batch Details</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {harvestBatchDetailLoading ? (
          <div className="p-6">
            <Loading message="Loading harvest batch details..." />
          </div>
        ) : harvestBatchDetail ? (
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Batch Code</p>
                  <p className="text-base font-medium text-gray-900">
                    {harvestBatchDetail.batchCode || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Batch Number</p>
                  <p className="text-base font-medium text-gray-900">
                    {harvestBatchDetail.batchNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Harvest Date</p>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-base font-medium text-gray-900">
                      {formatDate(harvestBatchDetail.harvestDate)}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                    <MapPin size={16} className="text-gray-400" />
                    <span>Location</span>
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {harvestBatchDetail.location || "N/A"}
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
                    {harvestBatchDetail.supplier?.name || "N/A"}
                  </p>
                  {harvestBatchDetail.supplier?.code && (
                    <p className="text-xs text-gray-500 mt-1">
                      Code: {harvestBatchDetail.supplier.code}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                    <Package size={16} className="text-gray-400" />
                    <span>Product</span>
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {harvestBatchDetail.product?.name || "N/A"}
                  </p>
                  {harvestBatchDetail.product?.brand && (
                    <p className="text-xs text-gray-500 mt-1">
                      Brand: {harvestBatchDetail.product.brand}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quantity Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                    <Scale size={16} className="text-gray-400" />
                    <span>Quantity (KG)</span>
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {harvestBatchDetail.quantity || 0} KG
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                    <Scale size={16} className="text-gray-400" />
                    <span>Received Quantity (KG)</span>
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {harvestBatchDetail.receivedQuantity || 0} KG
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                    <Scale size={16} className="text-gray-400" />
                    <span>Remaining Quantity (KG)</span>
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {harvestBatchDetail.remainingQuantity !== undefined ? harvestBatchDetail.remainingQuantity : (harvestBatchDetail.quantity || 0) - (harvestBatchDetail.receivedQuantity || 0)} KG
                  </p>
                </div>
              </div>
              {harvestBatchDetail.quantity > 0 && harvestBatchDetail.receivedQuantity > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Receiving Rate</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(harvestBatchDetail.receivedQuantity / harvestBatchDetail.quantity) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round((harvestBatchDetail.receivedQuantity / harvestBatchDetail.quantity) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {harvestBatchDetail.notes && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
                <p className="text-base text-gray-700 whitespace-pre-wrap">
                  {harvestBatchDetail.notes}
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
                    {formatDateTime(harvestBatchDetail.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Updated At</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDateTime(harvestBatchDetail.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600">Harvest batch not found</p>
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

export default ReadHarvestBatch;
