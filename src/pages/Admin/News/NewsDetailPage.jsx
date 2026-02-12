import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar,
  Eye,
  User,
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Clock,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import {
  newsGetNewsByIdRequest,
  newsDeleteNewsRequest,
  newsClearMessages,
} from '../../../redux/actions/newsActions';
import { toast } from 'react-toastify';
import AdminCommentSection from '../../../components/Comments/AdminCommentSection';

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    newsDetail,
    newsDetailLoading,
    newsDetailError,
    deleteNewsLoading,
    deleteNewsSuccess,
    deleteNewsError,
  } = useSelector((state) => state.news || {});

  useEffect(() => {
    if (id) {
      // Load news with authenticated endpoint (no view tracking for admin)
      dispatch(newsGetNewsByIdRequest(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (deleteNewsSuccess) {
      toast.success('News deleted successfully!');
      dispatch(newsClearMessages());
      navigate('/admin/news');
    }
    if (deleteNewsError) {
      // Lỗi đã được saga hiển thị toast, chỉ clear state
      dispatch(newsClearMessages());
    }
  }, [deleteNewsSuccess, deleteNewsError, dispatch, navigate]);

  const handleDelete = () => {
    if (newsDetail?.status === 'PUBLISHED') {
      toast.error('Cannot delete published news. Please change status to DRAFT first.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${newsDetail?.title}"?`)) {
      dispatch(newsDeleteNewsRequest(id));
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const stripHTML = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (newsDetailLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading news details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (newsDetailError || !newsDetail) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">
              {newsDetailError || 'News not found'}
            </p>
            <Link
              to="/admin/news"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to News List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/news"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">News Details</h1>
              <p className="text-gray-600 mt-1">View and manage news article</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to={`/news/${newsDetail._id}`}
              target="_blank"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Public Page
            </Link>
            <Link
              to={`/admin/news/edit/${newsDetail._id}`}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteNewsLoading || newsDetail.status === 'PUBLISHED'}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex-1">{newsDetail.title}</h2>
              <div className="flex items-center space-x-2 ml-4">
                {newsDetail.status === 'PUBLISHED' ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Published
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold flex items-center">
                    <XCircle className="w-3 h-3 mr-1" />
                    Draft
                  </span>
                )}
                {newsDetail.is_featured && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </span>
                )}
              </div>
            </div>
            {newsDetail.excerpt && (
              <p className="text-gray-600 italic border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded">
                {newsDetail.excerpt}
              </p>
            )}
          </div>

          {/* Thumbnail */}
          {newsDetail.thumbnail_url && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Thumbnail
                </h3>
              </div>
              <div className="p-4">
                <img
                  src={newsDetail.thumbnail_url}
                  alt={newsDetail.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Content
            </h3>
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: newsDetail.content }}
              style={{
                lineHeight: '1.8',
              }}
            />
          </div>
        </div>

        {/* Sidebar - Information */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Author</label>
                <div className="flex items-center mt-1 text-gray-900">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{newsDetail.author_id?.user_name || 'N/A'}</span>
                </div>
                {newsDetail.author_id?.email && (
                  <p className="text-sm text-gray-500 ml-6 mt-1">{newsDetail.author_id.email}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  {newsDetail.status === 'PUBLISHED' ? (
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                      <XCircle className="w-4 h-4 mr-1" />
                      Draft
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Featured</label>
                <div className="mt-1">
                  {newsDetail.is_featured ? (
                    <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                      <Star className="w-4 h-4 mr-1" />
                      Yes
                    </span>
                  ) : (
                    <span className="text-gray-600 text-sm">No</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Total Views</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{newsDetail.view_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Timeline
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <div className="flex items-center mt-1 text-gray-900">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">
                    {formatDateTime(newsDetail.created_at || newsDetail.createdAt)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Updated At</label>
                <div className="flex items-center mt-1 text-gray-900">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">
                    {formatDateTime(newsDetail.updated_at || newsDetail.updatedAt)}
                  </span>
                </div>
              </div>

              {(newsDetail.published_at || newsDetail.publishedAt) && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Published At</label>
                  <div className="flex items-center mt-1 text-gray-900">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">
                      {formatDateTime(newsDetail.published_at || newsDetail.publishedAt)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Title Length</span>
                <span className="text-sm font-medium text-gray-900">{newsDetail.title?.length || 0} chars</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Excerpt Length</span>
                <span className="text-sm font-medium text-gray-900">{newsDetail.excerpt?.length || 0} chars</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Content Length</span>
                <span className="text-sm font-medium text-gray-900">
                  {stripHTML(newsDetail.content || '').length} chars
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Content Words</span>
                <span className="text-sm font-medium text-gray-900">
                  {stripHTML(newsDetail.content || '').split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section - Admin View */}
      <div className="mt-8">
        <AdminCommentSection newsId={id} />
      </div>
    </div>
  );
};

export default NewsDetailPage;
