import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Loading from '../../components/Loading/Loading';
import { getPublicProductByIdRequest } from '../../redux/actions/publicProductActions';
import {
  getProductReviewsRequest,
  getProductReviewStatsRequest,
} from '../../redux/actions/reviewActions';
import { addFavoriteRequest, removeFavoriteRequest, getFavoritesRequest } from '../../redux/actions/favoriteActions';
import { addItemToCartRequest } from '../../redux/actions/cartActions';
import {
  ChevronLeft,
  ShoppingCart,
  Heart,
  Package,
  Calendar,
  Warehouse,
  Tag,
  Star,
  MessageCircle,
  Search,
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { publicProductDetail, publicProductDetailLoading, publicProductDetailError } = useSelector(
    (state) => state.publicProduct
  );
  const { favoriteStatus, favoritesLoading } = useSelector((state) => state.favorite);
  const {
    productReviews,
    productReviewsPagination,
    productReviewsLoading,
    productReviewsError,
    productReviewStats,
  } = useSelector((state) => state.review || {});

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewSortBy, setReviewSortBy] = useState('createdAt');
  const [reviewSortOrder, setReviewSortOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('description');

  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const favoritesLoadedRef = useRef(false);
  const prevUserRef = useRef(null);

  useEffect(() => {
    if (id) {
      dispatch(getPublicProductByIdRequest(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id) {
      dispatch(
        getProductReviewsRequest(id, {
          page: reviewPage,
          limit: 5,
          search: reviewSearch || undefined,
          sortBy: reviewSortBy,
          sortOrder: reviewSortOrder,
        })
      );
      dispatch(getProductReviewStatsRequest(id));
    }
  }, [dispatch, id, reviewPage, reviewSearch, reviewSortBy, reviewSortOrder]);

  const currentProductIdRef = useRef(null);
  useEffect(() => {
    if (publicProductDetail && publicProductDetail._id) {
      const productId = publicProductDetail._id;
      if (currentProductIdRef.current !== productId) {
        currentProductIdRef.current = productId;
        setSelectedImageIndex(0);
      }
    }
  }, [publicProductDetail?._id]);

  useEffect(() => {
    const currentUserId = storedUser?._id || storedUser?.id || null;
    const prevUserId = prevUserRef.current?._id || prevUserRef.current?.id || null;
    if (currentUserId !== prevUserId) {
      if (currentUserId) {
        favoritesLoadedRef.current = false;
        dispatch(getFavoritesRequest({ page: 1, limit: 500 }));
      } else {
        favoritesLoadedRef.current = false;
      }
      prevUserRef.current = storedUser;
    } else if (storedUser && !favoritesLoadedRef.current && !favoritesLoading) {
      dispatch(getFavoritesRequest({ page: 1, limit: 500 }));
    }
  }, [storedUser, dispatch]);

  useEffect(() => {
    if (!favoritesLoading && storedUser) {
      favoritesLoadedRef.current = true;
    }
  }, [favoritesLoading, storedUser]);

  if (publicProductDetailLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
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
      <div className="min-h-screen bg-stone-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 px-4">
          <p className="text-stone-600 text-lg mb-4">Product not found</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer font-medium"
          >
            Back to products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const product = publicProductDetail;
  const images =
    product.images && Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.featuredImage
        ? [product.featuredImage]
        : [];

  const handleAddToCart = () => {
    if (!storedUser) {
      navigate('/login');
      return;
    }
    if (product.onHandQuantity > 0) {
      dispatch(addItemToCartRequest(product._id, 1));
    }
  };

  const renderStars = (rating, size = 'sm') => {
    const value = Math.max(0, Math.min(5, Number(rating || 0)));
    const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${star <= value ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`}
          />
        ))}
      </div>
    );
  };

  const avgRating = productReviewStats?.avgRating ?? product.avgRating ?? 0;
  const reviewCount = productReviewStats?.reviewCount ?? product.reviewCount ?? 0;

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      {/* Breadcrumb */}
      <section className="pt-28 pb-4 bg-white border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-600 transition-colors cursor-pointer text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to products
          </button>
        </div>
      </section>

      {/* Product Hero */}
      <section className="py-8 lg:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Image Gallery */}
            <div className="lg:col-span-6">
              <div className="sticky top-28 space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg ring-1 ring-stone-200/60 aspect-square">
                  {images.length > 0 ? (
                    <img
                      src={images[selectedImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
                      No image available
                    </div>
                  )}
                  {product.isNearExpiry && product.originalPrice != null && product.originalPrice > 0 && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-md">
                      {Math.round((1 - (product.price || 0) / product.originalPrice) * 100)}% off
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedImageIndex === index
                            ? 'border-emerald-500 ring-2 ring-emerald-200'
                            : 'border-stone-200 hover:border-stone-300'
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
            </div>

            {/* Main Info + Sticky CTA */}
            <div className="lg:col-span-6">
              <div className="lg:sticky lg:top-28 space-y-6">
               

                {/* Product info list */}
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-stone-100 pb-4">
                    <span className="text-stone-500 text-sm font-medium min-w-[7rem]">Name:</span>
                    <span className="text-stone-900 font-semibold text-lg">{product.name}</span>
                  </div>

                  {product.category?.name && (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-stone-100 pb-4">
                      <span className="text-stone-500 text-sm font-medium min-w-[7rem]">Category:</span>
                      <span className="text-stone-900 font-medium">{product.category.name}</span>
                    </div>
                  )}
                  {product.brand && (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-stone-100 pb-4">
                      <span className="text-stone-500 text-sm font-medium min-w-[7rem]">Brand:</span>
                      <span className="text-stone-900 font-medium">{product.brand}</span>
                    </div>
                  )}
                    {product.short_desc && (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-stone-100 pb-4">
                      <span className="text-stone-500 text-sm font-medium min-w-[7rem]">Short description:</span>
                      <span className="text-stone-700 leading-relaxed">{product.short_desc}</span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-stone-100 pb-4">
                    <span className="text-stone-500 text-sm font-medium min-w-[7rem]">Price:</span>
                    <div className="flex flex-wrap items-baseline gap-2">
                      {product.isNearExpiry && product.originalPrice != null && product.originalPrice > 0 && (
                        <span className="text-stone-400 line-through">
                          {product.originalPrice?.toLocaleString('en-US')}/kg
                        </span>
                      )}
                      <span className="text-emerald-600 font-bold text-xl">
                        {product.price?.toLocaleString('en-US') || '0'}/kg
                      </span>
                    </div>
                  </div>
                  {product.onHandQuantity !== undefined && (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-stone-100 pb-4">
                      <span className="text-stone-500 text-sm font-medium min-w-[7rem]">Status:</span>
                      {product.onHandQuantity > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          In stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-600 font-medium">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          Out of stock
                        </span>
                      )}
                    </div>
                  )}
                  {reviewCount > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 pt-1">
                      <span className="text-stone-500 text-sm font-medium min-w-[7rem]">Rating:</span>
                      <div className="flex items-center gap-2">
                        {renderStars(avgRating, 'lg')}
                        <span className="text-stone-700 font-medium">{Number(avgRating).toFixed(1)}</span>
                        <span className="text-stone-400 text-sm">({reviewCount} reviews)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.onHandQuantity === 0}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all ${
                      product.onHandQuantity === 0
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg cursor-pointer'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {product.onHandQuantity === 0 ? 'Out of stock' : 'Add to cart'}
                  </button>
                  {storedUser && (
                    <button
                      onClick={() => {
                        const isFavorite = favoriteStatus[product._id];
                        if (isFavorite) dispatch(removeFavoriteRequest(product._id));
                        else dispatch(addFavoriteRequest(product._id));
                      }}
                      className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all cursor-pointer ${
                        favoriteStatus[product._id]
                          ? 'bg-red-50 border-red-500 text-red-500 hover:bg-red-100'
                          : 'border-stone-200 text-stone-500 hover:border-red-400 hover:text-red-500'
                      }`}
                      aria-label={favoriteStatus[product._id] ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart size={22} fill={favoriteStatus[product._id] ? 'currentColor' : 'none'} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs: Description + Specs */}
      <section className="py-6 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-200/60 overflow-hidden">
            <div className="flex border-b border-stone-200">
              {[
                { id: 'description', label: 'Description', icon: MessageCircle },
                { id: 'specs', label: 'Details', icon: Package },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === id
                      ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                      : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            <div className="p-6 sm:p-8">
              {activeTab === 'description' && (
                <div className="prose prose-stone max-w-none">
                  {(product.detail_desc || product.description) ? (
                    <div className="text-stone-600 leading-relaxed whitespace-pre-wrap">
                      {product.detail_desc || product.description}
                    </div>
                  ) : (
                    <p className="text-stone-500 italic">No detailed description available.</p>
                  )}
                </div>
              )}
              {activeTab === 'specs' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 uppercase tracking-wider">Category</p>
                      <p className="font-semibold text-stone-900">{product.category?.name || 'N/A'}</p>
                    </div>
                  </div>
                  {product.onHandQuantity !== undefined && (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 uppercase tracking-wider">Stock</p>
                        <p className={`font-semibold ${product.onHandQuantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {product.onHandQuantity} kg
                        </p>
                      </div>
                    </div>
                  )}
                  {product.expiryDateStr && (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 uppercase tracking-wider">Expiry date</p>
                        <p className="font-semibold text-stone-900">
                          {product.expiryDateStr.split('-').reverse().join('/')}
                        </p>
                      </div>
                    </div>
                  )}
                  {product.warehouseEntryDateStr && (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                        <Warehouse className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 uppercase tracking-wider">Warehouse entry date</p>
                        <p className="font-semibold text-stone-900">
                          {product.warehouseEntryDateStr.split('-').reverse().join('/')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-6 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-200/60 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">Product reviews</h2>
                    <p className="text-stone-500 text-sm">
                      {reviewCount} reviews · {Number(avgRating).toFixed(1)} stars
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={reviewSearch}
                      onChange={(e) => {
                        setReviewSearch(e.target.value);
                        setReviewPage(1);
                      }}
                      placeholder="Search reviews..."
                      className="w-full sm:w-56 pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <select
                    value={`${reviewSortBy}:${reviewSortOrder}`}
                    onChange={(e) => {
                      const [nextSortBy, nextSortOrder] = e.target.value.split(':');
                      setReviewSortBy(nextSortBy);
                      setReviewSortOrder(nextSortOrder);
                      setReviewPage(1);
                    }}
                    className="px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="createdAt:desc">Newest</option>
                    <option value="createdAt:asc">Oldest</option>
                    <option value="rating:desc">Highest rating</option>
                    <option value="rating:asc">Lowest rating</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {productReviewsLoading ? (
                <div className="py-12 text-center text-stone-500">Loading reviews...</div>
              ) : productReviewsError ? (
                <div className="py-8 text-red-600 text-center">{productReviewsError}</div>
              ) : productReviews.length === 0 ? (
                <div className="py-12 text-center text-stone-500">No reviews yet.</div>
              ) : (
                <div className="space-y-5">
                  {productReviews.map((review) => (
                    <div
                      key={review._id}
                      className="p-5 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700 font-semibold text-sm">
                            {(review.user_id?.user_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-900 truncate">
                              {review.user_id?.user_name || 'Customer'}
                            </p>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {review.createdAt ? new Date(review.createdAt).toLocaleString('en-US') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      {review.comment && (
                        <p className="text-stone-600 text-sm mt-3 leading-relaxed whitespace-pre-line">
                          {review.comment}
                        </p>
                      )}
                      {Array.isArray(review.images) && review.images.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {review.images.map((img, idx) => (
                            <div
                              key={`${img}-${idx}`}
                              className="h-20 w-20 rounded-lg overflow-hidden border border-stone-200 shadow-sm"
                            >
                              <img src={img} alt={`review-${idx}`} className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {productReviewsPagination && productReviewsPagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                    disabled={reviewPage === 1}
                    className="px-4 py-2 border border-stone-200 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-stone-600 px-2">
                    {reviewPage} / {productReviewsPagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setReviewPage((p) => Math.min(productReviewsPagination.totalPages, p + 1))
                    }
                    disabled={reviewPage === productReviewsPagination.totalPages}
                    className="px-4 py-2 border border-stone-200 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
