import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Loading from '../../components/Loading/Loading';
import { getPublicCategoriesRequest } from '../../redux/actions/publicCategoryActions';
import { Search, Grid } from 'lucide-react';

export default function Categories() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    publicCategories, 
    publicCategoriesPagination, 
    publicCategoriesLoading 
  } = useSelector((state) => state.publicCategory);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch categories
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 6,
      search: searchTerm || undefined,
    };
    dispatch(getPublicCategoriesRequest(params));
  }, [dispatch, currentPage, searchTerm]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Handle category click - navigate to products page with category filter
  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Categories
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Explore a variety of organic agricultural product categories, from fresh vegetables to naturally sweet fruits
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search by category name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </form>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {publicCategoriesLoading ? (
            <div className="flex justify-center py-12">
              <Loading message="Loading categories..." />
            </div>
          ) : publicCategories.length === 0 ? (
            <div className="text-center py-12">
              <Grid className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No categories found</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-gray-600">
                  Showing{' '}
                  <span className="font-semibold">
                    {publicCategoriesPagination
                      ? publicCategoriesPagination.page * publicCategoriesPagination.limit -
                        publicCategoriesPagination.limit +
                        1
                      : 0}{' '}
                    -{' '}
                    {publicCategoriesPagination
                      ? Math.min(
                          publicCategoriesPagination.page * publicCategoriesPagination.limit,
                          publicCategoriesPagination.total
                        )
                      : 0}{' '}
                    of {publicCategoriesPagination?.total || 0} categories
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publicCategories.map((category) => (
                  <div
                    key={category._id}
                    onClick={() => handleCategoryClick(category._id)}
                    className="group relative bg-white rounded-3xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  >
                    {/* Category Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={category.image || 'https://via.placeholder.com/400x400?text=No+Image'}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    </div>

                    {/* Category Info */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      )}

                      <div className="flex items-center text-gray-900 font-semibold group-hover:text-green-600 transition-colors">
                        <span>Explore now</span>
                        <i className="ri-arrow-right-line ml-2 group-hover:translate-x-2 transition-transform"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {publicCategoriesPagination && publicCategoriesPagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  {[...Array(publicCategoriesPagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === publicCategoriesPagination.totalPages ||
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
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === publicCategoriesPagination.totalPages}
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-green-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Can't Find the Product You Need?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Contact us for consultation and special product orders
          </p>
          <button
            onClick={() => navigate('/customer/contact')}
            className="inline-block bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            Contact Us
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
