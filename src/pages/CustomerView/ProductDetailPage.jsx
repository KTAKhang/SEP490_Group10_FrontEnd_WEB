import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Loading from '../../components/Loading/Loading';
import { getPublicProductByIdRequest } from '../../redux/actions/publicProductActions';
import { addFavoriteRequest, removeFavoriteRequest, getFavoritesRequest } from '../../redux/actions/favoriteActions';
import { ChevronLeft, ShoppingCart, Heart } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { publicProductDetail, publicProductDetailLoading, publicProductDetailError } = useSelector(
    (state) => state.publicProduct
  );
  const { favoriteStatus, favoritesLoading } = useSelector((state) => state.favorite);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Check if user is logged in
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  
  // Track if favorites have been loaded for current user
  const favoritesLoadedRef = useRef(false);
  const prevUserRef = useRef(null);

  useEffect(() => {
    if (id) {
      dispatch(getPublicProductByIdRequest(id));
    }
  }, [dispatch, id]);

  // Track current product ID to detect changes
  const currentProductIdRef = useRef(null);

  // Reset selected image when product ID changes
  useEffect(() => {
    if (publicProductDetail && publicProductDetail._id) {
      const productId = publicProductDetail._id;
      
      // Only process if product ID actually changed (not just reference)
      if (currentProductIdRef.current !== productId) {
        currentProductIdRef.current = productId;
        setSelectedImageIndex(0);
      }
    }
  }, [publicProductDetail?._id]);

  // Load favorites list when user logs in (to populate favoriteStatus)
  useEffect(() => {
    const currentUserId = storedUser?._id || storedUser?.id || null;
    const prevUserId = prevUserRef.current?._id || prevUserRef.current?.id || null;
    
    // User changed (logged in or logged out)
    if (currentUserId !== prevUserId) {
      if (currentUserId) {
        // User logged in - load favorites list to populate favoriteStatus
        // Use a reasonable limit (500) instead of 1000 to avoid server overload
        favoritesLoadedRef.current = false;
        dispatch(getFavoritesRequest({ page: 1, limit: 500 }));
      } else {
        // User logged out - reset
        favoritesLoadedRef.current = false;
      }
      prevUserRef.current = storedUser;
    } else if (storedUser && !favoritesLoadedRef.current && !favoritesLoading) {
      // User already logged in but favorites not loaded yet (only if not already loading)
      dispatch(getFavoritesRequest({ page: 1, limit: 500 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedUser, dispatch]);
  
  // Mark favorites as loaded after successful fetch
  useEffect(() => {
    if (!favoritesLoading && storedUser) {
      favoritesLoadedRef.current = true;
    }
  }, [favoritesLoading, storedUser]);

  if (publicProductDetailLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center items-center py-32">
          <Loading message="Loading product details..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (publicProductDetailError || !publicProductDetail) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-gray-600 text-lg mb-4">Product not found</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Back to Products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const product = publicProductDetail;
  const images = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.featuredImage
    ? [product.featuredImage]
    : [];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <section className="pt-32 pb-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
            <span>Back to Products</span>
          </button>
        </div>
      </section>

      {/* Product Detail */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="relative mb-4 rounded-2xl overflow-hidden bg-gray-100 aspect-square">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative rounded-lg overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                        selectedImageIndex === index
                          ? 'border-gray-900'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <span className="text-sm text-gray-500 uppercase tracking-wider">
                  {product.category?.name || 'N/A'}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {product.brand && (
                <p className="text-lg text-gray-600 mb-4">
                  Thương hiệu: <span className="font-semibold text-gray-900">{product.brand}</span>
                </p>
              )}

              <p className="text-2xl font-bold text-gray-900 mb-6">
                {product.price?.toLocaleString('vi-VN') || '0'}đ
              </p>

              {/* Stock Status Badge */}
              {product.onHandQuantity !== undefined && (
                <div className="mb-6">
                  {product.onHandQuantity > 0 ? (
                    <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Còn hàng
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      Hết hàng
                    </span>
                  )}
                </div>
              )}

              {/* Short Description */}
              {product.short_desc && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Mô tả</h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {product.short_desc}
                  </p>
                </div>
              )}

              {/* Detailed Description */}
              {product.detail_desc && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Mô tả chi tiết</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {product.detail_desc}
                  </p>
                </div>
              )}

              {/* Fallback to description if detail_desc not available */}
              {!product.detail_desc && product.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Mô tả</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Product Details */}
              <div className="mb-8 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Danh mục</span>
                  <span className="font-semibold text-gray-900">{product.category?.name || 'N/A'}</span>
                </div>
                {product.onHandQuantity !== undefined && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Tồn kho</span>
                    <span className={`font-semibold ${product.onHandQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.onHandQuantity || 0}
                    </span>
                  </div>
                )}
                {product.expiryDateStr && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Hạn sử dụng</span>
                    <span className="font-semibold text-gray-900">
                      {product.expiryDateStr.split('-').reverse().join('/')}
                    </span>
                  </div>
                )}
                {product.warehouseEntryDateStr && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Ngày nhập kho</span>
                    <span className="font-semibold text-gray-900">
                      {product.warehouseEntryDateStr.split('-').reverse().join('/')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    // Handle add to cart logic here
                    if (product.onHandQuantity > 0) {
                      console.log('Add to cart:', product._id);
                    }
                  }}
                  disabled={product.onHandQuantity === 0}
                  className={`flex-1 flex items-center justify-center space-x-2 px-8 py-4 rounded-lg font-semibold transition-colors ${
                    product.onHandQuantity === 0
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-800 cursor-pointer'
                  }`}
                >
                  <ShoppingCart size={20} />
                  <span>{product.onHandQuantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}</span>
                </button>
                {storedUser && (
                  <button
                    onClick={() => {
                      const isFavorite = favoriteStatus[product._id];
                      if (isFavorite) {
                        dispatch(removeFavoriteRequest(product._id));
                      } else {
                        dispatch(addFavoriteRequest(product._id));
                      }
                    }}
                    className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg transition-colors cursor-pointer ${
                      favoriteStatus[product._id]
                        ? 'bg-red-500 border-red-500 text-white hover:bg-red-600'
                        : 'border-gray-300 hover:border-red-500 hover:text-red-500'
                    }`}
                    aria-label={favoriteStatus[product._id] ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart size={20} fill={favoriteStatus[product._id] ? 'currentColor' : 'none'} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
