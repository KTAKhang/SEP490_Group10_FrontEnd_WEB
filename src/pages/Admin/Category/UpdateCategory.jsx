import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { updateCategoryRequest } from "../../../redux/actions/categoryActions";

const UpdateCategory = ({ isOpen, onClose, category }) => {
  const dispatch = useDispatch();
  const { updateCategoryLoading, updateCategoryError } = useSelector((state) => state.category);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [currentImagePublicId, setCurrentImagePublicId] = useState(null);

  // Track if we submitted the form
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);

  // Close modal after successful update
  useEffect(() => {
    if (hasSubmitted && !updateCategoryLoading && !updateCategoryError && !hasShownToast) {
      // Update was successful, show toast and close modal
      toast.success("Category updated successfully!");
      setHasShownToast(true);
      setHasSubmitted(false);
      onClose();
    }
    if (hasSubmitted && updateCategoryError && !hasShownToast) {
      toast.error(updateCategoryError);
      setHasShownToast(true);
    }
  }, [hasSubmitted, updateCategoryLoading, updateCategoryError, hasShownToast, onClose]);

  // Reset toast flag when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasShownToast(false);
      setHasSubmitted(false);
    }
  }, [isOpen]);

  // Load category data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        status: category.status !== undefined ? category.status : true,
      });
      setCurrentImageUrl(category.image || null);
      setCurrentImagePublicId(category.imagePublicId || null);
      setImagePreview(null);
      setImageFile(null);
    }
  }, [category]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
    setCurrentImagePublicId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.name.trim()) {
      toast.error("Please enter category name");
      return;
    }

    if (!category?._id) {
      toast.error("Category not found");
      return;
    }

    // Create FormData
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description || "");
    formDataToSend.append("status", formData.status);
    
    // Always send oldImagePublicId (even if null) so backend knows which image to delete
    if (currentImagePublicId) {
      formDataToSend.append("oldImagePublicId", currentImagePublicId);
    } else {
      formDataToSend.append("oldImagePublicId", "");
    }
    
    // If there's a new image file, send it
    if (imageFile) {
      formDataToSend.append("image", imageFile);
    } else if (!currentImageUrl) {
      // No new file and no old image, send empty to delete
      formDataToSend.append("image", "");
    }
    // If there's an old image and no new file, don't send anything (keep unchanged)

    // Don't close modal immediately - let it close after success
    setHasSubmitted(true);
    dispatch(updateCategoryRequest(category._id, formDataToSend));
  };

  const handleCancel = () => {
    setHasSubmitted(false);
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        status: category.status !== undefined ? category.status : true,
      });
      setCurrentImageUrl(category.image || null);
      setCurrentImagePublicId(category.imagePublicId || null);
      setImagePreview(null);
      setImageFile(null);
    }
    onClose();
  };

  if (!isOpen || !category) return null;

  const displayImage = imagePreview || currentImageUrl;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Edit category</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter category name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="4"
                placeholder="Enter category description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              {displayImage ? (
                <div className="mt-2">
                  <img
                    src={displayImage}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg border mb-2"
                  />
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                      Change image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              )}
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
              disabled={updateCategoryLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateCategoryLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCategory;
