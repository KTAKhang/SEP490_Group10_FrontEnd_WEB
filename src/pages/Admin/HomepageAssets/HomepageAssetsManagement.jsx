import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getHomepageAssetsRequest,
  updateHomepageAssetRequest,
  clearHomepageAssetsMessages,
} from "../../../redux/actions/homepageAssetsActions";
import { toast } from "react-toastify";
import {
  Image as ImageIcon,
  Upload,
  X,
  Save,
  AlertCircle,
  Loader2,
  Home,
  Users,
  MessageSquare,
  ShoppingBag,
} from "lucide-react";
import apiClient from "../../../utils/axiosConfig";

const HomepageAssetsManagement = () => {
  const dispatch = useDispatch();
  const {
    assets,
    getAssetsLoading,
    updateAssetLoading,
    success,
    error,
  } = useSelector((state) => state.homepageAssets || {});

  const [uploading, setUploading] = useState({});
  const [uploadProgress, setUploadProgress] = useState({}); // % 0-100 cho từng key
  const blobUrlsRef = useRef({}); // Blob URL tạm để revoke khi xong
  const [assetData, setAssetData] = useState({
    heroBackground: { imageUrl: "", altText: "" },
    trustAvatar1: { imageUrl: "", altText: "" },
    trustAvatar2: { imageUrl: "", altText: "" },
    trustAvatar3: { imageUrl: "", altText: "" },
    testimonialImage: { imageUrl: "", altText: "" },
    testimonialImage2: { imageUrl: "", altText: "" },
    ctaImage: { imageUrl: "", altText: "" },
  });

  // Asset configurations
  const assetConfigs = [
    {
      key: "heroBackground",
      label: "Hero Background",
      description: "Wide landscape photo for hero section banner",
      icon: Home,
      aspectRatio: "16:9",
    },
    {
      key: "trustAvatar1",
      label: "Trust Avatar 1",
      description: "Customer portrait for trust badge",
      icon: Users,
      aspectRatio: "1:1",
    },
    {
      key: "trustAvatar2",
      label: "Trust Avatar 2",
      description: "Customer portrait for trust badge",
      icon: Users,
      aspectRatio: "1:1",
    },
    {
      key: "trustAvatar3",
      label: "Trust Avatar 3",
      description: "Customer portrait for trust badge",
      icon: Users,
      aspectRatio: "1:1",
    },
    {
      key: "testimonialImage",
      label: "Testimonial Image 1",
      description: "Lifestyle photo for first testimonial",
      icon: MessageSquare,
      aspectRatio: "3:4",
    },
    {
      key: "testimonialImage2",
      label: "Testimonial Image 2",
      description: "Lifestyle photo for second testimonial",
      icon: MessageSquare,
      aspectRatio: "3:4",
    },
    {
      key: "ctaImage",
      label: "CTA Image",
      description: "Fresh products image for call-to-action section",
      icon: ShoppingBag,
      aspectRatio: "2:1",
    },
  ];

  // Load assets on mount
  useEffect(() => {
    dispatch(getHomepageAssetsRequest());
  }, [dispatch]);

  // Cleanup blob URLs khi unmount (tránh rò rỉ bộ nhớ)
  useEffect(() => {
    return () => {
      Object.values(blobUrlsRef.current).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      blobUrlsRef.current = {};
    };
  }, []);

  // Populate form when assets are loaded
  useEffect(() => {
    if (assets && Array.isArray(assets)) {
      const newAssetData = { ...assetData };
      assets.forEach((asset) => {
        if (newAssetData[asset.key]) {
          newAssetData[asset.key] = {
            imageUrl: asset.imageUrl || "",
            altText: asset.altText || "",
          };
        }
      });
      setAssetData(newAssetData);
    }
  }, [assets]);

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearHomepageAssetsMessages());
      // Refresh assets
      dispatch(getHomepageAssetsRequest());
    }
    if (error) {
      toast.error(error);
      dispatch(clearHomepageAssetsMessages());
    }
  }, [success, error, dispatch]);

  // Nén ảnh bằng canvas khi file > 1MB để upload nhanh hơn (không đổi logic, chỉ giảm dung lượng)
  const compressImageIfNeeded = (file, key) => {
    const maxSizeBytes = 1024 * 1024; // 1MB
    if (file.size <= maxSizeBytes) return Promise.resolve(file);
    const maxWidth = (key === 'heroBackground' || key === 'ctaImage') ? 1920 : 800;
    const quality = 0.85;

    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(objectUrl);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    });
  };

  // Handle image upload: preview ngay (blob URL) + progress + nén nếu file lớn
  const handleImageUpload = async (key, file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)');
      return;
    }

    const maxSize = (key === 'heroBackground' || key === 'ctaImage') ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Kích thước file không được vượt quá ${maxSize / 1024 / 1024}MB`);
      return;
    }

    const previousUrl = assetData[key]?.imageUrl || '';
    if (blobUrlsRef.current[key]) {
      URL.revokeObjectURL(blobUrlsRef.current[key]);
      blobUrlsRef.current[key] = null;
    }

    // Preview ngay bằng blob URL để user thấy ảnh ngay, không đợi upload
    const blobUrl = URL.createObjectURL(file);
    blobUrlsRef.current[key] = blobUrl;
    const altText = assetData[key]?.altText || `${assetConfigs.find(c => c.key === key)?.label || key} image`;
    setAssetData((prev) => ({
      ...prev,
      [key]: { imageUrl: blobUrl, altText },
    }));

    try {
      setUploading((prev) => ({ ...prev, [key]: true }));
      setUploadProgress((prev) => ({ ...prev, [key]: 0 }));

      const fileToUpload = await compressImageIfNeeded(file, key);

      const uploadFormData = new FormData();
      uploadFormData.append('image', fileToUpload);

      const response = await apiClient.post('/api/admin/homepage-assets/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            setUploadProgress((prev) => ({ ...prev, [key]: Math.round((100 * e.loaded) / e.total) }));
          }
        },
      });

      let uploadUrl = null;
      if (response.data?.status === 'OK' && response.data?.data?.url) {
        uploadUrl = response.data.data.url;
      } else {
        throw new Error(response.data?.message || 'Response format không đúng từ backend');
      }

      if (blobUrlsRef.current[key]) {
        URL.revokeObjectURL(blobUrlsRef.current[key]);
        blobUrlsRef.current[key] = null;
      }

      setAssetData((prev) => ({
        ...prev,
        [key]: { imageUrl: uploadUrl, altText },
      }));
      toast.info('Đã chọn hình ảnh. Nhấn "Lưu" để lưu thay đổi.');
    } catch (error) {
      if (blobUrlsRef.current[key]) {
        URL.revokeObjectURL(blobUrlsRef.current[key]);
        blobUrlsRef.current[key] = null;
      }
      setAssetData((prev) => ({
        ...prev,
        [key]: { imageUrl: previousUrl, altText: assetData[key]?.altText || '' },
      }));

      console.error('Error uploading image:', error);
      let errorMessage = 'Có lỗi xảy ra khi upload hình ảnh';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'Endpoint POST /api/admin/homepage-assets/upload không tồn tại. Vui lòng kiểm tra backend.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Dữ liệu không hợp lệ.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Không có quyền truy cập. Chỉ admin mới có thể upload homepage assets.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      } else if (error.message?.includes('network') || error.code === 'ERR_NETWORK') {
        errorMessage = 'Không thể kết nối đến server.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      toast.error(errorMessage, { autoClose: 7000 });
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
      setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
    }
  };

  // Handle save asset (lưu vào DB - có thể lưu hình mới hoặc lưu "đã xóa" khi imageUrl rỗng)
  const handleSaveAsset = (key) => {
    const asset = assetData[key];
    dispatch(updateHomepageAssetRequest(key, asset.imageUrl || '', asset.altText || ''));
  };

  // Handle remove image - chỉ xóa trong form, chưa lưu. User phải nhấn "Lưu" để lưu thay đổi.
  const handleRemoveImage = (key) => {
    setAssetData({
      ...assetData,
      [key]: {
        imageUrl: "",
        altText: assetData[key]?.altText || "",
      }
    });
    toast.info('Đã xóa hình trong form. Nhấn "Lưu" để lưu thay đổi.');
  };

  if (getAssetsLoading && !assets) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải hình ảnh homepage...</p>
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
            Quản lý hình ảnh Homepage
          </h1>
          <p className="text-gray-600">
            Upload và quản lý các hình ảnh hiển thị trên trang chủ
          </p>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assetConfigs.map((config) => {
            const Icon = config.icon;
            const asset = assetData[config.key];
            const isUploading = uploading[config.key];
            const progress = uploadProgress[config.key] ?? 0;

            return (
              <div key={config.key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-lg">
                      <Icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{config.label}</h3>
                      <p className="text-sm text-gray-500">{config.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Tỷ lệ: {config.aspectRatio}</p>
                    </div>
                  </div>
                </div>

                {/* Image Preview - ảnh hiện ngay (blob) khi chọn file, không đợi upload xong */}
                <div className="mb-4">
                  <div className={`w-full border-2 border-dashed rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center relative ${
                    config.aspectRatio === '16:9' ? 'aspect-video' :
                    config.aspectRatio === '1:1' ? 'aspect-square' :
                    config.aspectRatio === '3:4' ? 'aspect-[3/4]' :
                    config.aspectRatio === '2:1' ? 'aspect-[2/1]' : 'h-48'
                  }`}>
                    {asset.imageUrl ? (
                      <>
                        <img
                          src={asset.imageUrl}
                          alt={asset.altText || config.label}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-lg">
                            <Loader2 className="w-10 h-10 text-white animate-spin mb-2" />
                            <span className="text-white text-sm font-medium">{progress}%</span>
                            <div className="w-3/4 h-1.5 bg-white/30 rounded-full mt-2 overflow-hidden">
                              <div
                                className="h-full bg-white rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <span className="text-sm">Chưa có hình ảnh</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Alt Text Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Text (SEO)
                  </label>
                  <input
                    type="text"
                    value={asset.altText}
                    onChange={(e) =>
                      setAssetData({
                        ...assetData,
                        [config.key]: {
                          ...asset,
                          altText: e.target.value,
                        }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    placeholder={`Mô tả cho ${config.label.toLowerCase()}`}
                  />
                </div>

                {/* Actions: Chọn hình / Xóa (chỉ form) / Lưu (gửi lên DB) */}
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor={`upload-${config.key}`}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? `Đang upload... ${progress}%` : 'Chọn hình ảnh'}
                  </label>
                  <input
                    id={`upload-${config.key}`}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleImageUpload(config.key, file);
                      }
                    }}
                    disabled={isUploading}
                    className="hidden"
                  />
                  {asset.imageUrl ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(config.key)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                      title="Xóa hình (nhấn Lưu để lưu thay đổi)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleSaveAsset(config.key)}
                    disabled={updateAssetLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
                    title="Lưu thay đổi vào database"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Lưu
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Lưu ý:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Hero Background và CTA Image: Kích thước tối đa 10MB</li>
                <li>Các hình ảnh khác: Kích thước tối đa 5MB</li>
                <li>Định dạng được hỗ trợ: JPG, PNG, GIF, WEBP</li>
                <li>Sau khi upload, nhấn "Lưu" để lưu vào database</li>
                <li>Hình ảnh sẽ tự động cập nhật trên trang chủ sau khi lưu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageAssetsManagement;
