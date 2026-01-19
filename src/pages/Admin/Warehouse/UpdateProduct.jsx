import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { updateProductRequest } from "../../../redux/actions/productActions";
import { getCategoriesRequest } from "../../../redux/actions/categoryActions";

const UpdateProduct = ({ isOpen, onClose, product }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.category);
  const { updateProductLoading, updateProductError } = useSelector((state) => state.product);

  const [formData, setFormData] = useState({
    name: "",
    short_desc: "",
    price: 0,
    plannedQuantity: 0,
    category: "",
    brand: "",
    detail_desc: "",
    status: true,
  });
  const [existingImages, setExistingImages] = useState([]);
  const [existingImagePublicIds, setExistingImagePublicIds] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  // Fetch categories when modal opens if not loaded (only active categories)
  useEffect(() => {
    if (isOpen) {
      dispatch(getCategoriesRequest({ page: 1, limit: 100, status: true }));
    }
  }, [dispatch, isOpen]);

  // Track if we submitted the form
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Close modal after successful update
  useEffect(() => {
    if (hasSubmitted && !updateProductLoading && !updateProductError) {
      // Update was successful, close modal
      setHasSubmitted(false);
      onClose();
    }
  }, [hasSubmitted, updateProductLoading, updateProductError, onClose]);

  // Load product data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        short_desc: product.short_desc || "",
        price: product.price || 0,
        plannedQuantity: product.plannedQuantity || 0,
        category: product.category?._id || product.category || "",
        brand: product.brand || "",
        detail_desc: product.detail_desc || "",
        status: product.status !== undefined ? product.status : true,
      });
      setExistingImages(product.images || []);
      setExistingImagePublicIds(product.imagePublicIds || []);
      setNewImageFiles([]);
      setNewImagePreviews([]);
    }
  }, [product]);

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newFiles = [...files];
    setNewImageFiles((prev) => [...prev, ...newFiles]);
    
    // Create previews for new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setNewImagePreviews((prev) => [...prev, reader.result]);
        }
      };
      reader.onerror = () => {
        console.error("Error reading file:", file.name);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setExistingImagePublicIds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category || !formData.brand || formData.price <= 0 || formData.plannedQuantity < 0) {
      toast.error("Please fill in all required fields (name, category, brand, price, planned quantity)");
      return;
    }

    if (!product?._id) {
      toast.error("Product not found");
      return;
    }

    // ✅ Block updating plannedQuantity if onHandQuantity > 0
    if (product.onHandQuantity > 0 && formData.plannedQuantity !== product.plannedQuantity) {
      toast.error("Cannot update planned quantity while product has stock. Please wait until stock is sold out or expired.");
      return;
    }

    // Create FormData
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("short_desc", formData.short_desc || "");
    formDataToSend.append("price", formData.price);
    formDataToSend.append("plannedQuantity", formData.plannedQuantity);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("brand", formData.brand || "");
    formDataToSend.append("detail_desc", formData.detail_desc || "");
    formDataToSend.append("status", formData.status);
    
    // Always append existing images (even if empty) so backend knows which images to keep
    // Backend will compare old images from DB with this list to determine which to delete
    formDataToSend.append("existingImages", JSON.stringify(existingImages));
    formDataToSend.append("existingImagePublicIds", JSON.stringify(existingImagePublicIds));
    
    // Append new image files
    newImageFiles.forEach((file) => {
      formDataToSend.append("images", file);
    });

    // Don't close modal immediately - let it close after success
    // This gives better UX as user can see loading state
    setHasSubmitted(true);
    dispatch(updateProductRequest(product._id, formDataToSend));
  };

  const handleCancel = () => {
    setHasSubmitted(false);
    if (product) {
      setFormData({
        name: product.name || "",
        short_desc: product.short_desc || "",
        price: product.price || 0,
        plannedQuantity: product.plannedQuantity || 0,
        category: product.category?._id || product.category || "",
        brand: product.brand || "",
        detail_desc: product.detail_desc || "",
        status: product.status !== undefined ? product.status : true,
      });
      setExistingImages(product.images || []);
      setExistingImagePublicIds(product.imagePublicIds || []);
      setNewImageFiles([]);
      setNewImagePreviews([]);
    }
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Edit product</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {categories?.filter((cat) => cat.status === true).map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short description
              </label>
              <textarea
                value={formData.short_desc}
                onChange={(e) => setFormData({ ...formData, short_desc: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="2"
                placeholder="Short description (max 200 characters)"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.short_desc.length}/200</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                  step="1000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planned quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.plannedQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, plannedQuantity: parseInt(e.target.value) || 0 })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    product.onHandQuantity > 0 
                      ? "bg-gray-100 border-gray-300 cursor-not-allowed" 
                      : "border-gray-300"
                  }`}
                  min="0"
                  required
                  disabled={product.onHandQuantity > 0}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {product.onHandQuantity > 0 
                    ? `Cannot update planned quantity while product has stock (onHand: ${product.onHandQuantity}). Please wait until stock is sold out or expired.`
                    : `Received: ${product.receivedQuantity || 0} | Cannot reduce below received amount`}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter brand"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value === "true" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={true}>Visible</option>
                  <option value={false}>Hidden</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detailed description
              </label>
              <textarea
                value={formData.detail_desc}
                onChange={(e) => setFormData({ ...formData, detail_desc: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="4"
                placeholder="Detailed description (max 1000 characters)"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.detail_desc.length}/1000</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product images
              </label>
              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Current images:</p>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`Existing ${index + 1}`}
                          className="h-16 w-16 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* New images input */}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleNewImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {/* New image previews */}
              {newImagePreviews.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">New images:</p>
                  <div className="flex flex-wrap gap-2">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="h-16 w-16 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 p-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProductLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateProductLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;
