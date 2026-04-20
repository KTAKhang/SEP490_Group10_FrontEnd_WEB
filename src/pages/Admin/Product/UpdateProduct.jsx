import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { updateProductRequest } from "../../../redux/actions/productActions";
import { getCategoriesRequest } from "../../../redux/actions/categoryActions";
import { getSuppliersForBrandRequest } from "../../../redux/actions/supplierActions";

/** Selling price: > 0 and must be a multiple of 1000. Purchase price: >= 0 (multiple of 1000 not required). Returns { valid, message }. */
function validatePriceStep(value, isSellingPrice) {
  const num = Number(value);
  if (!Number.isFinite(num)) return { valid: false, message: isSellingPrice ? "Invalid selling price" : "Invalid purchase price" };
  if (isSellingPrice) {
    if (num <= 0) return { valid: false, message: "Selling price must be greater than 0" };
    if (num % 1000 !== 0) return { valid: false, message: "Selling price must be a multiple of 1000 (e.g. 1000, 20000, 21000)" };
  } else {
    if (num < 0) return { valid: false, message: "Purchase price must be greater than or equal to 0" };
  }
  return { valid: true };
}

const UpdateProduct = ({ isOpen, onClose, product }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.category);
  const { suppliersForBrand, suppliersForBrandLoading } = useSelector((state) => state.supplier);
  const { updateProductLoading, updateProductError } = useSelector((state) => state.product);


  const [formData, setFormData] = useState({
    name: "",
    short_desc: "",
    price: 0,
    purchasePrice: 0,
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


  // Fetch categories and suppliers when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(getCategoriesRequest({ page: 1, limit: 100, status: true }));
      dispatch(getSuppliersForBrandRequest());
    }
  }, [dispatch, isOpen]);


  // Track if we submitted the form
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [requestStarted, setRequestStarted] = useState(false);


  // Close modal after successful update
  useEffect(() => {
    if (!hasSubmitted) return;
    if (updateProductLoading) {
      setRequestStarted(true);
      return;
    }
    if (requestStarted && !updateProductError) {
      setHasSubmitted(false);
      setRequestStarted(false);
      onClose();
    } else if (requestStarted && updateProductError) {
      setRequestStarted(false);
      setHasSubmitted(false);
    }
  }, [hasSubmitted, requestStarted, updateProductLoading, updateProductError, onClose]);


  // Reset submit flag when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasSubmitted(false);
      setRequestStarted(false);
    }
  }, [isOpen]);


  // Load product data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        short_desc: product.short_desc || "",
        price: product.price || 0,
        purchasePrice: product.purchasePrice || 0,
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

    if (!product?._id) {
      toast.error("Product does not exist");
      return;
    }

    const received = Number(product.receivedQuantity ?? 0);
    const onHand = Number(product.onHandQuantity ?? 0);
    const canFullUpdate = received === 0 && onHand === 0;

    if (canFullUpdate) {
      const nameStr = (formData.name ?? "").toString().trim();
      if (!nameStr) {
        toast.error("Product name is required");
        return;
      }
      if (nameStr.length > 200) {
        toast.error("Product name must be at most 200 characters");
        return;
      }
      if (!formData.category || !formData.brand || formData.plannedQuantity < 0) {
        toast.error("Please fill in all required fields (name, category, brand, price, planned quantity)");
        return;
      }
      const priceCheck = validatePriceStep(formData.price, true);
      if (!priceCheck.valid) {
        toast.error(priceCheck.message);
        return;
      }
      const purchaseCheck = validatePriceStep(formData.purchasePrice, false);
      if (!purchaseCheck.valid) {
        toast.error(purchaseCheck.message);
        return;
      }
      if (Number(formData.purchasePrice) >= Number(formData.price)) {
        toast.error("Purchase price must be less than selling price");
        return;
      }
      const plannedNum = Number(formData.plannedQuantity);
      if (!Number.isInteger(plannedNum)) {
        toast.error("plannedQuantity must be an integer");
        return;
      }
      const totalImages = existingImages.length + newImageFiles.length;
      if (totalImages < 1) {
        toast.error("Product must have at least 1 image. If you removed images, please add new ones.");
        return;
      }
      if (totalImages > 10) {
        toast.error("Number of images must not exceed 10");
        return;
      }
    }

    // Always validate short_desc and detail_desc (required by backend for both full and description-only update)
    const shortDescStr = (formData.short_desc ?? "").toString().trim();
    if (!shortDescStr) {
      toast.error("Short description is required and cannot be empty");
      return;
    }
    if (shortDescStr.length > 200) {
      toast.error("Short description (short_desc) must be at most 200 characters");
      return;
    }
    const detailDescStr = (formData.detail_desc ?? "").toString().trim();
    if (!detailDescStr) {
      toast.error("Detailed description is required and cannot be empty");
      return;
    }
    if (detailDescStr.length > 1000) {
      toast.error("Detail description (detail_desc) must be at most 1000 characters");
      return;
    }

    const formDataToSend = new FormData();

    if (canFullUpdate) {
      formDataToSend.append("name", formData.name);
      formDataToSend.append("short_desc", formData.short_desc || "");
      formDataToSend.append("price", formData.price);
      formDataToSend.append("purchasePrice", formData.purchasePrice || 0);
      formDataToSend.append("plannedQuantity", formData.plannedQuantity);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("brand", formData.brand || "");
      formDataToSend.append("detail_desc", formData.detail_desc || "");
      formDataToSend.append("status", formData.status);
      // Send current "keep" list so backend merges correctly (empty = remove all old images, only keep new uploads)
      formDataToSend.append("existingImages", JSON.stringify(existingImages));
      formDataToSend.append("existingImagePublicIds", JSON.stringify(existingImagePublicIds));
      newImageFiles.forEach((file) => formDataToSend.append("images", file));
    } else {
      // Limited update when product already has stock in warehouse
      formDataToSend.append("short_desc", formData.short_desc || "");
      formDataToSend.append("detail_desc", formData.detail_desc || "");
      formDataToSend.append("status", formData.status);
    }

    setRequestStarted(false);
    setHasSubmitted(true);
    dispatch(updateProductRequest(product._id, formDataToSend));
  };


  const handleCancel = () => {
    setRequestStarted(false);
    setHasSubmitted(false);
    if (product) {
      setFormData({
        name: product.name || "",
        short_desc: product.short_desc || "",
        price: product.price || 0,
        purchasePrice: product.purchasePrice || 0,
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


  // Backend: full update only when no stock in warehouse (receivedQuantity = 0 && onHandQuantity = 0)
  const received = Number(product?.receivedQuantity ?? 0);
  const onHand = Number(product?.onHandQuantity ?? 0);
  const canFullUpdate = received === 0 && onHand === 0;

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
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 space-y-4">
            {!canFullUpdate && (
              <>
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  This product already has stock in warehouse (received or on-hand). You can only update <strong>Short description</strong>, <strong>Detailed description</strong>, and <strong>Status (show/hide)</strong>. To change price, quantity, images, brand, category, etc., wait until stock is cleared and the lot is reset.
                </div>
                <p className="text-sm text-gray-600">
                  Editing: <span className="font-medium text-gray-900">{product.name}</span>
                  {product.brand && <span className="text-gray-500"> · {product.brand}</span>}
                </p>
              </>
            )}

            {canFullUpdate && (
              <>
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
                      placeholder="Enter product name (max 200 characters)"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.name.length}/200</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      min="1000"
                      step="1000"
                      placeholder="e.g. 10000, 20000 (multiple of 1000)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Price (VND)
                    </label>
                    <input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      step="1"
                      placeholder="e.g. 0, 5000 (value ≥ 0)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Purchase price from supplier; must be less than selling price</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Planned quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.plannedQuantity}
                    onChange={(e) => {
                      const v = e.target.value;
                      const n = parseInt(v, 10);
                      setFormData({
                        ...formData,
                        plannedQuantity: (v === "" || Number.isNaN(n) || n < 0) ? 0 : n,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    step="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be a whole number; cannot be less than received quantity</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Received: {product.receivedQuantity || 0} | Cannot reduce below received amount
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier (Brand) <span className="text-red-500">*</span>
                    </label>
                    {suppliersForBrandLoading ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500">
                        Loading suppliers...
                      </div>
                    ) : (
                      <select
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select supplier (brand)</option>
                        {suppliersForBrand?.map((supplier) => (
                          <option key={supplier._id} value={supplier.name}>
                            {supplier.name} ({supplier.type === "FARM" ? "Farm" : "Cooperative"})
                          </option>
                        ))}
                      </select>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Select a supplier to assign as brand</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product images <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-1">At least 1 image required (current + new), max 10.</p>
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
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleNewImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
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
              </>
            )}

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.short_desc}
                onChange={(e) => setFormData({ ...formData, short_desc: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="2"
                placeholder="Short description (required, max 200 characters)"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.short_desc.length}/200</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detailed description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.detail_desc}
                onChange={(e) => setFormData({ ...formData, detail_desc: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="4"
                placeholder="Detailed description (required, max 1000 characters)"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.detail_desc.length}/1000</p>
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




