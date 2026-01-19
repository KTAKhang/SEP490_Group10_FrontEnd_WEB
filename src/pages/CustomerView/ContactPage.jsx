import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { MessageSquare, Paperclip, X, Send, AlertCircle } from 'lucide-react';
import {
  contactGetCategoriesRequest,
  contactCreateContactRequest,
  contactClearMessages,
} from '../../redux/actions/contactActions';

const ContactPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ================= REDUX STATE ================= */
  const {
    categories = [],
    createContactLoading,
    createContactSuccess,
    createContactMessage,
    createContactError,
  } = useSelector((state) => state.contact || {});

  /* ================= LOCAL STATE ================= */
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: '',
  });

  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    dispatch(contactGetCategoriesRequest());
  }, [dispatch]);

  /* ================= HANDLE SUCCESS ================= */
  useEffect(() => {
    if (createContactSuccess && createContactMessage) {
      setFormData({ subject: '', category: '', message: '' });
      setFiles([]);
      setErrors({});

      setTimeout(() => {
        navigate('/customer/contact-history');
        dispatch(contactClearMessages());
      }, 1500);
    }
  }, [createContactSuccess, createContactMessage, navigate, dispatch]);

  /* ================= HANDLE ERROR ================= */
  useEffect(() => {
    if (createContactError) {
      dispatch(contactClearMessages());
    }
  }, [createContactError, dispatch]);

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      dispatch(contactClearMessages());
    };
  }, [dispatch]);

  /* ================= HANDLERS ================= */
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024;

    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type');
        return;
      }
      if (file.size > maxSize) {
        toast.error('File exceeds 5MB');
        return;
      }
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    } else if (formData.subject.trim().length > 200) {
      newErrors.subject = 'Subject cannot exceed 200 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(
      contactCreateContactRequest({
        subject: formData.subject.trim(),
        category: formData.category,
        message: formData.message.trim(),
        files,
      })
    );
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Contact Us
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            We are always ready to listen and support you
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
                  errors.subject ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Enter your contact subject"
              />
              {errors.subject && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.subject}
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition cursor-pointer ${
                  errors.category ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <option value="">-- Select category --</option>
                {categories.map((cat) => (
                  <option key={cat.value || cat} value={cat.value || cat}>
                    {cat.label || cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.category}
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none ${
                  errors.message ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Enter detailed information about your issue..."
              />
              {errors.message && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.message}
                </div>
              )}
            </div>

            {/* Files */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Paperclip className="inline w-4 h-4 mr-1" />
                Attachments <span className="text-gray-500 font-normal text-xs">(max 5 files, 5MB each)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 hover:bg-green-50/50 transition cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Paperclip className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to select files or drag and drop here
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    Supported: JPG, PNG, GIF, PDF, DOC, DOCX, TXT
                  </span>
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded transition flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={createContactLoading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition flex items-center justify-center space-x-2 ${
                createContactLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {createContactLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {files.length > 0 ? 'Uploading attachments...' : 'Sending...'}
                  </span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Contact</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
