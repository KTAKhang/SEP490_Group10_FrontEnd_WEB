import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Loading from '../components/Loading/Loading';
import { getFavoritesRequest, addFavoriteRequest, removeFavoriteRequest, checkFavoriteRequest } from '../redux/actions/favoriteActions';
import { getPublicCategoriesRequest } from '../redux/actions/publicCategoryActions';
import { Search, Package, Heart } from 'lucide-react';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get categories for filter
  const { publicCategories } = useSelector((state) => state.publicCategory);
  
  // Get favorites
  const { 
    favorites, 
    favoritesPagination, 
    favoritesLoading,
    favoriteStatus,
  } = useSelector((state) => state.favorite);

  // Check if user is logged in
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  // Track which products have been checked for favorite status
  const checkedProductsRef = useRef(new Set());

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(getPublicCategoriesRequest({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Check if user is logged in, redirect if not
  useEffect(() => {
    if (!storedUser) {
      navigate('/login');
    }
  }, [storedUser, navigate]);

  // Track previous filter values to avoid unnecessary updates
  const prevFiltersRef = useRef('');
  
  // Update URL params separately to avoid loop (only when filters change, not when searchParams change)
  const prevUrlParamsRef = useRef('');
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    if (searchTerm) newSearchParams.set('search', searchTerm);
    if (selectedCategory !== 'all') newSearchParams.set('category', selectedCategory);
    if (sortBy !== 'createdAt' || sortOrder !== 'desc') {
      if (sortBy !== 'createdAt') newSearchParams.set('sortBy', sortBy);
      if (sortOrder !== 'desc') newSearchParams.set('sortOrder', sortOrder);
    }
    if (currentPage > 1) newSearchParams.set('page', currentPage.toString());
    
    const newParamsString = newSearchParams.toString();
    
    // Only update if params actually changed
    if (prevUrlParamsRef.current !== newParamsString) {
      prevUrlParamsRef.current = newParamsString;
      setSearchParams(newSearchParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Fetch favorites when filters change
  useEffect(() => {
    if (!storedUser) return;

    const params = {
      page: currentPage,
      limit: 12,
      search: searchTerm || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      sortBy: sortBy === 'default' ? 'createdAt' : sortBy,
      sortOrder: sortOrder,
    };

    // Create a string representation of filters to compare
    const filtersString = `${currentPage}-${searchTerm}-${selectedCategory}-${sortBy}-${sortOrder}`;
    
    // Only proceed if filters actually changed
    if (filtersString === prevFiltersRef.current) {
      return;
    }
    
    prevFiltersRef.current = filtersString;

    dispatch(getFavoritesRequest(params));
    // Reset checked products when filters change (new products will be loaded)
    checkedProductsRef.current.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, currentPage, searchTerm, selectedCategory, sortBy, sortOrder, storedUser]);

  // Note: Favorites in WishlistPage are already favorites, so we don't need to check status
  // The favoriteStatus will be automatically set to true when favorites are loaded in the reducer

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (value) => {
    if (value === 'default') {
      setSortBy('createdAt');
      setSortOrder('desc');
    } else if (value === 'price-low') {
      setSortBy('price');
      setSortOrder('asc');
    } else if (value === 'price-high') {
      setSortBy('price');
      setSortOrder('desc');
    } else if (value === 'name') {
      setSortBy('name');
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Handle category filter
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (e, productId) => {
    e.stopPropagation();
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const isFavorite = favoriteStatus[productId];
    if (isFavorite) {
      dispatch(removeFavoriteRequest(productId));
    } else {
      dispatch(addFavoriteRequest(productId));
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortValue = 
    sortBy === 'createdAt' && sortOrder === 'desc' ? 'default' :
    sortBy === 'price' && sortOrder === 'asc' ? 'price-low' :
    sortBy === 'price' && sortOrder === 'desc' ? 'price-high' :
    sortBy === 'name' && sortOrder === 'asc' ? 'name' : 'default';

  if (!storedUser) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Favorite product
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Danh sách các sản phẩm bạn đã yêu thích
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-b border-gray-200 sticky top-20 bg-white z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="relative max-w-md">
              <input
                type="text"
                placeholder="Search by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </form>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {publicCategories?.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryChange(cat._id)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat._id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sort Filter */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Sort:</span>
              <select
                value={sortValue}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                <option value="default">Default (Newest first)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {favoritesLoading ? (
            <div className="flex justify-center py-12">
              <Loading message="Loading favorites..." />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No favorite products found</p>
              <p className="text-gray-500 text-sm mt-2">
                Start adding products to your wishlist!
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-gray-600">
                  Showing{' '}
                  <span className="font-semibold">
                    {favoritesPagination 
                      ? favoritesPagination.page * favoritesPagination.limit - favoritesPagination.limit + 1
                      : 0}{' '}
                    -{' '}
                    {favoritesPagination
                      ? Math.min(
                          favoritesPagination.page * favoritesPagination.limit,
                          favoritesPagination.total
                        )
                      : 0}{' '}
                    of {favoritesPagination?.total || 0} products
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {favorites.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  >
                    {/* Product Image */}
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                      <img
                        src={product.featuredImage || 'https://via.placeholder.com/400x400?text=No+Image'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Out of Stock Badge */}
                      {product.onHandQuantity === 0 && (
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg">
                            Hết hàng
                          </span>
                        </div>
                      )}
                      <button
                        onClick={(e) => handleFavoriteToggle(e, product._id)}
                        className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full transition-opacity shadow-lg cursor-pointer ${
                          favoriteStatus[product._id]
                            ? 'bg-red-500 text-white opacity-100'
                            : 'bg-white opacity-0 group-hover:opacity-100'
                        }`}
                        aria-label="Remove from wishlist"
                      >
                        <Heart 
                          size={20} 
                          fill={favoriteStatus[product._id] ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                        {product.category?.name || 'N/A'}
                      </p>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description || product.short_desc || ''}
                      </p>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-gray-900">
                            {product.price?.toLocaleString('vi-VN') || '0'}đ
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.onHandQuantity > 0) {
                              // Handle add to cart logic here
                            }
                          }}
                          disabled={product.onHandQuantity === 0}
                          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                            product.onHandQuantity === 0
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-gray-900 text-white hover:bg-gray-800 cursor-pointer'
                          }`}
                          aria-label="Add to cart"
                        >
                          <i className="ri-shopping-cart-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {favoritesPagination && favoritesPagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  {[...Array(favoritesPagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === favoritesPagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 border rounded-lg cursor-pointer ${
                            currentPage === page
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === favoritesPagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
