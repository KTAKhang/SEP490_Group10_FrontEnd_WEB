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
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };


  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
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
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/80">
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
                    <span>{harvestBatchDetail.isPreOrderBatch ? "Fruit type (pre-order)" : "Product"}</span>
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {harvestBatchDetail.isPreOrderBatch
                      ? (harvestBatchDetail.fruitTypeId?.name || "N/A")
                      : (harvestBatchDetail.product?.name || "N/A")}
                  </p>
                  {!harvestBatchDetail.isPreOrderBatch && harvestBatchDetail.product?.brand && (
                    <p className="text-xs text-gray-500 mt-1">
                      Brand: {harvestBatchDetail.product.brand}
                    </p>
                  )}
                </div>
              </div>
            </div>


            {/* Quantity & receipt visibility */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quantity & Receipt Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                    <Scale size={16} className="text-gray-400" />
                    <span>Received Quantity</span>
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {harvestBatchDetail.receivedQuantity ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Receipt eligible</p>
                  <span className={`inline-flex px-2 py-1 rounded text-sm font-medium ${harvestBatchDetail.receiptEligible !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {harvestBatchDetail.receiptEligible !== false ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Visible in receipt</p>
                  <span className={`inline-flex px-2 py-1 rounded text-sm font-medium ${harvestBatchDetail.visibleInReceipt !== false ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}>
                    {harvestBatchDetail.visibleInReceipt !== false ? "Yes" : "No"}
                  </span>
                </div>
              </div>
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
            className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadHarvestBatch;
