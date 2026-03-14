import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { createReceiptRequest, getReceiptHistoryRequest, clearInventoryMessages } from "../../../redux/actions/inventoryActions";
import { getHarvestBatchesRequest } from "../../../redux/actions/supplierActions";


const HARVEST_BATCH_CONFLICT_MSG =
  "The harvest batch was selected during the first receipt and cannot be changed in later receipts";


const InitialStockIn = ({ isOpen, onClose, product }) => {
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


  const [hasSubmitted, setHasSubmitted] = useState(false);


  const hasSupplier = !!(product?.supplier?._id || product?.supplier);


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
    if (!hasSubmitted || createReceiptLoading) return;
    if (createReceiptError) {
      setHasSubmitted(false);
      return;
    }
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


    if (hasSupplier) {
      if (receiptHistoryLoading) {
        toast.error("Please wait for harvest batches to load before submitting");
        return;
      }
      if (!receiptData.harvestBatchId) {
        toast.error("Product has supplier; you must select a harvest batch when receiving stock");
        return;
      }
    }


    if (!receiptData.expiryDate) {
      toast.error("Initial stock in must set expiry date");
      return;
    }


    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
    const minAllowed = `${y}-${m}-${day}`;
    if (receiptData.expiryDate < minAllowed) {
      toast.error(`Expiry date must be at least ${minAllowed} (tomorrow)`);
      return;
    }


    const receiptPayload = {
      productId: receiptData.productId,
      quantity: receiptData.quantity,
      note: receiptData.note || "",
      expiryDate: receiptData.expiryDate,
    };
    if (hasSupplier) {
      receiptPayload.harvestBatchId = receiptData.harvestBatchId || "";
    }


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
          <h2 className="text-lg font-semibold text-gray-900">Initial Stock In</h2>
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
                  ? "This product already has a first receipt with a different harvest batch. Reloading history."
                  : createReceiptError}
              </p>
            </div>
          )}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-medium text-amber-800">
              ⚠️ First receipt — You must set expiry date
            </p>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <input
              type="text"
              value={product.name}
              disabled
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-700 text-sm"
            />
          </div>
          {hasSupplier && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harvest Batch <span className="text-red-500">*</span>
              </label>
              {harvestBatchesLoading ? (
                <div className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-500 text-sm">
                  Loading harvest batches...
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry date <span className="text-red-500">*</span>
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
            <div className="mt-2 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/60">
              <p className="text-xs font-medium text-emerald-800 mb-1">Note:</p>
              <ul className="text-xs text-emerald-700 leading-relaxed space-y-0.5 list-disc list-inside">
                <li>When setting the expiry date, allow for a reasonable period for the delivery process.</li>
                <li>The expiry date displayed to customers must ensure that even if customers order on the last day, the product will still have time to be used when delivered.</li>
              </ul>
            </div>
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
            disabled={createReceiptLoading || (hasSupplier && harvestBatchesLoading)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
          >
            {createReceiptLoading ? "Receiving..." : "Confirm receipt"}
          </button>
        </div>
      </div>
    </div>
  );
};


export default InitialStockIn;
