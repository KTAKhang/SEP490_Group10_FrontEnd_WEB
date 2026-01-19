import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { createProductRequest } from "../../../redux/actions/productActions";
import { getCategoriesRequest } from "../../../redux/actions/categoryActions";
// import { getSuppliersForBrandRequest } from "../../../redux/actions/supplierActions";

const CreateProduct = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.category);
  const { suppliersForBrand, suppliersForBrandLoading } = useSelector((state) => state.supplier);
  const { createProductLoading } = useSelector((state) => state.product);

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
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Fetch categories and suppliers when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(getCategoriesRequest({ page: 1, limit: 100, status: true }));
      dispatch(getSuppliersForBrandRequest());
    }
  }, [dispatch, isOpen]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newFiles = [...files];
    setImageFiles((prev) => [...prev, ...newFiles]);
    
    // Create previews for new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImagePreviews((prev) => [...prev, reader.result]);
        }
      };
      reader.onerror = () => {
        console.error("Error reading file:", file.name);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category || !formData.brand || formData.price <= 0 || formData.plannedQuantity < 0) {
      toast.error("Please fill in all required fields (name, category, brand, price, planned quantity)");
      return;
    }
    
    if (formData.purchasePrice < 0) {
      toast.error("Purchase price must be >= 0");
      return;
    }

    // Create FormData
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("short_desc", formData.short_desc || "");
    formDataToSend.append("price", formData.price);
    if (formData.purchasePrice > 0) {
      formDataToSend.append("purchasePrice", formData.purchasePrice);
    }
    formDataToSend.append("plannedQuantity", formData.plannedQuantity);
formDataToSend.append("category", formData.category);
    formDataToSend.append("brand", formData.brand || "");
    formDataToSend.append("detail_desc", formData.detail_desc || "");
    formDataToSend.append("status", formData.status);
    
    // Append image files
    imageFiles.forEach((file) => {
      formDataToSend.append("images", file);
    });

    dispatch(createProductRequest(formDataToSend));
    onClose();
    // Reset form
    setFormData({
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
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleCancel = () => {
    setFormData({
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
    setImageFiles([]);
    setImagePreviews([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Add new product</h2>
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
                <p className="text-xs text-gray-500 mt-1">Giá nhập hàng từ supplier (có thể để trống)</p>
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
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {imagePreviews.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-16 w-16 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
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
              disabled={createProductLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createProductLoading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;