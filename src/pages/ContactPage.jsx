import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Paperclip, X, AlertCircle } from 'lucide-react';
import Header from '../components/Header/Header';
import {
  contactGetCategoriesRequest,
  contactCreateContactRequest,
  contactClearMessages,
} from '../redux/actions/contactActions';
import { getShopInfoPublicRequest } from '../redux/actions/shopActions';

export default function Contact() {
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

  const { publicShopInfo } = useSelector((state) => state.shop || {});

  /* ================= LOCAL STATE ================= */
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: '',
  });

  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});

  /* ================= FETCH CATEGORIES & SHOP INFO ================= */
  useEffect(() => {
    dispatch(contactGetCategoriesRequest());
    // Load shop info for contact information
    if (!publicShopInfo) {
      dispatch(getShopInfoPublicRequest());
    }
  }, [dispatch, publicShopInfo]);

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

  // Build contact info from shop data
  const contactInfo = [
    {
      icon: '📍',
      title: 'Address',
      content: publicShopInfo?.address || '123 Nong Nghiep Street, District 1, Ho Chi Minh City',
      link: publicShopInfo?.address ? `https://maps.google.com/search?q=${encodeURIComponent(publicShopInfo.address)}` : 'https://maps.google.com'
    },
    {
      icon: '📞',
      title: 'Phone',
      content: publicShopInfo?.phone || '0123 456 789',
      link: publicShopInfo?.phone ? `tel:${publicShopInfo.phone.replace(/\s/g, '')}` : 'tel:0123456789'
    },
    {
      icon: '✉️',
      title: 'Email',
      content: publicShopInfo?.email || 'info@nongsansach.vn',
      link: publicShopInfo?.email ? `mailto:${publicShopInfo.email}` : 'mailto:info@nongsansach.vn'
    },
    {
      icon: '🕐',
      title: 'Working Hours',
      content: publicShopInfo?.workingHours || 'Monday - Sunday: 8:00 AM - 8:00 PM',
      link: null
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-10 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Contact
          </h1>
          <p className="text-gray-600">
            Send us a message and we will respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-10 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contact info strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-xl" aria-hidden>{info.icon}</span>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2 mb-1">{info.title}</h3>
                {info.link ? (
                  <a
                    href={info.link}
                    target={info.link.startsWith('http') ? '_blank' : undefined}
                    rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-sm text-gray-900 hover:text-green-600 transition-colors break-words line-clamp-2"
                  >
                    {info.content}
                  </a>
                ) : (
                  <p className="text-sm text-gray-900 break-words line-clamp-2">{info.content}</p>
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                Send Message
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Fill in the form below and submit; we will process and respond via email or in Contact History.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400 ${
                    errors.subject ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
                  }`}
                  placeholder="e.g. Bulk order, Order support..."
                />
                {errors.subject && (
                  <p className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white cursor-pointer ${
                    errors.category ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
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
                  <p className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={5}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 ${
                    errors.message ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Describe your issue or request in detail..."
                />
                {errors.message && (
                  <p className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Paperclip className="inline w-4 h-4 mr-1.5 align-middle" />
                  Attachments
                  <span className="text-gray-400 font-normal ml-1">(max 5 files, 5MB each)</span>
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-green-300 hover:bg-green-50/30 transition-colors cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">Choose files or drag and drop here</span>
                    <span className="block text-xs text-gray-400 mt-1">JPG, PNG, GIF, PDF, DOC, DOCX, TXT</span>
                  </label>
                </div>
                {files.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {files.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      >
                        <span className="truncate text-gray-700">{file.name}</span>
                        <span className="text-gray-400 flex-shrink-0">{formatFileSize(file.size)}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded flex-shrink-0"
                          aria-label="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {(createContactSuccess && createContactMessage) && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
                  <span className="text-green-600" aria-hidden>✓</span>
                  <span className="font-medium">{createContactMessage}</span>
                </div>
              )}

              {createContactError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{createContactError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={createContactLoading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {createContactLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {files.length > 0 ? 'Uploading files...' : 'Sending...'}
                  </span>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Social */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Connect with us
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Follow us for news and offers
          </p>
          <div className="flex justify-center gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors" aria-label="Facebook">
              <span className="text-lg font-semibold">f</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors" aria-label="Instagram">📷</a>
            <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors" aria-label="Zalo">💬</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors" aria-label="YouTube">▶️</a>
          </div>
        </div>
      </section>
    </div>
  );
}
