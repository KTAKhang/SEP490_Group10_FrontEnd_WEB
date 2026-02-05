import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { getProductsRequest } from "../../../redux/actions/productActions";
import { updateFruitBasketRequest } from "../../../redux/actions/fruitBasketActions";

const UpdateFruitBasket = ({ isOpen, onClose, basket }) => {
  const dispatch = useDispatch();
  const { products, productsLoading } = useSelector((state) => state.product);
  const { updateFruitBasketLoading, updateFruitBasketError } = useSelector(
    (state) => state.fruitBasket
  );

  const [formData, setFormData] = useState({
    name: "",
    short_desc: "",
    detail_desc: "",
    status: true,
  });
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);
  const [images, setImages] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(getProductsRequest({ page: 1, limit: 200, status: true, sortBy: "name", sortOrder: "asc" }));
      setHasSubmitted(false);
      toastShownRef.current = false;
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (basket) {
      setFormData({
        name: basket.name || "",
        short_desc: basket.short_desc || "",
        detail_desc: basket.detail_desc || "",
        status: basket.status !== undefined ? basket.status : true,
      });
      const mappedItems = (basket.items || []).map((item) => ({
        productId: item.product?._id || item.product || "",
        quantity: Number(item.quantity || 1),
      }));
      setItems(mappedItems.length > 0 ? mappedItems : [{ productId: "", quantity: 1 }]);
      const imageList = [];
      const urls = Array.isArray(basket.images) ? basket.images : [];
      const publicIds = Array.isArray(basket.imagePublicIds) ? basket.imagePublicIds : [];
      const maxLen = Math.max(urls.length, publicIds.length);
      for (let i = 0; i < maxLen; i += 1) {
        imageList.push({
          url: urls[i] || "",
          publicId: publicIds[i] || "",
        });
      }
      setImages(imageList);
      setUploadFiles((prev) => {
        prev.forEach((file) => URL.revokeObjectURL(file.preview));
        return [];
      });
    }
  }, [basket]);

  useEffect(() => {
    if (hasSubmitted && !updateFruitBasketLoading && !updateFruitBasketError && !toastShownRef.current) {
      toast.success("Fruit basket updated successfully!");
      toastShownRef.current = true;
      setHasSubmitted(false);
      onClose();
    }
    if (hasSubmitted && updateFruitBasketError && !toastShownRef.current) {
      toast.error(updateFruitBasketError);
      toastShownRef.current = true;
    }
  }, [hasSubmitted, updateFruitBasketLoading, updateFruitBasketError, onClose]);

  const productOptions = useMemo(() => products || [], [products]);

  const handleAddItem = () => {
    if (items.length >= 5) {
      toast.error("Fruit basket can have at most 5 fruit types");
      return;
    }
    setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, key, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handleAddImages = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const total = images.length + uploadFiles.length + files.length;
    if (total > 10) {
      toast.error("Number of images must not exceed 10");
      return;
    }

    const nextFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadFiles((prev) => [...prev, ...nextFiles]);
    event.target.value = "";
  };

  const handleRemoveUpload = (index) => {
    setUploadFiles((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveExisting = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateItems = () => {
    const normalized = items.filter((item) => item.productId);
    if (normalized.length === 0) {
      toast.error("Fruit basket must have at least 1 fruit type");
      return null;
    }
    if (normalized.length > 5) {
      toast.error("Fruit basket can have at most 5 fruit types");
      return null;
    }

    const productSet = new Set();
    for (const item of normalized) {
      if (productSet.has(item.productId)) {
        toast.error("Không được chọn trùng sản phẩm trong giỏ trái cây");
        return null;
      }
      productSet.add(item.productId);
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
        toast.error("Quantity per fruit must be an integer from 1 to 10");
        return null;
      }
    }

    return normalized.map((item) => ({
      product: item.productId,
      quantity: Number(item.quantity),
    }));
  };

  const validateImages = () => {
    const normalized = images.filter((img) => img.url && img.publicId);
    const total = normalized.length + uploadFiles.length;
    if (total > 10) {
      toast.error("Number of images must not exceed 10");
      return null;
    }
    return {
      existingImages: normalized,
      uploadFiles: uploadFiles.map((item) => item.file),
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!basket?._id) {
      toast.error("Fruit basket not found");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Tên giỏ trái cây là bắt buộc");
      return;
    }

    const itemsPayload = validateItems();
    if (!itemsPayload) return;

    const imagePayload = validateImages();
    if (!imagePayload) return;

    const payload = new FormData();
    payload.append("name", formData.name.trim());
    payload.append("short_desc", formData.short_desc || "");
    payload.append("detail_desc", formData.detail_desc || "");
    itemsPayload.forEach((item, index) => {
      payload.append(`items[${index}][product]`, item.product);
      payload.append(`items[${index}][quantity]`, String(item.quantity));
    });
    payload.append("status", formData.status ? "true" : "false");
    payload.append(
      "existingImages",
      JSON.stringify(imagePayload.existingImages.map((img) => img.url))
    );
    payload.append(
      "existingImagePublicIds",
      JSON.stringify(imagePayload.existingImages.map((img) => img.publicId))
    );
    imagePayload.uploadFiles.forEach((file) => payload.append("images", file));

    setHasSubmitted(true);
    dispatch(updateFruitBasketRequest(basket._id, payload));
  };

  const handleCancel = () => {
    setHasSubmitted(false);
    onClose();
  };

  if (!isOpen || !basket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Update fruit basket</h2>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Basket name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter basket name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short description</label>
              <input
                type="text"
                value={formData.short_desc}
                onChange={(e) => setFormData({ ...formData, short_desc: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Short description"
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detail description</label>
              <textarea
                value={formData.detail_desc}
                onChange={(e) => setFormData({ ...formData, detail_desc: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={4}
                placeholder="Detail description"
                maxLength={1000}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Items (1-5)</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center space-x-1 text-green-600 hover:text-green-800"
                >
                  <Plus size={16} />
                  <span>Add item</span>
                </button>
              </div>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-8 gap-3 items-center">
                  <div className="md:col-span-5">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={productsLoading}
                    >
                      <option value="">-- Select product --</option>
                      {productOptions.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Images (optional, up to 10)</h3>
                <label className="flex items-center space-x-1 text-green-600 hover:text-green-800 cursor-pointer">
                  <Plus size={16} />
                  <span>Add images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddImages}
                    className="hidden"
                  />
                </label>
              </div>
              {images.length === 0 && uploadFiles.length === 0 && (
                <p className="text-xs text-gray-500">Upload images from your device (max 10).</p>
              )}
              {(images.length > 0 || uploadFiles.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={`existing-${index}`} className="relative border rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExisting(index)}
                        className="absolute top-1 right-1 bg-white/80 text-red-600 hover:text-red-800 rounded-full p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {uploadFiles.map((item, index) => (
                    <div key={`upload-${index}`} className="relative border rounded-lg overflow-hidden">
                      <img
                        src={item.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveUpload(index)}
                        className="absolute top-1 right-1 bg-white/80 text-red-600 hover:text-red-800 rounded-full p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value === "true" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
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
              disabled={updateFruitBasketLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateFruitBasketLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateFruitBasket;
