import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Package, Eye, EyeOff } from "lucide-react";
import { updateHarvestBatchRequest } from "../../../../redux/actions/supplierActions";


const UpdateVisible = ({ isOpen, onClose, batch, onSuccess }) => {
  const dispatch = useDispatch();
  const { updateHarvestBatchLoading, updateHarvestBatchError } = useSelector(
    (state) => state.supplier
  );
  const [value, setValue] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);


  useEffect(() => {
    if (batch) {
      setValue(batch.visibleInReceipt !== false);
    }
  }, [batch]);


  useEffect(() => {
    if (hasSubmitted && !updateHarvestBatchLoading) {
      if (!updateHarvestBatchError) {
        onSuccess?.();
        onClose();
      }
      setHasSubmitted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onSuccess/onClose omitted to avoid infinite loop on parent re-render
  }, [hasSubmitted, updateHarvestBatchLoading, updateHarvestBatchError]);


  useEffect(() => {
    if (isOpen) setHasSubmitted(false);
  }, [isOpen]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!batch?._id) return;
    setHasSubmitted(true);
    // Gửi cả camelCase và snake_case để tương thích backend; đảm bảo boolean false được gửi rõ ràng
    dispatch(
      updateHarvestBatchRequest(batch._id, {
        visibleInReceipt: value,
        visible_in_receipt: value,
      })
    );
  };


  if (!isOpen || !batch) return null;


  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-200/80">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Update visible in receipt
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Batch</p>
              <p className="text-sm font-medium text-gray-900">
                {batch.batchCode || batch.batchNumber || batch._id}
              </p>
              {(batch.product?.name || (batch.isPreOrderBatch && batch.fruitTypeId?.name)) && (
                <p className="text-xs text-gray-600 mt-1">{batch.isPreOrderBatch ? batch.fruitTypeId?.name : batch.product?.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visible in receipt dropdown
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibleInReceipt"
                    checked={value === true}
                    onChange={() => setValue(true)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="flex items-center gap-1.5 text-sm">
                    <Eye size={18} className="text-blue-600" />
                    Yes
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibleInReceipt"
                    checked={value === false}
                    onChange={() => setValue(false)}
                    className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                  />
                  <span className="flex items-center gap-1.5 text-sm">
                    <EyeOff size={18} className="text-gray-500" />
                    No
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                &quot;No&quot; hides this batch from the warehouse receipt selection list (e.g. after it has been used).
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 p-5 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateHarvestBatchLoading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateHarvestBatchLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default UpdateVisible;
