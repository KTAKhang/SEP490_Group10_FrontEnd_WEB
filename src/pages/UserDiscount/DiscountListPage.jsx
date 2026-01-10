import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Gift, Calendar, Percent, ChevronLeft, ChevronRight, Copy, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from '@/components/Header/Header';
import DiscountCard from '@/components/DiscountCard';
import {
  discountActiveRequest,
  discountClearMessages,
} from '@/redux/actions/discountActions';

const DiscountListPage = () => {
  const dispatch = useDispatch();
  const { activeItems, loadingActive, error } = useSelector((state) => state.discount);
  const [searchTerm, setSearchTerm] = useState('');

  // Carousel state
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [expiredCarouselIndex, setExpiredCarouselIndex] = useState(0);
  const itemsPerSlide = 4; // Hiển thị 4 mã mỗi slide

  useEffect(() => {
    dispatch(discountActiveRequest());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(discountClearMessages());
    }
  }, [error, dispatch]);

  const filteredDiscounts = activeItems.filter(discount =>
    discount.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // hàm phân loại mã giảm giá theo trạng thái đang hoạt động 
  const activeDiscounts = filteredDiscounts.filter(discount => {
    const now = new Date();
    return discount.isActive &&
      now >= new Date(discount.startDate) &&
      now <= new Date(discount.endDate);
  });
  // hàm phân loại mã giảm giá theo trạng thái đã hết hạn
  const expiredDiscounts = filteredDiscounts.filter(discount => {
    const now = new Date();
    return !discount.isActive || now > new Date(discount.endDate);
  });

  // Carousel chuyển đến slide tiếp theo
  const nextSlide = (type) => {
    if (type === 'active') {
      const maxIndex = Math.ceil(activeDiscounts.length / itemsPerSlide) - 1;
      setActiveCarouselIndex(prev => prev < maxIndex ? prev + 1 : 0);
    } else {
      const maxIndex = Math.ceil(expiredDiscounts.length / itemsPerSlide) - 1;
      setExpiredCarouselIndex(prev => prev < maxIndex ? prev + 1 : 0);
    }
  };
  // Carousel chuyển đến slide trước đó
  const prevSlide = (type) => {
    if (type === 'active') {
      const maxIndex = Math.ceil(activeDiscounts.length / itemsPerSlide) - 1;
      setActiveCarouselIndex(prev => prev > 0 ? prev - 1 : maxIndex);
    } else {
      const maxIndex = Math.ceil(expiredDiscounts.length / itemsPerSlide) - 1;
      setExpiredCarouselIndex(prev => prev > 0 ? prev - 1 : maxIndex);
    }
  };

  const getVisibleItems = (items, index) => {
    const start = index * itemsPerSlide;
    const end = start + itemsPerSlide;
    const visibleItems = items.slice(start, end);


    return visibleItems;
  };

  // Touch/Drag support
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [mouseStart, setMouseStart] = useState(null);
  const [mouseEnd, setMouseEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const minSwipeDistance = 50;

  // Touch events
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (type) => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;


    if (isLeftSwipe) {
      nextSlide(type);
    } else if (isRightSwipe) {
      prevSlide(type);
    }
  };

  // Mouse events for desktop drag
  const onMouseDown = (e) => {
    setIsDragging(true);
    setMouseEnd(null);
    setMouseStart(e.clientX);
    e.preventDefault();
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  const onMouseUp = (type) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (!mouseStart || !mouseEnd) return;

    const distance = mouseStart - mouseEnd;
    const isLeftDrag = distance > minSwipeDistance;
    const isRightDrag = distance < -minSwipeDistance;


    if (isLeftDrag) {
      nextSlide(type);
    } else if (isRightDrag) {
      prevSlide(type);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Gift className="w-12 h-12 text-blue-600 mr-4" />
              <h1 className="text-4xl font-bold text-gray-900">Mã giảm giá</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá các mã giảm giá hấp dẫn và tiết kiệm chi phí mua sắm của bạn
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm mã giảm giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Loading */}
          {loadingActive && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Đang tải mã giảm giá...</h3>
            </div>
          )}

          {/* Active Discounts */}
          {!loadingActive && activeDiscounts.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Percent className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Mã giảm giá đang hoạt động</h2>
                <span className="ml-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {activeDiscounts.length} mã
                </span>
              </div>

              {/* Carousel Container */}
              <div className="relative">
                {/* Previous Button */}
                {activeDiscounts.length > itemsPerSlide && (
                  <button
                    onClick={() => prevSlide('active')}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                    style={{ marginLeft: '-20px' }}
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                  </button>
                )}

                {/* Carousel Content */}
                <div
                  className="overflow-hidden cursor-grab active:cursor-grabbing"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={() => onTouchEnd('active')}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={() => onMouseUp('active')}
                  onMouseLeave={() => setIsDragging(false)}
                >
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{
                      transform: `translateX(-${activeCarouselIndex * 100}%)`,
                      width: `${Math.ceil(activeDiscounts.length / itemsPerSlide) * 100}%`
                    }}
                  >
                    {Array.from({ length: Math.ceil(activeDiscounts.length / itemsPerSlide) }, (_, slideIndex) => {
                      const visibleItems = getVisibleItems(activeDiscounts, slideIndex);

                      return (
                        <div key={slideIndex} className="w-full flex-shrink-0" style={{ width: '100%' }}>
                          <div
                            className="flex gap-12 px-16"
                            style={{
                              width: '100%',
                              justifyContent: 'flex-start'
                            }}
                          >
                            {visibleItems.map((discount) => (
                              <div key={discount._id} style={{ width: `${100 / itemsPerSlide}%`, minWidth: '200px', maxWidth: '300px', flexShrink: 0 }}>
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden h-full">
                                  {/* Header with code and copy button */}
                                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 text-white">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="text-base font-bold">{discount.code}</h3>
                                        <p className="text-blue-100 text-sm">Mã giảm giá</p>
                                      </div>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(discount.code);
                                          toast.success('Đã sao chép mã giảm giá!');
                                        }}
                                        className="bg-white bg-opacity-20 hover:bg-opacity-30 p-1 rounded-lg transition-colors"
                                        title="Sao chép mã"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Content */}
                                  <div className="p-3">
                                    {/* Discount percentage */}
                                    <div className="flex items-center mb-2">
                                      <div className="bg-green-100 p-1.5 rounded-lg mr-2">
                                        <Percent className="w-4 h-4 text-green-600" />
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">Giảm giá</p>
                                        <p className="text-xl font-bold text-green-600">{discount.discountPercent}%</p>
                                      </div>
                                    </div>

                                    {/* Minimum order value */}
                                    <div className="flex items-center mb-2">
                                      <div className="bg-blue-100 p-1.5 rounded-lg mr-2">
                                        <DollarSign className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">Tối thiểu</p>
                                        <p className="text-sm font-semibold text-blue-600">{new Intl.NumberFormat('vi-VN').format(discount.minOrderValue)}₫</p>
                                      </div>
                                    </div>

                                    {/* Maximum discount limit */}
                                    {discount.maxDiscountAmount && (
                                      <div className="flex items-center mb-2">
                                        <div className="bg-red-100 p-1.5 rounded-lg mr-2">
                                          <DollarSign className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">Tối đa</p>
                                          <p className="text-sm font-semibold text-red-600">{new Intl.NumberFormat('vi-VN').format(discount.maxDiscountAmount)}₫</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Validity period */}
                                    <div className="space-y-1 mb-2">
                                      <div className="flex items-center">
                                        <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                                        <div>
                                          <p className="text-sm text-gray-600">Từ</p>
                                          <p className="text-sm font-medium text-gray-900">{new Date(discount.startDate).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center">
                                        <Clock className="w-3 h-3 text-gray-400 mr-1" />
                                        <div>
                                          <p className="text-sm text-gray-600">Đến</p>
                                          <p className="text-sm font-medium text-gray-900">{new Date(discount.endDate).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                      <div className="flex items-center">
                                        <CheckCircle className={`w-3 h-3 mr-1 ${discount.isActive ? 'text-green-500' : 'text-gray-400'}`} />
                                        <span className={`text-sm font-medium px-2 py-1 rounded-full border ${discount.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                          {discount.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {/* Fill empty slots ifee nded */}
                            {Array.from({ length: itemsPerSlide - visibleItems.length }, (_, index) => (
                              <div key={`empty-${index}`} style={{ width: `${100 / itemsPerSlide}%`, minWidth: '200px', maxWidth: '300px', flexShrink: 0 }}></div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next Button */}
                {activeDiscounts.length > itemsPerSlide && (
                  <button
                    onClick={() => nextSlide('active')}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                    style={{ marginRight: '-20px' }}
                  >
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                  </button>
                )}
              </div>

              {/* Carousel điều hướng giữa các slide */}
              {activeDiscounts.length > itemsPerSlide && (
                <div className="flex justify-center mt-6 space-x-2">
                  {Array.from({ length: Math.ceil(activeDiscounts.length / itemsPerSlide) }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveCarouselIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${index === activeCarouselIndex ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {/*không có kết quả, hiển thị khi không tìm được mã giảm giá */}
          {!loadingActive && filteredDiscounts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm ? 'Không tìm thấy mã giảm giá' : 'Chưa có mã giảm giá nào'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Các mã giảm giá sẽ được cập nhật sớm'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}

          {/* hướng dẫn sử dụng mã giảm giá */}
          <div className="bg-blue-50 rounded-xl p-8 mt-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Cách sử dụng mã giảm giá</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-white p-6 rounded-lg">
                  <div className="text-blue-600 text-3xl mb-3">1️⃣</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Chọn mã giảm giá</h4>
                  <p className="text-gray-600 text-sm">
                    Sao chép mã giảm giá phù hợp với đơn hàng của bạn
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg">
                  <div className="text-blue-600 text-3xl mb-3">2️⃣</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Thêm vào giỏ hàng</h4>
                  <p className="text-gray-600 text-sm">
                    Nhập mã vào ô "Mã giảm giá" trong trang giỏ hàng
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg">
                  <div className="text-blue-600 text-3xl mb-3">3️⃣</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Áp dụng và thanh toán</h4>
                  <p className="text-gray-600 text-sm">
                    Nhấn "Áp dụng" để giảm giá và hoàn tất đơn hàng
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DiscountListPage;
