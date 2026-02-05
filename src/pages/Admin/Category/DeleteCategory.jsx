import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { deleteCategoryRequest, clearCategoryMessages } from "../../../redux/actions/categoryActions";

const DeleteCategory = ({ isOpen, onClose, category, onSuccess }) => {
  const dispatch = useDispatch();
  const { deleteCategoryLoading, deleteCategoryError } = useSelector(
    (state) => state.category
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Clear previous error when opening the modal so it doesn't show on reopen
  useEffect(() => {
    if (isOpen && category) {
      dispatch(clearCategoryMessages());
    }
  }, [dispatch, isOpen, category?._id]);

  useEffect(() => {
    if (hasSubmitted && !deleteCategoryLoading) {
      setHasSubmitted(false);
      if (!deleteCategoryError) {
        onSuccess?.();
        onClose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onSuccess/onClose intentionally omitted to avoid infinite loop on parent re-render
  }, [hasSubmitted, deleteCategoryLoading, deleteCategoryError]);

  if (!isOpen || !category) return null;

  const handleConfirm = () => {
    setHasSubmitted(true);
    dispatch(deleteCategoryRequest(category._id));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !deleteCategoryLoading) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b bg-red-50">
          <div className="flex items-center gap-2">
            <Trash2 size={22} className="text-red-600" />
            <h2 className="text-lg font-bold text-gray-800">Delete category</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleteCategoryLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                Are you sure you want to delete this category?
              </p>
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-semibold text-gray-900">&quot;{category.name}&quot;</span>
                {" "}will be permanently removed. This action cannot be undone.
              </p>
            </div>
          </div>
          {deleteCategoryError && (
            <p className="text-sm text-red-600">{deleteCategoryError}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteCategoryLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleteCategoryLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {deleteCategoryLoading ? "Deleting..." : "Delete"}
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategory;
