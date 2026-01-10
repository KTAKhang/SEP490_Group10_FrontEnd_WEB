import React from 'react';
import { Copy, Percent, DollarSign, Calendar, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const DiscountCard = ({ discount }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const isActive = () => {
    const now = new Date();
    return discount.isActive && 
           now >= new Date(discount.startDate) && 
           now <= new Date(discount.endDate);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(discount.code);
    toast.success('Đã sao chép mã giảm giá!', {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const getStatusColor = () => {
    if (isActive()) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getStatusText = () => {
    if (isActive()) {
      return 'Đang hoạt động';
    }
    return 'Không hoạt động';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header with code and copy button */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{discount.code}</h3>
            <p className="text-blue-100 text-sm">Mã giảm giá</p>
          </div>
          <button
            onClick={handleCopyCode}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
            title="Sao chép mã"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Discount percentage */}
        <div className="flex items-center mb-4">
          <div className="bg-green-100 p-3 rounded-lg mr-4">
            <Percent className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Giảm giá</p>
            <p className="text-2xl font-bold text-green-600">{discount.discountPercent}%</p>
          </div>
        </div>

        {/* Minimum order value */}
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Đơn hàng tối thiểu</p>
            <p className="text-lg font-semibold text-blue-600">{formatPrice(discount.minOrderValue)}</p>
          </div>
        </div>

        {discount.maxDiscountAmount && (
          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-3 rounded-lg mr-4">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Giới hạn giảm tối đa</p>
              <p className="text-lg font-semibold text-red-600">{formatPrice(discount.maxDiscountAmount)}</p>
            </div>
          </div>
        )}

        {/* Validity period */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Ngày bắt đầu</p>
              <p className="font-medium text-gray-900">{formatDate(discount.startDate)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Ngày kết thúc</p>
              <p className="font-medium text-gray-900">{formatDate(discount.endDate)}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <CheckCircle className={`w-4 h-4 mr-2 ${isActive() ? 'text-green-500' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium px-2 py-1 rounded-full border ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      {/* Footer with usage info */}
      <div className="bg-gray-50 px-6 py-3">
        <p className="text-xs text-gray-500 text-center">
          Áp dụng cho đơn hàng từ {formatPrice(discount.minOrderValue)} trở lên
        </p>
      </div>
    </div>
  );
};

export default DiscountCard;
