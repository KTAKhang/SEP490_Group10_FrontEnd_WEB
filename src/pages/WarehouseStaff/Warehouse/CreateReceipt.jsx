import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { createReceiptRequest } from "../../../redux/actions/warehouseActions";

const CreateReceipt = ({ isOpen, onClose, product }) => {
  const dispatch = useDispatch();
  const { createReceiptLoading } = useSelector((state) => state.warehouse);

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
      toast.error("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    // Validate expiryDate if provided (must be at least tomorrow)
    if (receiptData.expiryDate) {
      const selectedDate = new Date(receiptData.expiryDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < tomorrow) {
        toast.error(`Hạn sử dụng phải tối thiểu từ ngày ${tomorrow.toISOString().split('T')[0]} (ngày mai)`);
        return;
      }
    }

    // Prepare receipt data (prioritize expiryDate over shelfLifeDays)
    const receiptPayload = {
      productId: receiptData.productId,
      quantity: receiptData.quantity,
      note: receiptData.note || "",
    };
    
    // Ưu tiên expiryDate từ date picker
    if (receiptData.expiryDate) {
      receiptPayload.expiryDate = receiptData.expiryDate;
    } 
    // Backward compatible: nếu không có expiryDate, dùng shelfLifeDays
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Nhập kho</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sản phẩm
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
              Số lượng nhập <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={receiptData.quantity}
              onChange={(e) =>
                setReceiptData({ ...receiptData, quantity: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập số lượng"
            />
          </div>
          {product.receivedQuantity === 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hạn sử dụng <span className="text-red-500">*</span>
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
                Chọn ngày hết hạn (tối thiểu từ ngày mai)
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={receiptData.note}
              onChange={(e) => setReceiptData({ ...receiptData, note: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Ghi chú (tùy chọn)"
            />
          </div>
        </div>
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={createReceiptLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createReceiptLoading ? "Đang nhập kho..." : "Xác nhận nhập kho"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateReceipt;
