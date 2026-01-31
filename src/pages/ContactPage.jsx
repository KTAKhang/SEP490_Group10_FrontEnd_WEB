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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              We are always ready to listen and support you. Please leave your information, and we will respond as soon as possible!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-xl mb-4">
                  <span className="text-2xl">{info.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                {info.link ? (
                  <a
                    href={info.link}
                    target={info.link.startsWith('http') ? '_blank' : undefined}
                    rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-gray-600 hover:text-green-600 transition-colors"
                  >
                    {info.content}
                  </a>
                ) : (
                  <p className="text-gray-600">{info.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                Send Us a Message
              </h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below, and we will get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm ${
                      errors.subject ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
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
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm cursor-pointer ${
                      errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
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
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 resize-none text-sm ${
                      errors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter detailed information about your issue..."
                  ></textarea>
                  {errors.message && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.message}
                    </div>
                  )}
                </div>

                {/* Files */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
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

                {createContactSuccess && createContactMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">✓</span>
                      <span className="font-medium">{createContactMessage}</span>
                    </div>
                  </div>
                )}

                {createContactError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">⚠</span>
                      <span className="font-medium">{createContactError}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createContactLoading}
                  className="w-full bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {createContactLoading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{files.length > 0 ? 'Uploading attachments...' : 'Sending...'}</span>
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>

            {/* Map */}
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                Our Location
              </h2>
              <p className="text-gray-600 mb-8">
                Visit our store to experience fresh organic agricultural products firsthand.
              </p>

              <div className="rounded-2xl overflow-hidden shadow-lg h-[500px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.0532902991586!2d105.72985667569752!3d10.012457072818897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0882139720a77%3A0x3916a227d0b95a64!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgQ-G6p24gVGjGoQ!5e0!3m2!1sen!2s!4v1768101333349!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Vị trí cửa hàng"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-green-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Connect with Us on Social Media
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Follow us on social media to stay updated with the latest news and offers
          </p>
          <div className="flex justify-center space-x-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Facebook"
            >
              <span className="text-2xl">f</span>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Instagram"
            >
              <span className="text-2xl">📷</span>
            </a>
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Zalo"
            >
              <span className="text-2xl">💬</span>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="YouTube"
            >
              <span className="text-2xl">▶️</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
