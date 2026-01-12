import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  getCategoriesRequest,
  createContactRequest,
  clearContactMessages,
} from '../../redux/actions/contactActions';

const ContactPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ================= AUTH CHECK (FIX REFRESH BUG) ================= */
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     navigate('/login');
  //   }
  // }, [navigate]);

  /* ================= REDUX STATE ================= */
  const {
    categories = [],
    createContactLoading,
    createContactSuccess,
    createContactMessage,
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
    dispatch(getCategoriesRequest());
  }, [dispatch]);

  /* ================= HANDLE SUCCESS ================= */
  useEffect(() => {
    if (createContactSuccess && createContactMessage) {
      toast.success(createContactMessage);

      setFormData({ subject: '', category: '', message: '' });
      setFiles([]);
      setErrors({});

      setTimeout(() => {
        navigate('/contact/history'); // ✅ FIX PATH
        dispatch(clearContactMessages());
      }, 1500);
    }
  }, [createContactSuccess, createContactMessage, navigate, dispatch]);

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      dispatch(clearContactMessages());
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
      toast.error(`Chỉ được upload tối đa ${maxFiles} file`);
      return;
    }

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        toast.error('File không hợp lệ');
        return;
      }
      if (file.size > maxSize) {
        toast.error('File vượt quá 5MB');
        return;
      }
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim() || formData.subject.length < 5) {
      newErrors.subject = 'Tiêu đề phải có ít nhất 5 ký tự';
    }

    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }

    if (!formData.message.trim() || formData.message.length < 10) {
      newErrors.message = 'Nội dung phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(
      createContactRequest({
        subject: formData.subject.trim(),
        category: formData.category,
        message: formData.message.trim(),
        files,
      })
    );
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Liên hệ với chúng tôi
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div>
            <label className="font-semibold">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="w-full mt-2 p-3 border rounded-lg"
            />
            {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="font-semibold">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full mt-2 p-3 border rounded-lg"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.value || cat} value={cat.value || cat}>
                  {cat.label || cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
          </div>

          {/* Message */}
          <div>
            <label className="font-semibold">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="w-full mt-2 p-3 border rounded-lg"
            />
            {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
          </div>

          {/* Files */}
          <div>
            <label className="font-semibold">Tệp đính kèm</label>
            <input type="file" multiple onChange={handleFileChange} />
            {files.map((f, i) => (
              <div key={i} className="text-sm flex justify-between">
                {f.name}
                <button type="button" onClick={() => removeFile(i)} className="text-red-500">
                  X
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={createContactLoading}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
          >
            {createContactLoading ? 'Đang gửi...' : 'Gửi liên hệ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
