import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Trash2, Package } from "lucide-react";
import { deleteHarvestBatchRequest } from "../../../redux/actions/supplierActions";


const DeleteHarvestBatch = ({ isOpen, onClose, batch, onSuccess }) => {
  const dispatch = useDispatch();
  const { deleteHarvestBatchLoading, deleteHarvestBatchError } = useSelector(
    (state) => state.supplier
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const onSuccessRef = useRef(onSuccess);
  const onCloseRef = useRef(onClose);
  onSuccessRef.current = onSuccess;
  onCloseRef.current = onClose;


  useEffect(() => {
    if (hasSubmitted && !deleteHarvestBatchLoading) {
      if (!deleteHarvestBatchError) {
        onSuccessRef.current?.();
        onCloseRef.current?.();
      }
      setHasSubmitted(false);
    }
  }, [hasSubmitted, deleteHarvestBatchLoading, deleteHarvestBatchError]);


  useEffect(() => {
    if (isOpen) setHasSubmitted(false);
  }, [isOpen]);


  const handleDelete = (e) => {
    e.preventDefault();
    if (!batch?._id) return;
    setHasSubmitted(true);
    dispatch(deleteHarvestBatchRequest(batch._id));
  };


  if (!isOpen || !batch) return null;


  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-200/80">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <Trash2 size={20} />
            </span>
            Delete harvest batch
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
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this harvest batch? This action cannot be undone.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-gray-500 shrink-0" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="text-gray-500">Batch Number: </span>
                  <span className="font-semibold text-gray-900">
                    {batch.batchNumber || batch.batchCode || batch._id}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="text-gray-500">Supplier: </span>
                  <span className="font-medium text-gray-900">{batch.supplier?.name || "N/A"}</span>
                </p>
                {batch.product?.name && (
                  <p className="text-sm text-gray-600">
                    <span className="text-gray-500">Product: </span>
                    <span className="font-medium text-gray-900">{batch.product.name}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          {deleteHarvestBatchError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {deleteHarvestBatchError}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteHarvestBatchLoading}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <Trash2 size={16} />
            {deleteHarvestBatchLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteHarvestBatch;

