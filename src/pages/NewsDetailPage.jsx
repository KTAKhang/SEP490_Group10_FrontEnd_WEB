import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Eye, User, ArrowLeft } from 'lucide-react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import CommentSection from '../components/Comments/CommentSection';
import { newsGetNewsByIdRequest } from '../redux/actions/newsActions';

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { newsDetail, newsDetailLoading, newsDetailError } = useSelector(
    (state) => state.news || {}
  );

  useEffect(() => {
    if (id) {
      // Load news with public endpoint to track views
      dispatch(newsGetNewsByIdRequest({ newsId: id, isPublic: true }));
    }
  }, [dispatch, id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (newsDetailLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading news...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (newsDetailError || !newsDetail) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">
              {newsDetailError || 'News not found'}
            </p>
            <Link
              to="/news"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to News
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <section className="pt-24 pb-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link to="/news" className="hover:text-green-600">News</Link>
            <span>/</span>
            <span className="text-gray-900">{newsDetail.title}</span>
          </div>
        </div>
      </section>

      {/* News Content */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-green-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              {newsDetail.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>{newsDetail.author_id?.user_name || 'Admin'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(newsDetail.published_at)}</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                <span>{newsDetail.view_count || 0} views</span>
              </div>
              {newsDetail.is_featured && (
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          {newsDetail.thumbnail_url && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={newsDetail.thumbnail_url}
                alt={newsDetail.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {newsDetail.excerpt && (
            <div className="mb-8 p-6 bg-green-50 rounded-xl border-l-4 border-green-600">
              <p className="text-lg text-gray-700 italic">{newsDetail.excerpt}</p>
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: newsDetail.content }}
            style={{
              lineHeight: '1.8',
            }}
          />

          {/* Footer Actions */}
          <div className="border-t border-gray-200 pt-8 mt-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to News
            </button>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <CommentSection newsId={id} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsDetailPage;
