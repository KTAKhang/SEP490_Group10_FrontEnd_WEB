import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { createReceiptRequest, getReceiptHistoryRequest, clearInventoryMessages } from "../../../redux/actions/inventoryActions";
import { getHarvestBatchesRequest } from "../../../redux/actions/supplierActions";


const HARVEST_BATCH_CONFLICT_MSG =
  "The harvest batch was selected during the first receipt and cannot be changed in later receipts";


/** Format date to YYYY-MM-DD in Asia/Ho_Chi_Minh (khớp backend) */
const toEntryDateStr = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
};


const CreateReceipt = ({ isOpen, onClose, product }) => {
  const dispatch = useDispatch();
  const { createReceiptLoading, createReceiptError, receiptHistory, receiptHistoryLoading } = useSelector((state) => state.inventory);
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


  // Check if product has supplier (must be before any useEffect that uses it)
  const hasSupplier = !!(product?.supplier?._id || product?.supplier);


  // Chỉ khóa lô trong cùng kỳ nhập kho (cùng warehouseEntryDateStr). Sau reset (không còn warehouseEntryDateStr) → kỳ mới → không khóa.
  const entryDateStr =
    product?.warehouseEntryDateStr || toEntryDateStr(product?.warehouseEntryDate) || null;
  const receiptsInCurrentPeriod = !entryDateStr
    ? []
    : (receiptHistory || []).filter((tx) => {
        if (!tx?.createdAt) return false;
        const txDateStr = new Date(tx.createdAt).toLocaleDateString("en-CA", {
          timeZone: "Asia/Ho_Chi_Minh",
        });
        return txDateStr === entryDateStr;
      });
  const existingReceiptWithBatch = receiptsInCurrentPeriod.find(
    (tx) => tx?.harvestBatch?._id || tx?.harvestBatch
  );
  const existingHarvestBatchId =
    existingReceiptWithBatch?.harvestBatch?._id || existingReceiptWithBatch?.harvestBatch || "";
  const eligibleBatches = (harvestBatches || []).filter(
    (b) => b.visibleInReceipt !== false && b.receiptEligible !== false
  );


  // Clear previous create-receipt error when opening modal so old message does not persist
  useEffect(() => {
    if (isOpen) {
      dispatch(clearInventoryMessages());
    }
  }, [isOpen, dispatch]);


  // Lỗi backend: "đã có phiếu nhập đầu với lô khác" → refetch receipt history để khóa đúng lô
  useEffect(() => {
    if (!createReceiptError || createReceiptError !== HARVEST_BATCH_CONFLICT_MSG) return;
    if (!product?._id || !hasSupplier) return;
    dispatch(
      getReceiptHistoryRequest({
        productId: product._id,
        page: 1,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "asc",
      })
    );
  }, [createReceiptError, product?._id, hasSupplier, dispatch]);


  // Sau khi refetch receipt history, nếu có existingHarvestBatchId thì xóa lỗi để hiển thị UI khóa lô
  useEffect(() => {
    if (!createReceiptError || createReceiptError !== HARVEST_BATCH_CONFLICT_MSG) return;
    if (existingHarvestBatchId) {
      dispatch(clearInventoryMessages());
    }
  }, [createReceiptError, existingHarvestBatchId, dispatch]);


  // Close modal only after successful create (no error)
  useEffect(() => {
    if (!hasSubmitted || createReceiptLoading) return;
    // Request finished (loading false)
    if (createReceiptError) {
      // API returned error: keep modal open, reset hasSubmitted so user can try again
      setHasSubmitted(false);
      return;
    }
    // Success: close modal and reset form
    setHasSubmitted(false);
    setReceiptData({
      productId: "",
      quantity: 0,
      expiryDate: "",
      note: "",
      harvestBatchId: "",
    });
    onClose();
  }, [hasSubmitted, createReceiptLoading, createReceiptError, onClose]);


  // Load harvest batches when product has supplier and modal opens
  // Only show batches eligible for receipt and still visible (not yet used for this product)
  useEffect(() => {
    if (isOpen && product && hasSupplier) {
      dispatch(
        getHarvestBatchesRequest({
          productId: product._id,
          page: 1,
          limit: 100,
          receiptEligible: true,
          visibleInReceipt: true,
        })
      );
    }
  }, [isOpen, product, hasSupplier, dispatch]);


  // Load receipt history to enforce "same harvest batch" rule
  useEffect(() => {
    if (isOpen && product && hasSupplier) {
      dispatch(
        getReceiptHistoryRequest({
          productId: product._id,
          page: 1,
          limit: 100,
          sortBy: "createdAt",
          sortOrder: "asc",
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


  useEffect(() => {
    if (existingHarvestBatchId) {
      setReceiptData((prev) => ({ ...prev, harvestBatchId: existingHarvestBatchId }));
    }
  }, [existingHarvestBatchId]);


  const handleSubmit = () => {
    if (!receiptData.productId || receiptData.quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }


    // Validate: product with supplier must have harvest batch (wait for history when needed)
    if (hasSupplier) {
      if (receiptHistoryLoading) {
        toast.error("Please wait for receipt history to load before submitting");
        return;
      }
      const effectiveBatchId = existingHarvestBatchId || receiptData.harvestBatchId;
      if (!effectiveBatchId) {
        toast.error("Product has supplier; you must select a harvest batch when receiving stock");
        return;
      }
      if (existingHarvestBatchId && receiptData.harvestBatchId !== existingHarvestBatchId) {
        toast.error("Harvest batch was set on first receipt; you cannot change to a different batch later");
        return;
      }
    }


    // ✅ Check if this is the first receipt (no warehouseEntryDate)
    const isFirstReceipt = !product.warehouseEntryDate && !product.warehouseEntryDateStr;


    // First receipt must set expiry date
    if (isFirstReceipt) {
      if (!receiptData.expiryDate) {
        toast.error("First receipt must set expiry date");
        return;
      }
    }


    // Validate expiryDate if provided (must be at least tomorrow, i.e. today + 1)
    if (receiptData.expiryDate) {
      const selected = receiptData.expiryDate; // YYYY-MM-DD
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
      const minAllowed = `${y}-${m}-${day}`;
      if (selected < minAllowed) {
        toast.error(`Expiry date must be at least ${minAllowed} (tomorrow)`);
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


    // ✅ Add harvestBatchId if product has supplier (use locked batch when set)
    if (hasSupplier) {
      receiptPayload.harvestBatchId =
        existingHarvestBatchId || receiptData.harvestBatchId || "";
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


  // Minimum expiry date = today + 1 (tomorrow) in local timezone (YYYY-MM-DD)
  const getMinExpiryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const minExpiryDate = getMinExpiryDate();


  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200/80 shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Receive stock</h2>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {createReceiptError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 space-y-1">
              <p>
                {createReceiptError === HARVEST_BATCH_CONFLICT_MSG
                  ? "Sản phẩm này đã có phiếu nhập đầu tiên với một lô thu hoạch khác. Các lần nhập sau phải dùng đúng lô đó. Đang tải lại lịch sử để khóa đúng lô."
                  : createReceiptError}
              </p>
              {createReceiptError === HARVEST_BATCH_CONFLICT_MSG && receiptHistoryLoading && (
                <p className="text-red-600">Đang tải lịch sử nhập hàng...</p>
              )}
            </div>
          )}
          {isFirstReceipt && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-medium text-amber-800">
                ⚠️ First receipt — You must set expiry date
              </p>
            </div>
          )}


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <input
              type="text"
              value={product.name}
              disabled
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-700 text-sm"
            />
          </div>
          {hasSupplier && existingHarvestBatchId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harvest batch (locked from first receipt)
              </label>
              <div className="w-full px-3 py-2.5 border border-amber-200 rounded-xl bg-amber-50/50 text-gray-700 text-sm flex items-center gap-2">
                <span className="text-amber-600 shrink-0">🔒</span>
                <span>
                  {existingReceiptWithBatch?.harvestBatch?.batchCode ||
                    existingReceiptWithBatch?.harvestBatch?.batchNumber ||
                    existingHarvestBatchId}
                </span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Trong cùng kỳ nhập kho (cùng ngày), phải dùng một lô thu hoạch. Sau khi sản phẩm reset (bán hết), kỳ mới có thể chọn lô khác.
              </p>
            </div>
          )}
          {hasSupplier && !existingHarvestBatchId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harvest Batch <span className="text-red-500">*</span>
              </label>
              {harvestBatchesLoading ? (
                <div className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-500 text-sm">
                  Loading harvest batches...
                </div>
              ) : receiptHistoryLoading ? (
                <div className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-500 text-sm">
                  Loading receipt history...
                </div>
              ) : eligibleBatches.length === 0 ? (
                <div className="w-full px-3 py-2.5 border border-red-200 rounded-xl bg-red-50 text-red-700 text-sm">
                  No harvest batches for this product
                </div>
              ) : (
                <select
                  value={eligibleBatches.some((b) => b._id === receiptData.harvestBatchId) ? receiptData.harvestBatchId : ""}
                  onChange={(e) =>
                    setReceiptData({ ...receiptData, harvestBatchId: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  required
                >
                  <option value="">-- Select harvest batch --</option>
                  {eligibleBatches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.batchCode || batch.batchNumber}
                      {batch.harvestDateStr ? ` | ${batch.harvestDateStr}` : ""}
                      {` | Received: ${batch.receivedQuantity ?? 0}`}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Product has supplier; harvest batch is required when receiving
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
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Enter quantity"
            />
          </div>
          {hasNoExpiryDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry date {isFirstReceipt && <span className="text-red-500">*</span>}
              </label>
              <input
                type="date"
                value={receiptData.expiryDate}
                onChange={(e) => setReceiptData({ ...receiptData, expiryDate: e.target.value })}
                min={minExpiryDate}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Expiry date must be at least tomorrow (today + 1). This can only be set once.
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={receiptData.note}
              onChange={(e) => setReceiptData({ ...receiptData, note: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
              rows="3"
              placeholder="Notes (optional)"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createReceiptLoading || (hasSupplier && receiptHistoryLoading)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
          >
            {createReceiptLoading ? "Receiving..." : "Confirm receipt"}
          </button>
        </div>
      </div>
    </div>
  );
};


export default CreateReceipt;




