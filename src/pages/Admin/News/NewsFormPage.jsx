import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, AlertCircle } from 'lucide-react';
import CustomCKEditor from '../../../components/CustomCKEditor/CustomCKEditor';
import {
  newsCreateNewsRequest,
  newsUpdateNewsRequest,
  newsGetNewsByIdRequest,
  newsClearMessages,
} from '../../../redux/actions/newsActions';
import { toast } from 'react-toastify';

// Custom Upload Adapter để xử lý response format từ backend
class Adapter {
  constructor(loader, editor) {
    this.loader = loader;
    this.editor = editor;
  }

  upload() {
    return this.loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          const token = localStorage.getItem('token');
          const uploadFormData = new FormData();
          uploadFormData.append('image', file);

          fetch('http://localhost:3001/news/upload-content-image', {
            method: 'POST',
            headers: {
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: uploadFormData,
            credentials: 'include'
          })
            .then((response) => response.json())
            .then((data) => {
              // Backend trả về: { status: "OK", data: { url: "...", publicId: "..." } }
              // CKEditor cần: { url: "..." }
              if (data.status === 'OK' && data.data?.url) {
                resolve({ default: data.data.url });
              } else {
                reject(new Error(data.message || 'Upload failed'));
                toast.error(data.message || 'Failed to upload image');
              }
            })
            .catch((error) => {
              reject(error);
              toast.error('Failed to upload image: ' + error.message);
            });
        })
    );
  }

  abort() {
    // Handle abort if needed
  }
}

const NewsFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;

  const {
    newsDetail,
    newsDetailLoading,
    createNewsLoading,
    createNewsSuccess,
    createNewsError,
    updateNewsLoading,
    updateNewsSuccess,
    updateNewsError,
  } = useSelector((state) => state.news || {});

  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    thumbnail: null,
    thumbnailPreview: null,
    status: 'DRAFT',
    is_featured: false,
  });

  const [errors, setErrors] = useState({});

  // Load news data if editing
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(newsGetNewsByIdRequest(id));
    }
  }, [dispatch, id, isEditMode]);

  // Populate form when news detail is loaded
  useEffect(() => {
    if (isEditMode && newsDetail) {
      setFormData({
        title: newsDetail.title || '',
        excerpt: newsDetail.excerpt || '',
        content: newsDetail.content || '',
        thumbnail: null,
        thumbnailPreview: newsDetail.thumbnail_url || null,
        status: newsDetail.status || 'DRAFT',
        is_featured: newsDetail.is_featured || false,
      });
    }
  }, [newsDetail, isEditMode]);

  // Handle success
  useEffect(() => {
    if (createNewsSuccess || updateNewsSuccess) {
      toast.success(isEditMode ? 'News updated successfully!' : 'News created successfully!');
      dispatch(newsClearMessages());
      navigate('/admin/news');
    }
  }, [createNewsSuccess, updateNewsSuccess, dispatch, navigate, isEditMode]);

  // Handle errors
  useEffect(() => {
    if (createNewsError || updateNewsError) {
      dispatch(newsClearMessages());
    }
  }, [createNewsError, updateNewsError, dispatch]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP images are allowed');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => {
    setFormData((prev) => ({
      ...prev,
      thumbnail: null,
      thumbnailPreview: isEditMode ? newsDetail?.thumbnail_url : null,
    }));
  };

  // CKEditor configuration
  const getEditorConfig = () => {
    const token = localStorage.getItem('token');
    return {
      toolbar: [
        'heading', '|',
        'bold', 'italic', 'underline', 'strikethrough', '|',
        'link', 'blockQuote', 'insertTable', '|',
        'bulletedList', 'numberedList', '|',
        'outdent', 'indent', '|',
        'imageUpload', '|',
        'undo', 'redo'
      ],
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
          { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
          { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
        ]
      },
      simpleUpload: {
        uploadUrl: 'http://localhost:3001/news/upload-content-image',
        withCredentials: true,
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      },
      image: {
        toolbar: [
          'imageTextAlternative',
          'toggleImageCaption',
          'imageStyle:inline',
          'imageStyle:block',
          'imageStyle:side'
        ],
        // Tự động wrap ảnh trong paragraph để có thể căn giữa
        insert: {
          integrations: ['upload', 'url', 'assetManager']
        }
      },
      // Cho phép style text-align trong paragraph
      htmlSupport: {
        allow: [
          {
            name: /.*/,
            attributes: true,
            classes: true,
            styles: {
              'text-align': true
            }
          }
        ]
      }
    };
  };
    
  // Handle CKEditor change
  const handleEditorChange = (event, editor) => {
    const html = editor.getData();
    handleInputChange('content', html);
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation (10-200 characters)
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    // Excerpt validation (if provided, 50-500 characters)
    if (formData.excerpt && formData.excerpt.trim()) {
      if (formData.excerpt.trim().length < 50) {
        newErrors.excerpt = 'Excerpt must be at least 50 characters';
      } else if (formData.excerpt.trim().length > 500) {
        newErrors.excerpt = 'Excerpt cannot exceed 500 characters';
      }
    }

    // Content validation (minimum 100 characters)
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else {
      // Strip HTML tags to count actual text
      const textContent = formData.content.replace(/<[^>]*>/g, '').trim();
      if (textContent.length < 100) {
        newErrors.content = 'Content must be at least 100 characters (excluding HTML tags)';
      }
    }

    // Thumbnail validation (required for PUBLISHED)
    if (formData.status === 'PUBLISHED') {
      if (!formData.thumbnail && !formData.thumbnailPreview) {
        newErrors.thumbnail = 'Thumbnail is required for published news';
      }
    } else if (!isEditMode && !formData.thumbnail) {
      // For new drafts, thumbnail is optional but recommended
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const submitData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      excerpt: formData.excerpt.trim() || undefined,
      thumbnail: formData.thumbnail,
      status: formData.status,
      is_featured: formData.is_featured && formData.status === 'PUBLISHED' ? true : false,
    };

    if (isEditMode) {
      dispatch(newsUpdateNewsRequest(id, submitData));
    } else {
      dispatch(newsCreateNewsRequest(submitData));
    }
  };

  if (isEditMode && newsDetailLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading news...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/news')}
            className="flex items-center text-gray-600 hover:text-green-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to News List
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit News' : 'Create News'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Title <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal text-xs ml-2">
                ({formData.title.length}/200 characters, minimum 10)
              </span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter news title (10-200 characters)"
            />
            {errors.title && (
              <div className="flex items-center mt-1 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.title}
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Excerpt
              <span className="text-gray-500 font-normal text-xs ml-2">
                (Optional, 50-500 characters. Will be auto-generated if empty)
              </span>
            </label>
            <textarea
              rows={3}
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${
                errors.excerpt ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter a brief excerpt (optional)"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.excerpt.length}/500 characters
            </div>
            {errors.excerpt && (
              <div className="flex items-center mt-1 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.excerpt}
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
                Content <span className="text-red-500">*</span>
                <span className="text-gray-500 font-normal text-xs ml-2">
                (Rich text editor, minimum 100 characters)
                </span>
              </label>
            <div className={`border rounded-lg ${errors.content ? 'border-red-500' : 'border-gray-300'}`}>
              <CustomCKEditor
                config={getEditorConfig()}
                data={formData.content}
                onReady={(editor) => {
                  editorRef.current = editor;
                  
                  // Override SimpleUploadAdapter để xử lý response format từ backend
                  const fileRepository = editor.plugins.get('FileRepository');
                  if (fileRepository) {
                    fileRepository.createUploadAdapter = (loader) => {
                      return new Adapter(loader, editor);
                    };
                  }
                }}
                onChange={handleEditorChange}
                onError={(error, { willEditorRestart }) => {
                  console.error('CKEditor error:', error);
                  if (willEditorRestart) {
                    editorRef.current?.setData(formData.content);
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-xs text-gray-500">
                {formData.content.replace(/<[^>]*>/g, '').length} characters (excluding HTML tags)
              </div>
            </div>
            {errors.content && (
              <div className="flex items-center mt-1 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.content}
              </div>
            )}
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Thumbnail <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal text-xs ml-2">
                (JPG, PNG, WebP, max 5MB, required for PUBLISHED)
              </span>
            </label>
            {formData.thumbnailPreview ? (
              <div className="relative inline-block">
                <img
                  src={formData.thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-64 h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 hover:bg-green-50/50 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload thumbnail</span>
                  <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (max 5MB)</span>
                </label>
              </div>
            )}
            {errors.thumbnail && (
              <div className="flex items-center mt-1 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.thumbnail}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Published news will be visible to the public. Draft news is only visible to you.
            </p>
          </div>

          {/* Featured */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => handleInputChange('is_featured', e.target.checked)}
              disabled={formData.status !== 'PUBLISHED'}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor="is_featured" className="ml-2 text-sm font-medium text-gray-900">
              Mark as Featured
            </label>
            {formData.status !== 'PUBLISHED' && (
              <span className="ml-2 text-xs text-gray-500">
                (Only published news can be featured)
              </span>
            )}
          </div>

          {/* Error Messages */}
          {(createNewsError || updateNewsError) && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{createNewsError || updateNewsError}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/news')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createNewsLoading || updateNewsLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createNewsLoading || updateNewsLoading ? (
                <span className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                isEditMode ? 'Update News' : 'Create News'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsFormPage;
