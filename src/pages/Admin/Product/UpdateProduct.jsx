import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { updateProductRequest } from "../../../redux/actions/productActions";
import { getCategoriesRequest } from "../../../redux/actions/categoryActions";
import { getSuppliersForBrandRequest } from "../../../redux/actions/supplierActions";


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


  // Close modal after successful update
  useEffect(() => {
    if (hasSubmitted && !updateProductLoading && !updateProductError) {
      setHasSubmitted(false);
      onClose();
    } else if (hasSubmitted && !updateProductLoading && updateProductError) {
      setHasSubmitted(false);
    }
  }, [hasSubmitted, updateProductLoading, updateProductError, onClose]);


  // Reset submit flag when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasSubmitted(false);
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
      toast.error("Product not found");
      return;
    }

    const received = Number(product.receivedQuantity ?? 0);
    const onHand = Number(product.onHandQuantity ?? 0);
    const canFullUpdate = received === 0 && onHand === 0;

    if (canFullUpdate) {
      // Validation for full update
      if (!formData.name || !formData.category || !formData.brand || formData.price <= 0 || formData.plannedQuantity < 0) {
        toast.error("Please fill in all required fields (name, category, brand, price, planned quantity)");
        return;
      }
      if (formData.purchasePrice < 0) {
        toast.error("Purchase price must be >= 0");
        return;
      }
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
      formDataToSend.append("existingImages", JSON.stringify(existingImages));
      formDataToSend.append("existingImagePublicIds", JSON.stringify(existingImagePublicIds));
      newImageFiles.forEach((file) => formDataToSend.append("images", file));
    } else {
      // Description-only update (product not reset)
      formDataToSend.append("short_desc", formData.short_desc || "");
      formDataToSend.append("detail_desc", formData.detail_desc || "");
    }

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
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {!canFullUpdate && (
              <>
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  This product already has stock in warehouse (received or on-hand). You can only update <strong>Short description</strong> and <strong>Detailed description</strong>. To change price, quantity, images, etc., wait until stock is cleared and the lot is reset.
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
                      Purchase Price (VND)
                    </label>
                    <input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      step="1000"
                      placeholder="Enter purchase price"
                    />
                    <p className="text-xs text-gray-500 mt-1">Giá nhập hàng từ supplier</p>
                  </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    required
                  />
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
                        required
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
                    Product images
                  </label>
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




