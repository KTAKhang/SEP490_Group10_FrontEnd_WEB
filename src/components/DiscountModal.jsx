import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Calendar, Percent, DollarSign, Save, Eye } from 'lucide-react';
import {
  discountCreateRequest,
  discountUpdateRequest,
  discountClearMessages,
} from '@/redux/actions/discountActions';

const DiscountModal = ({ isOpen, onClose, discount, isViewMode, onSuccess }) => {
  const dispatch = useDispatch();
  const { creating, updating, error, success } = useSelector((state) => state.discount);

  const [formData, setFormData] = useState({
    code: '',
    discountPercent: '',
    minOrderValue: '',
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (discount) {
      setFormData({
        code: discount.code || '',
        discountPercent: discount.discountPercent || '',
        minOrderValue: discount.minOrderValue || '',
        maxDiscountAmount: discount.maxDiscountAmount || '',
        startDate: discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '',
        endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        code: '',
        discountPercent: '',
        minOrderValue: '',
        maxDiscountAmount: '',
        startDate: '',
        endDate: '',
      });
    }
    setErrors({});
  }, [discount]);

  useEffect(() => {
    if (success) {
      onSuccess();
    }
  }, [success, onSuccess]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Mã giảm giá là bắt buộc';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Mã giảm giá phải có ít nhất 3 ký tự';
    }

    if (!formData.discountPercent) {
      newErrors.discountPercent = 'Phần trăm giảm giá là bắt buộc';
    } else if (formData.discountPercent < 1 || formData.discountPercent > 100) {
      newErrors.discountPercent = 'Phần trăm giảm giá phải từ 1% đến 100%';
    }

    if (!formData.minOrderValue) {
      newErrors.minOrderValue = 'Đơn hàng tối thiểu là bắt buộc';
    } else if (formData.minOrderValue < 0) {
      newErrors.minOrderValue = 'Đơn hàng tối thiểu không được âm';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc là bắt buộc';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate >= endDate) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const payload = {
      code: formData.code.toUpperCase().trim(),
      discountPercent: Number(formData.discountPercent),
      minOrderValue: Number(formData.minOrderValue),
      maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };

    if (discount) {
      dispatch(discountUpdateRequest(discount._id, payload));
    } else {
      dispatch(discountCreateRequest(payload));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  if (!isOpen) return null;

  return (
    // hiển thị chi tiết mã giảm giá hoặc form tạo/chỉnh sửa mã giảm giá
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isViewMode ? 'Chi tiết mã giảm giá' : discount ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isViewMode ? (
            // View Mode
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Percent className="w-5 h-5 text-green-500 mr-2" />
                    <span className="font-medium text-gray-900">Mã giảm giá</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{discount.code}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Percent className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="font-medium text-gray-900">Phần trăm giảm</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{discount.discountPercent}%</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-5 h-5 text-purple-500 mr-2" />
                    <span className="font-medium text-gray-900">Đơn hàng tối thiểu</span>
                  </div>
                  <p className="text-lg font-bold text-purple-600">{formatPrice(discount.minOrderValue)}</p>
                </div>

                {discount.maxDiscountAmount && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-5 h-5 text-red-500 mr-2" />
                      <span className="font-medium text-gray-900">Giới hạn giảm tối đa</span>
                    </div>
                    <p className="text-lg font-bold text-red-600">{formatPrice(discount.maxDiscountAmount)}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-orange-500 mr-2" />
                    <span className="font-medium text-gray-900">Trạng thái</span>
                  </div>
                  <p className={`text-lg font-bold ${discount.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {discount.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Thời gian áp dụng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Ngày bắt đầu</p>
                      <p className="text-lg font-bold text-blue-800">{formatDate(discount.startDate)}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">Ngày kết thúc</p>
                      <p className="text-lg font-bold text-red-800">{formatDate(discount.endDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit/Create Mode
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã giảm giá *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.code ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="VD: SALE20"
                    disabled={!!discount}
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phần trăm giảm giá (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.discountPercent ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="20"
                  />
                  {errors.discountPercent && <p className="text-red-500 text-sm mt-1">{errors.discountPercent}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đơn hàng tối thiểu (₫) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.minOrderValue ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="100000"
                  />
                  {errors.minOrderValue && <p className="text-red-500 text-sm mt-1">{errors.minOrderValue}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới hạn giảm tối đa (₫)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.maxDiscountAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="15000 (để trống = không giới hạn)"
                  />
                  {errors.maxDiscountAmount && <p className="text-red-500 text-sm mt-1">{errors.maxDiscountAmount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {creating || updating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {discount ? 'Đang cập nhật...' : 'Đang tạo...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {discount ? 'Cập nhật' : 'Tạo mã giảm giá'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscountModal;
