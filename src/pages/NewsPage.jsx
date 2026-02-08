import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Calendar, Eye, User, Search, Star } from 'lucide-react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import {
  newsGetNewsRequest,
  newsGetFeaturedRequest,
} from '../redux/actions/newsActions';

const NewsPage = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    newsList,
    newsListLoading,
    newsPagination,
    featuredNews,
    featuredNewsLoading,
  } = useSelector((state) => state.news || {});

  useEffect(() => {
    // Load featured news
    dispatch(newsGetFeaturedRequest());
    // Load news list
    dispatch(newsGetNewsRequest({ public: true, page: currentPage, limit: 12 }));
  }, [dispatch, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(newsGetNewsRequest({ 
      public: true, 
      page: 1, 
      limit: 12,
      search: searchTerm.trim() || undefined,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const stripHTML = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              News & Updates
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Stay updated with the latest news, tips, and updates from our organic farm
            </p>
          </div>
        </div>
      </section>

      {/* Featured News Section */}
      {featuredNews && featuredNews.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-8">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                Featured News
              </h2>
            </div>
            {featuredNewsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredNews.filter(news => news.status === 'PUBLISHED').map((news) => (
                  <Link
                    key={news._id}
                    to={`/news/${news._id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={news.thumbnail_url || '/placeholder-news.jpg'}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {news.excerpt || stripHTML(news.content).substring(0, 100)}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(news.published_at)}
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {news.view_count || 0}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* All News Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              All News
            </h2>
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search news..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 cursor-default"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {newsListLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : newsList && newsList.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {newsList.filter(news => news.status === 'PUBLISHED').map((news) => (
                  <Link
                    key={news._id}
                    to={`/news/${news._id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={news.thumbnail_url || '/placeholder-news.jpg'}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {news.excerpt || stripHTML(news.content).substring(0, 150)}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {news.author_id?.user_name || 'Admin'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(news.published_at)}
                        </div>
                      </div>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Eye className="w-4 h-4 mr-1" />
                        {news.view_count || 0} views
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {newsPagination && newsPagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {currentPage} of {newsPagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(newsPagination.totalPages, prev + 1))}
                    disabled={currentPage === newsPagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No news found</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsPage;
