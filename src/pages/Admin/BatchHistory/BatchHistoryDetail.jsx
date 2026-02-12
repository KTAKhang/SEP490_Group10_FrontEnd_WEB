import {
  X,
  Package,
  Package2,
  Tag,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react";


const formatVND = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0);


const getCompletionReasonLabel = (reason, apiLabel) => {
  if (apiLabel)
    return {
      label: apiLabel,
      color:
        reason === "EXPIRED" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800",
    };
  switch (reason) {
    case "SOLD_OUT":
      return { label: "Sold out", color: "bg-green-100 text-green-800" };
    case "EXPIRED":
      return { label: "Expired", color: "bg-red-100 text-red-800" };
    default:
      return { label: "N/A", color: "bg-gray-100 text-gray-800" };
  }
};


/**
 * Detail popup for a completed batch.
 * Receives batch, product (optional) and displays batch info, financials, dates, and ratios.
 */
const BatchHistoryDetail = ({ isOpen, onClose, batch, product }) => {
  if (!isOpen || !batch) return null;


  const selectedBatch = batch;
  const selectedProduct = product;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/80">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <Package size={24} />
              <span>
                Batch #{selectedBatch.batchNumber} - {selectedProduct?.name || selectedBatch.productNameSnapshot || "Product"}
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">Completed batch details</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>


        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Product Info - from product prop or batch snapshots */}
          {(selectedProduct || selectedBatch.productNameSnapshot || selectedBatch.productBrandSnapshot) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                <Package2 size={20} />
                <span>Product information</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Product name</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedProduct?.name || selectedBatch.productNameSnapshot || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Brand</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedProduct?.brand || selectedBatch.productBrandSnapshot || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedProduct?.category?.name || selectedBatch.productCategoryNameSnapshot || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* Batch Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Tag size={20} />
              <span>Batch information</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Package2 size={18} className="text-blue-600" />
                  <p className="text-sm text-blue-600 font-medium">Planned quantity</p>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {selectedBatch.plannedQuantity || 0}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp size={18} className="text-purple-600" />
                  <p className="text-sm text-purple-600 font-medium">Received quantity</p>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {selectedBatch.receivedQuantity || 0}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <p className="text-sm text-green-600 font-medium">Sold quantity</p>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {selectedBatch.soldQuantity || 0}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle size={18} className="text-red-600" />
                  <p className="text-sm text-red-600 font-medium">Discarded quantity</p>
                </div>
                <p className="text-2xl font-bold text-red-900">
                  {selectedBatch.discardedQuantity || 0}
                </p>
              </div>
            </div>
          </div>


          {/* Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Calendar size={20} />
              <span>Date information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Warehouse entry date</p>
                <p className="text-base font-medium text-gray-900 flex items-center space-x-2">
                  <Clock size={16} className="text-gray-400" />
                  <span>
                    {selectedBatch.warehouseEntryDateStr
                      ? selectedBatch.warehouseEntryDateStr.split("-").reverse().join("/")
                      : selectedBatch.warehouseEntryDate
                        ? new Date(selectedBatch.warehouseEntryDate).toLocaleDateString("en-US")
                        : "N/A"}
                  </span>
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Expiry date</p>
                <p className="text-base font-medium text-gray-900 flex items-center space-x-2">
                  <Clock size={16} className="text-gray-400" />
                  <span>
                    {selectedBatch.expiryDateStr
                      ? selectedBatch.expiryDateStr.split("-").reverse().join("/")
                      : selectedBatch.expiryDate
                        ? new Date(selectedBatch.expiryDate).toLocaleDateString("en-US")
                        : "N/A"}
                  </span>
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Completed date</p>
                <p className="text-base font-medium text-gray-900 flex items-center space-x-2">
                  <CheckCircle size={16} className="text-gray-400" />
                  <span>
                    {selectedBatch.completedDateStr
                      ? selectedBatch.completedDateStr.split("-").reverse().join("/")
                      : selectedBatch.completedDate
                        ? new Date(selectedBatch.completedDate).toLocaleDateString("en-US")
                        : "N/A"}
                  </span>
                </p>
              </div>
            </div>
          </div>


          {/* Status and Reason */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Tag size={20} />
              <span>Status</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">Completion reason</p>
                {(() => {
                  const reasonInfo = getCompletionReasonLabel(
                    selectedBatch.completionReason,
                    selectedBatch.completionReasonLabel
                  );
                  return (
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${reasonInfo.color}`}
                    >
                      {reasonInfo.label}
                    </span>
                  );
                })()}
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">Status</p>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {selectedBatch.status || "COMPLETED"}
                </span>
              </div>
            </div>
          </div>


          {/* Financial summary - use schema fields (actualRevenue, fullPriceRevenue, etc.) with fallback to financial */}
          {(selectedBatch.financial ||
            selectedBatch.unitCostPrice != null ||
            selectedBatch.unitSellPrice != null ||
            selectedBatch.actualRevenue != null) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <DollarSign size={20} />
                <span>Financial summary</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Unit cost price</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatVND(selectedBatch.unitCostPrice)}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Unit sell price</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatVND(selectedBatch.unitSellPrice)}
                  </p>
                </div>
                {(selectedBatch.financial?.totalCostPrice != null ||
                  selectedBatch.financial?.cogs != null) && (
                  <>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Total cost</p>
                      <p className="text-base font-medium text-gray-900">
                        {formatVND(selectedBatch.financial?.totalCostPrice)}
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Cost of goods sold (COGS)</p>
                      <p className="text-base font-medium text-gray-900">
                        {formatVND(selectedBatch.financial?.cogs)}
                      </p>
                    </div>
                  </>
                )}
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <p className="text-sm text-green-700 mb-1">Revenue</p>
                  <p className="text-base font-semibold text-green-900">
                    {formatVND(selectedBatch.actualRevenue ?? selectedBatch.financial?.revenue)}
                  </p>
                </div>
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <p className="text-sm text-blue-700 mb-1">Gross profit</p>
                  <p className="text-base font-semibold text-blue-900">
                    {formatVND(selectedBatch.financial?.grossProfit)}
                  </p>
                </div>
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <p className="text-sm text-red-700 mb-1">Inventory loss</p>
                  <p className="text-base font-semibold text-red-900">
                    {formatVND(selectedBatch.financial?.inventoryLoss)}
                  </p>
                </div>
                <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                  <p className="text-sm text-amber-700 mb-1">Opportunity loss</p>
                  <p className="text-base font-semibold text-amber-900">
                    {formatVND(selectedBatch.financial?.opportunityLoss)}
                  </p>
                </div>
              </div>
              {(selectedBatch.actualRevenue != null ||
                selectedBatch.fullPriceQuantity != null ||
                selectedBatch.fullPriceRevenue != null ||
                selectedBatch.clearanceQuantity != null ||
                selectedBatch.clearanceRevenue != null ||
                selectedBatch.financial?.actualRevenue != null ||
                selectedBatch.financial?.fullPriceQuantity != null ||
                selectedBatch.financial?.clearanceQuantity != null) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Full price / Clearance (from orders)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Actual revenue</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatVND(selectedBatch.actualRevenue ?? selectedBatch.financial?.actualRevenue)}
                      </p>
                    </div>
                    <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                      <p className="text-xs text-green-700 mb-0.5">Full price (qty)</p>
                      <p className="text-sm font-semibold text-green-900">
                        {selectedBatch.fullPriceQuantity ?? selectedBatch.financial?.fullPriceQuantity ?? 0}
                      </p>
                    </div>
                    <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                      <p className="text-xs text-green-700 mb-0.5">Full price revenue</p>
                      <p className="text-sm font-semibold text-green-900">
                        {formatVND(selectedBatch.fullPriceRevenue ?? selectedBatch.financial?.fullPriceRevenue)}
                      </p>
                    </div>
                    <div className="border border-amber-200 rounded-lg p-3 bg-amber-50">
                      <p className="text-xs text-amber-700 mb-0.5">Clearance (qty)</p>
                      <p className="text-sm font-semibold text-amber-900">
                        {selectedBatch.clearanceQuantity ?? selectedBatch.financial?.clearanceQuantity ?? 0}
                      </p>
                    </div>
                    <div className="border border-amber-200 rounded-lg p-3 bg-amber-50">
                      <p className="text-xs text-amber-700 mb-0.5">Clearance revenue</p>
                      <p className="text-sm font-semibold text-amber-900">
                        {formatVND(selectedBatch.clearanceRevenue ?? selectedBatch.financial?.clearanceRevenue)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Summary Statistics */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Received vs planned ratio:</span>
                <span className="font-semibold text-gray-900">
                  {selectedBatch.plannedQuantity > 0
                    ? (
                        (selectedBatch.receivedQuantity / selectedBatch.plannedQuantity) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sold vs received ratio:</span>
                <span className="font-semibold text-gray-900">
                  {selectedBatch.receivedQuantity > 0
                    ? (
                        (selectedBatch.soldQuantity / selectedBatch.receivedQuantity) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discarded vs received ratio:</span>
                <span className="font-semibold text-red-600">
                  {selectedBatch.receivedQuantity > 0
                    ? (
                        (selectedBatch.discardedQuantity /
                          selectedBatch.receivedQuantity) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              {(() => {
                const entryDateStr =
                  selectedBatch.warehouseEntryDateStr ||
                  (selectedBatch.warehouseEntryDate
                    ? new Date(selectedBatch.warehouseEntryDate)
                        .toISOString()
                        .split("T")[0]
                    : null);
                const completedDateStr =
                  selectedBatch.completedDateStr ||
                  (selectedBatch.completedDate
                    ? new Date(selectedBatch.completedDate).toISOString().split("T")[0]
                    : null);


                if (entryDateStr && completedDateStr) {
                  const entryDate = new Date(entryDateStr);
                  const completedDate = new Date(completedDateStr);
                  const diffTime = Math.abs(completedDate - entryDate);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));


                  return (
                    <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                      <span className="text-gray-600">Storage duration:</span>
                      <span className="font-semibold text-gray-900">{diffDays} days</span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>


        {/* Modal Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


export default BatchHistoryDetail;