import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Eye, EyeOff } from "lucide-react";
import { updateProductRequest } from "../../../redux/actions/productActions";


const VisibilityToggle = ({ isOpen, onClose, product, onSuccess }) => {
  const dispatch = useDispatch();
  const { updateProductLoading, updateProductError } = useSelector((state) => state.product);


  const [status, setStatus] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);


  useEffect(() => {
    if (product) {
      setStatus(product.status !== undefined ? product.status : true);
    }
  }, [product]);


  useEffect(() => {
    if (hasSubmitted && !updateProductLoading) {
      setHasSubmitted(false);
      if (!updateProductError) {
        onSuccess?.();
        onClose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onSuccess/onClose omitted to avoid infinite loop on parent re-render
  }, [hasSubmitted, updateProductLoading, updateProductError]);


  if (!isOpen || !product) return null;


  const handleSubmit = (e) => {
    e.preventDefault();
    const categoryId = product.category?._id || product.category || "";
    const formData = new FormData();
    formData.append("name", product.name || "");
    formData.append("short_desc", product.short_desc || "");
    formData.append("price", product.price || 0);
    formData.append("purchasePrice", product.purchasePrice || 0);
    formData.append("plannedQuantity", product.plannedQuantity ?? 0);
    formData.append("category", categoryId);
    formData.append("brand", product.brand || "");
    formData.append("detail_desc", product.detail_desc || "");
    formData.append("status", status);
    formData.append("existingImages", JSON.stringify(product.images || []));
    formData.append("existingImagePublicIds", JSON.stringify(product.imagePublicIds || []));


    setHasSubmitted(true);
    dispatch(updateProductRequest(product._id, formData));
  };


  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b bg-amber-50">
          <div className="flex items-center gap-2">
            {status ? <EyeOff size={22} className="text-amber-600" /> : <Eye size={22} className="text-amber-600" />}
            <h2 className="text-lg font-bold text-gray-800">Show / Hide product</h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={22} />
          </button>
        </div>


        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <p className="text-base font-medium text-gray-900">{product.name || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value === "true")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value={true}>Visible (shown to customers)</option>
                <option value={false}>Hidden (hidden from customers)</option>
              </select>
            </div>
            {updateProductError && (
              <p className="text-sm text-red-600">{updateProductError}</p>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProductLoading}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateProductLoading ? "Updating..." : "Update visibility"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisibilityToggle;

