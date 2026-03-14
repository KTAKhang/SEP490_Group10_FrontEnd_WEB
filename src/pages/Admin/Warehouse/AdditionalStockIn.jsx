import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { createReceiptRequest, getReceiptHistoryRequest, clearInventoryMessages } from "../../../redux/actions/inventoryActions";
import { getHarvestBatchesRequest } from "../../../redux/actions/supplierActions";


const HARVEST_BATCH_CONFLICT_MSG =
  "The harvest batch was selected during the first receipt and cannot be changed in later receipts";


/** Format date to YYYY-MM-DD in Asia/Ho_Chi_Minh */
const toEntryDateStr = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
};


const AdditionalStockIn = ({ isOpen, onClose, product }) => {
  const dispatch = useDispatch();
  const { createReceiptLoading, createReceiptError, receiptHistory, receiptHistoryLoading } = useSelector((state) => state.inventory);
  const { harvestBatches, harvestBatchesLoading } = useSelector((state) => state.supplier);


  const [receiptData, setReceiptData] = useState({
    productId: "",
    quantity: 0,
    note: "",
    harvestBatchId: "",
  });


  const [hasSubmitted, setHasSubmitted] = useState(false);


  const hasSupplier = !!(product?.supplier?._id || product?.supplier);


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


  useEffect(() => {
    if (isOpen) {
      dispatch(clearInventoryMessages());
    }
  }, [isOpen, dispatch]);


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


  useEffect(() => {
    if (!createReceiptError || createReceiptError !== HARVEST_BATCH_CONFLICT_MSG) return;
    if (existingHarvestBatchId) {
      dispatch(clearInventoryMessages());
    }
  }, [createReceiptError, existingHarvestBatchId, dispatch]);


  useEffect(() => {
    if (!hasSubmitted || createReceiptLoading) return;
    if (createReceiptError) {
      setHasSubmitted(false);
      return;
    }
    setHasSubmitted(false);
    setReceiptData({
      productId: "",
      quantity: 0,
      note: "",
      harvestBatchId: "",
    });
    onClose();
  }, [hasSubmitted, createReceiptLoading, createReceiptError, onClose]);


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


  useEffect(() => {
    if (product) {
      setReceiptData({
        productId: product._id,
        quantity: 0,
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


    const receiptPayload = {
      productId: receiptData.productId,
      quantity: receiptData.quantity,
      note: receiptData.note || "",
    };
    if (hasSupplier) {
      receiptPayload.harvestBatchId = existingHarvestBatchId || receiptData.harvestBatchId || "";
    }


    setHasSubmitted(true);
    dispatch(createReceiptRequest(receiptPayload));
  };


  const handleCancel = () => {
    setHasSubmitted(false);
    setReceiptData({
      productId: "",
      quantity: 0,
      note: "",
      harvestBatchId: "",
    });
    onClose();
  };


  if (!isOpen || !product) return null;


  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200/80 shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Additional Stock In</h2>
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
                  ? "This product already has a first receipt with a different harvest batch. Subsequent receipts must use the same batch. Reloading history to lock the correct batch."
                  : createReceiptError}
              </p>
              {createReceiptError === HARVEST_BATCH_CONFLICT_MSG && receiptHistoryLoading && (
                <p className="text-red-600">Loading receipt history...</p>
              )}
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
                In the same warehouse entry period (same day), one harvest batch must be used.
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


export default AdditionalStockIn;
