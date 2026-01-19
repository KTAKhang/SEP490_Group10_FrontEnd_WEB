import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Calendar, User, Filter } from 'lucide-react';
import {
  newsGetNewsRequest,
  newsDeleteNewsRequest,
  newsClearMessages,
} from '../../../redux/actions/newsActions';
import { toast } from 'react-toastify';

const NewsListPage = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    newsList,
    newsListLoading,
    newsPagination,
    deleteNewsSuccess,
    deleteNewsError,
  } = useSelector((state) => state.news || {});

  useEffect(() => {
    dispatch(newsGetNewsRequest({ page: currentPage, limit: 10, status: statusFilter || undefined, search: searchTerm || undefined }));
  }, [dispatch, currentPage, statusFilter]);

  useEffect(() => {
    if (deleteNewsSuccess) {
      dispatch(newsGetNewsRequest({ page: currentPage, limit: 10, status: statusFilter || undefined, search: searchTerm || undefined }));
      dispatch(newsClearMessages());
    }
    if (deleteNewsError) {
      dispatch(newsClearMessages());
    }
  }, [deleteNewsSuccess, deleteNewsError, dispatch, currentPage, statusFilter, searchTerm]);

  const handleDelete = (newsId, title, status) => {
    if (status === 'PUBLISHED') {
      toast.error('Cannot delete published news. Please change status to DRAFT first.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      dispatch(newsDeleteNewsRequest(newsId));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(newsGetNewsRequest({ 
      page: 1, 
      limit: 10,
      status: statusFilter || undefined,
      search: searchTerm.trim() || undefined,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'PUBLISHED') {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Published</span>;
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Draft</span>;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
          <Link
            to="/admin/news/create"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create News
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or excerpt..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* News Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {newsListLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : newsList && newsList.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {newsList.map((news) => (
                    <tr key={news._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {news.thumbnail_url && (
                            <img
                              src={news.thumbnail_url}
                              alt={news.title}
                              className="w-16 h-16 object-cover rounded-lg mr-4"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {news.title}
                            </div>
                            {news.excerpt && (
                              <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                                {news.excerpt.substring(0, 60)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {news.author_id?.user_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(news.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(news.published_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-2 text-gray-400" />
                          {news.view_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {news.is_featured ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/news/${news._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/news/edit/${news._id}`}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(news._id, news.title, news.status)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {newsPagination && newsPagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((newsPagination.page - 1) * newsPagination.limit) + 1} to{' '}
                  {Math.min(newsPagination.page * newsPagination.limit, newsPagination.total)} of{' '}
                  {newsPagination.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {currentPage} of {newsPagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(newsPagination.totalPages, prev + 1))}
                    disabled={currentPage === newsPagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No news found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsListPage;
