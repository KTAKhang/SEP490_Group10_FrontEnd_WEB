import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { updateProductExpiryDateRequest } from "../../../redux/actions/warehouseActions";

const UpdateExpiryDate = ({ isOpen, onClose, product }) => {
  const dispatch = useDispatch();
  const { updateProductExpiryDateLoading, updateProductExpiryDateError } = useSelector(
    (state) => state.warehouse
  );
  const [expiryDate, setExpiryDate] = useState("");

  // Track if we submitted the form
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Reset form when product changes
  useEffect(() => {
    if (product && product.expiryDate) {
      // Format date to YYYY-MM-DD for input
      const date = new Date(product.expiryDate);
      setExpiryDate(date.toISOString().split('T')[0]);
    } else {
      setExpiryDate("");
    }
  }, [product]);

  // Close modal after successful update
  useEffect(() => {
    if (hasSubmitted && !updateProductExpiryDateLoading && !updateProductExpiryDateError) {
      // Update was successful, close modal and reset form
      setHasSubmitted(false);
      setExpiryDate("");
      onClose();
    }
  }, [hasSubmitted, updateProductExpiryDateLoading, updateProductExpiryDateError, onClose]);

  const handleSubmit = () => {
    if (!expiryDate) {
      toast.error("Vui lòng chọn ngày hết hạn");
      return;
    }

    // Validate expiryDate (must be at least tomorrow)
    const selectedDate = new Date(expiryDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < tomorrow) {
      toast.error(`Hạn sử dụng phải tối thiểu từ ngày ${tomorrow.toISOString().split('T')[0]} (ngày mai)`);
      return;
    }

    // Don't close modal immediately - let it close after success
    setHasSubmitted(true);
    dispatch(updateProductExpiryDateRequest(product._id, expiryDate));
  };

  const handleCancel = () => {
    setHasSubmitted(false);
    setExpiryDate("");
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Cập nhật hạn sử dụng</h2>
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
              Hạn sử dụng <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
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
            disabled={updateProductExpiryDateLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProductExpiryDateLoading ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateExpiryDate;
