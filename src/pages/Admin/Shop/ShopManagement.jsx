import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getShopInfoRequest,
  updateShopBasicInfoRequest,
  updateShopDescriptionRequest,
  updateShopWorkingHoursRequest,
  updateShopImagesRequest,
  clearShopMessages,
} from "../../../redux/actions/shopActions";
import { toast } from "react-toastify";
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Clock,
  FileText,
  Image as ImageIcon,
  Upload,
  X,
  Save,
  AlertCircle,
  Loader2,
} from "lucide-react";
import apiClient from "../../../utils/axiosConfig";

const ShopManagement = () => {
  const dispatch = useDispatch();
  const {
    shopInfo,
    getShopInfoLoading,
    updateBasicInfoLoading,
    updateDescriptionLoading,
    updateWorkingHoursLoading,
    updateImagesLoading,
    success,
    error,
  } = useSelector((state) => state.shop);

  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    shopName: "",
    address: "",
    email: "",
    phone: "",
  });
  const [description, setDescription] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [images, setImages] = useState([]);
  const [imagePublicIds, setImagePublicIds] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState({});

  // Load shop info on mount
  useEffect(() => {
    dispatch(getShopInfoRequest());
  }, [dispatch]);

  // Populate form when shop info is loaded
  useEffect(() => {
    if (shopInfo) {
      setFormData({
        shopName: shopInfo.shopName || "",
        address: shopInfo.address || "",
        email: shopInfo.email || "",
        phone: shopInfo.phone || "",
      });
      setDescription(shopInfo.description || "");
      setWorkingHours(shopInfo.workingHours || "");
      setImages(shopInfo.images || []);
      setImagePublicIds(shopInfo.imagePublicIds || []);
    }
  }, [shopInfo]);

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearShopMessages());
      // Refresh shop info
      dispatch(getShopInfoRequest());
    }
    if (error) {
      toast.error(error);
      dispatch(clearShopMessages());
    }
  }, [success, error, dispatch]);

  // Validate basic info form
  const validateBasicInfo = () => {
    const newErrors = {};
    if (!formData.shopName.trim()) {
      newErrors.shopName = "Tên shop là bắt buộc";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
    }
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Email không đúng định dạng";
      }
    }
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      const cleanPhone = formData.phone.trim().replace(/\s/g, "");
      if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 8) {
        newErrors.phone = "Số điện thoại không đúng định dạng";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle basic info update
  const handleBasicInfoSubmit = (e) => {
    e.preventDefault();
    if (!validateBasicInfo()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }
    dispatch(updateShopBasicInfoRequest(formData));
  };

  // Handle description update
  const handleDescriptionSubmit = (e) => {
    e.preventDefault();
    if (description && description.length > 5000) {
      toast.error("Nội dung mô tả không được vượt quá 5000 ký tự");
      return;
    }
    dispatch(updateShopDescriptionRequest(description));
  };

  // Handle working hours update
  const handleWorkingHoursSubmit = (e) => {
    e.preventDefault();
    if (!workingHours.trim()) {
      toast.error("Giờ hoạt động không được để trống");
      return;
    }
    dispatch(updateShopWorkingHoursRequest(workingHours));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        toast.error(`File ${file.name} không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`File ${file.name} vượt quá 5MB`);
        continue;
      }
    }

    setUploadingImages(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const uploadFormData = new FormData();
        uploadFormData.append("image", file); // Backend expects "image" field

        // Upload image endpoint: /upload/shop-image (requires admin auth)
        const response = await apiClient.post("/upload/shop-image", uploadFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.status === "OK") {
          // Handle different response formats
          const data = response.data.data || response.data;
          return {
            url: data.url || data.imageUrl || data.secure_url,
            publicId: data.public_id || data.publicId,
          };
        }
        throw new Error(response.data.message || "Upload failed");
      });

      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.url);
      const newPublicIds = results.map((r) => r.publicId);

      setImages([...images, ...newUrls]);
      setImagePublicIds([...imagePublicIds, ...newPublicIds]);
      toast.success(`Đã upload ${results.length} ảnh thành công`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Lỗi khi upload ảnh"
      );
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPublicIds = imagePublicIds.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePublicIds(newPublicIds);
  };

  // Handle images update
  const handleImagesSubmit = (e) => {
    e.preventDefault();
    dispatch(updateShopImagesRequest(images, imagePublicIds));
  };

  const tabs = [
    { id: "basic", label: "Thông tin cơ bản", icon: Store },
    { id: "description", label: "Mô tả shop", icon: FileText },
    { id: "working-hours", label: "Giờ hoạt động", icon: Clock },
    { id: "images", label: "Hình ảnh", icon: ImageIcon },
  ];

  if (getShopInfoLoading && !shopInfo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý thông tin shop
          </h1>
          <p className="text-gray-600">
            Quản lý và cập nhật thông tin shop của bạn
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tên shop <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shopName}
                    onChange={(e) =>
                      setFormData({ ...formData, shopName: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.shopName
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Nhập tên shop"
                  />
                  {errors.shopName && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.shopName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.address
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Nhập địa chỉ shop"
                  />
                  {errors.address && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.address}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.email
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="shop@example.com"
                      />
                    </div>
                    {errors.email && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.phone
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="0123456789"
                      />
                    </div>
                    {errors.phone && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phone}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updateBasicInfoLoading}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateBasicInfoLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Lưu thông tin</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Description Tab */}
            {activeTab === "description" && (
              <form onSubmit={handleDescriptionSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Mô tả shop
                    <span className="text-gray-500 font-normal text-xs ml-2">
                      (Hỗ trợ HTML, tối đa 5000 ký tự)
                    </span>
                  </label>
                  <textarea
                    rows={12}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none font-mono text-sm"
                    placeholder="Nhập mô tả shop (có thể sử dụng HTML)..."
                    maxLength={5000}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {description.length}/5000 ký tự
                  </div>
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Lưu ý:</strong> Bạn có thể sử dụng HTML để định dạng nội dung. Ví dụ:
                      &lt;p&gt;Đoạn văn&lt;/p&gt;, &lt;strong&gt;In đậm&lt;/strong&gt;,
                      &lt;img src="url" alt="mô tả" /&gt;
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updateDescriptionLoading}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateDescriptionLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Lưu mô tả</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Working Hours Tab */}
            {activeTab === "working-hours" && (
              <form onSubmit={handleWorkingHoursSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Giờ hoạt động <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Ví dụ: Thứ 2 - Thứ 6: 8:00 - 17:00&#10;Thứ 7 - Chủ nhật: 9:00 - 12:00"
                  />
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Lưu ý:</strong> Giờ hoạt động sẽ được hiển thị trên các trang About Us, Contact và Footer.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updateWorkingHoursLoading}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateWorkingHoursLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Lưu giờ hoạt động</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Images Tab */}
            {activeTab === "images" && (
              <form onSubmit={handleImagesSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Hình ảnh shop
                    <span className="text-gray-500 font-normal text-xs ml-2">
                      (JPG, PNG, WEBP, tối đa 5MB mỗi ảnh)
                    </span>
                  </label>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`cursor-pointer flex flex-col items-center ${
                        uploadingImages ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {uploadingImages ? (
                        <>
                          <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
                          <p className="text-gray-600">Đang upload ảnh...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mb-4" />
                          <p className="text-gray-600 mb-2">
                            Click để chọn ảnh hoặc kéo thả ảnh vào đây
                          </p>
                          <p className="text-sm text-gray-500">
                            Hỗ trợ JPG, PNG, WEBP (tối đa 5MB)
                          </p>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Images Grid */}
                  {images.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        Ảnh đã upload ({images.length})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((imageUrl, index) => (
                          <div
                            key={index}
                            className="relative group border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <img
                              src={imageUrl}
                              alt={`Shop image ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updateImagesLoading || images.length === 0}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateImagesLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Lưu ảnh</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopManagement;
