import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { createReceiptRequest } from "../../../redux/actions/inventoryActions";
import { getHarvestBatchesRequest } from "../../../redux/actions/supplierActions";

const CreateReceipt = ({ isOpen, onClose, product }) => {
  const dispatch = useDispatch();
  const { createReceiptLoading } = useSelector((state) => state.inventory);
  const { harvestBatches, harvestBatchesLoading } = useSelector((state) => state.supplier);

  const [receiptData, setReceiptData] = useState({
    productId: "",
    quantity: 0,
    expiryDate: "",
    note: "",
    harvestBatchId: "",
  });

  // Track if we submitted the form
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Close modal after successful create
  useEffect(() => {
    if (hasSubmitted && !createReceiptLoading) {
      // Create was successful, close modal and reset form
      setHasSubmitted(false);
      setReceiptData({
        productId: "",
        quantity: 0,
        expiryDate: "",
        note: "",
        harvestBatchId: "",
      });
      onClose();
    }
  }, [hasSubmitted, createReceiptLoading, onClose]);

  // Check if product has supplier
  const productSupplierId = product?.supplier?._id || product?.supplier;
  const hasSupplier = !!productSupplierId;

  // Load harvest batches when product has supplier and modal opens
  useEffect(() => {
    if (isOpen && product && hasSupplier) {
      // ✅ Load harvest batches for this product (không filter theo status - cho phép nhập với bất kỳ status nào)
      dispatch(
        getHarvestBatchesRequest({
          productId: product._id,
          page: 1,
          limit: 100, // Get all available batches
        })
      );
    }
  }, [isOpen, product, hasSupplier, dispatch]);

  // Load product data when product changes
  useEffect(() => {
    if (product) {
      setReceiptData({
        productId: product._id,
        quantity: 0,
        expiryDate: "",
        note: "",
        harvestBatchId: "",
      });
    }
  }, [product]);

  const handleSubmit = () => {
    if (!receiptData.productId || receiptData.quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    // ✅ Validate: Nếu sản phẩm có supplier, bắt buộc phải chọn harvestBatchId
    if (hasSupplier) {
      if (!receiptData.harvestBatchId) {
        toast.error("Sản phẩm có nhà cung cấp, bắt buộc phải chọn lô thu hoạch (harvestBatchId) khi nhập hàng vào kho");
        return;
      }

      // Validate: Kiểm tra số lượng nhập không vượt quá số lượng còn lại
      const selectedBatch = harvestBatches.find((batch) => batch._id === receiptData.harvestBatchId);
      if (selectedBatch) {
        const remainingQty = (selectedBatch.quantity || 0) - (selectedBatch.receivedQuantity || 0);
        if (receiptData.quantity > remainingQty) {
          toast.error(`Số lượng nhập kho (${receiptData.quantity}) vượt quá số lượng còn lại trong lô thu hoạch (${remainingQty}). Vui lòng nhập không quá ${remainingQty}.`);
          return;
        }
      }
    }

    // ✅ Check if this is the first receipt (no warehouseEntryDate)
    const isFirstReceipt = !product.warehouseEntryDate && !product.warehouseEntryDateStr;

    // ✅ Ràng buộc: Ở lần nhập kho đầu tiên, bắt buộc phải thiết lập hạn sử dụng
    if (isFirstReceipt) {
      if (!receiptData.expiryDate) {
        toast.error("Lần nhập kho đầu tiên bắt buộc phải thiết lập hạn sử dụng (expiryDate)");
        return;
      }
    }

    // Validate expiryDate if provided (must be at least tomorrow)
    if (receiptData.expiryDate) {
      const selectedDate = new Date(receiptData.expiryDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < tomorrow) {
        toast.error(`Expiry date must be at least ${tomorrow.toISOString().split('T')[0]} (tomorrow)`);
        return;
      }
    }

    // Prepare receipt data
    const receiptPayload = {
      productId: receiptData.productId,
      quantity: receiptData.quantity,
      note: receiptData.note || "",
    };
    
    // Add expiryDate if provided
    if (receiptData.expiryDate) {
      receiptPayload.expiryDate = receiptData.expiryDate;
    }

    // ✅ Add harvestBatchId if product has supplier
    if (hasSupplier && receiptData.harvestBatchId) {
      receiptPayload.harvestBatchId = receiptData.harvestBatchId;
    }

    // Don't close modal immediately - let it close after success
    setHasSubmitted(true);
    dispatch(createReceiptRequest(receiptPayload));
  };

  const handleCancel = () => {
    setHasSubmitted(false);
    setReceiptData({
      productId: "",
      quantity: 0,
      expiryDate: "",
      note: "",
      harvestBatchId: "",
    });
    onClose();
  };

  if (!isOpen || !product) return null;

  // ✅ Check if this is the first receipt (no warehouseEntryDate)
  const isFirstReceipt = !product.warehouseEntryDate && !product.warehouseEntryDateStr;
  const hasNoExpiryDate = !product.expiryDate && !product.expiryDateStr;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Receive stock</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* First receipt warning */}
          {isFirstReceipt && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-800">
                ⚠️ Lần nhập kho đầu tiên - Bắt buộc phải thiết lập hạn sử dụng
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <input
              type="text"
              value={product.name}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
          </div>
          {/* ✅ Harvest Batch Selection - Required if product has supplier */}
          {hasSupplier && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harvest Batch <span className="text-red-500">*</span>
              </label>
              {harvestBatchesLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                  Loading harvest batches...
                </div>
              ) : harvestBatches.length === 0 ? (
                <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-700 text-sm">
                  Không có lô thu hoạch nào cho sản phẩm này
                </div>
              ) : (
                <select
                  value={receiptData.harvestBatchId}
                  onChange={(e) =>
                    setReceiptData({ ...receiptData, harvestBatchId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Chọn lô thu hoạch --</option>
                  {harvestBatches.map((batch) => {
                    const remainingQty = (batch.quantity || 0) - (batch.receivedQuantity || 0);
                    // ✅ Hiển thị status để người dùng biết trạng thái của harvest batch
                    const statusLabel = batch.status === "APPROVED" ? "✓" : batch.status === "PENDING" ? "⏳" : batch.status === "REJECTED" ? "✗" : "";
                    return (
                      <option key={batch._id} value={batch._id}>
                        {batch.batchCode || batch.batchNumber} {statusLabel} - Còn lại: {remainingQty} / {batch.quantity || 0}
                        {batch.harvestDateStr && ` (${batch.harvestDateStr})`}
                      </option>
                    );
                  })}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Sản phẩm có nhà cung cấp, bắt buộc phải chọn lô thu hoạch khi nhập hàng
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receive quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={receiptData.quantity}
              onChange={(e) =>
                setReceiptData({ ...receiptData, quantity: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter quantity"
            />
            {/* ✅ Show remaining quantity warning if harvest batch is selected */}
            {hasSupplier && receiptData.harvestBatchId && receiptData.quantity > 0 && (() => {
              const selectedBatch = harvestBatches.find((batch) => batch._id === receiptData.harvestBatchId);
              if (selectedBatch) {
                const remainingQty = (selectedBatch.quantity || 0) - (selectedBatch.receivedQuantity || 0);
                if (receiptData.quantity > remainingQty) {
                  return (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ Số lượng nhập ({receiptData.quantity}) vượt quá số lượng còn lại ({remainingQty})
                    </p>
                  );
                } else {
                  return (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Số lượng còn lại: {remainingQty - receiptData.quantity} sau khi nhập
                    </p>
                  );
                }
              }
              return null;
            })()}
          </div>
          {/* Only show expiry date input if no expiry date has been set yet */}
          {hasNoExpiryDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry date {isFirstReceipt && <span className="text-red-500">*</span>}
              </label>
              <input
                type="date"
                value={receiptData.expiryDate}
                onChange={(e) => {
                  setReceiptData({ ...receiptData, expiryDate: e.target.value });
                }}
                min={(() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  return tomorrow.toISOString().split('T')[0];
                })()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Select expiry date (at least tomorrow). This can only be set once.
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={receiptData.note}
              onChange={(e) => setReceiptData({ ...receiptData, note: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Notes (optional)"
            />
          </div>
        </div>
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createReceiptLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createReceiptLoading ? "Receiving..." : "Confirm receipt"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateReceipt;
