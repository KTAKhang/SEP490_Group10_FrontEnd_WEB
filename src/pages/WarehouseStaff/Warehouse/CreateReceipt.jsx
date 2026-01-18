import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { createReceiptRequest } from "../../../redux/actions/inventoryActions";

const CreateReceipt = ({ isOpen, onClose, product }) => {
  const dispatch = useDispatch();
  const { createReceiptLoading } = useSelector((state) => state.inventory);

  const [receiptData, setReceiptData] = useState({
    productId: "",
    quantity: 0,
    expiryDate: "",
    shelfLifeDays: "",
    note: "",
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
        shelfLifeDays: "",
        note: "",
      });
      onClose();
    }
  }, [hasSubmitted, createReceiptLoading, onClose]);

  // Load product data when product changes
  useEffect(() => {
    if (product) {
      setReceiptData({
        productId: product._id,
        quantity: 0,
        expiryDate: "",
        shelfLifeDays: "",
        note: "",
      });
    }
  }, [product]);

  const handleSubmit = () => {
    if (!receiptData.productId || receiptData.quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    // ✅ Check if this is the first receipt (no warehouseEntryDate)
    const isFirstReceipt = !product.warehouseEntryDate && !product.warehouseEntryDateStr;

    // ✅ Ràng buộc: Ở lần nhập kho đầu tiên, bắt buộc phải thiết lập hạn sử dụng
    if (isFirstReceipt) {
      if (!receiptData.expiryDate && (!receiptData.shelfLifeDays || receiptData.shelfLifeDays <= 0)) {
        toast.error("Lần nhập kho đầu tiên bắt buộc phải thiết lập hạn sử dụng (expiryDate hoặc shelfLifeDays)");
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

    // Validate shelfLifeDays if provided
    if (receiptData.shelfLifeDays && receiptData.shelfLifeDays <= 0) {
      toast.error("Shelf life days must be greater than 0");
      return;
    }

    // Prepare receipt data (prioritize expiryDate over shelfLifeDays)
    const receiptPayload = {
      productId: receiptData.productId,
      quantity: receiptData.quantity,
      note: receiptData.note || "",
    };
    
    // Prefer expiryDate from the date picker
    if (receiptData.expiryDate) {
      receiptPayload.expiryDate = receiptData.expiryDate;
    } 
    // Backward compatible: if no expiryDate, use shelfLifeDays
    else if (receiptData.shelfLifeDays && receiptData.shelfLifeDays > 0) {
      receiptPayload.shelfLifeDays = parseInt(receiptData.shelfLifeDays);
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
      shelfLifeDays: "",
      note: "",
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
          </div>
          {/* Only show expiry date/shelf life inputs if no expiry date has been set yet */}
          {hasNoExpiryDate && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry date {isFirstReceipt && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="date"
                  value={receiptData.expiryDate}
                  onChange={(e) => {
                    setReceiptData({ ...receiptData, expiryDate: e.target.value, shelfLifeDays: "" });
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
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300"></span>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shelf life (days) {isFirstReceipt && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="number"
                  min="1"
                  value={receiptData.shelfLifeDays}
                  onChange={(e) => {
                    setReceiptData({ ...receiptData, shelfLifeDays: e.target.value, expiryDate: "" });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter number of days"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter shelf life in days. Expiry date will be calculated automatically.
                </p>
              </div>
            </>
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
