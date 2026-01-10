import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ArrowLeft, CreditCard, User } from "lucide-react";
import apiClient from '../utils/axiosConfig';
import { orderCreateRequest } from '../redux/actions/orderActions';
import { cartClearRequest } from '../redux/actions/cartActions';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const fallback = (() => {
    try {
      return JSON.parse(localStorage.getItem('pendingCheckout')) || null;
    } catch {
      return null;
    }
  })();
  
  // ✅ LẤY THÔNG TIN TỪ PENDING CHECKOUT (chưa có order)
  const checkoutData = state || fallback;
  const amount = checkoutData?.totalPrice;
  const userId = checkoutData?.userId;
  const discount = checkoutData?.discount || 0;
  const subtotal = checkoutData?.subtotal;
  const isCodPayment = checkoutData?.isCodPayment || false; // ✅ Flag để xác định thanh toán COD
  
  // Redux state
  const { creating, currentOrder } = useSelector((state) => state.order || {});
  
  // ✅ Wrap items in useMemo to avoid re-creating array on every render
  const items = useState(() => checkoutData?.items || [])[0];
  
  const [loading, setLoading] = useState(false);
  
  // ✅ Pre-fill form với data từ CartPage
  const [formData, setFormData] = useState({
    fullName: checkoutData?.customerInfo?.fullName || '',
    phone: checkoutData?.customerInfo?.phone || '',
    address: checkoutData?.customerInfo?.address || '',
    note: ''
  });

  // Kiểm tra dữ liệu từ CartPage
  useEffect(() => {
    console.log('🔍 CheckoutPage - Received checkoutData:', checkoutData);
    if (!checkoutData || !amount || !userId || !items.length) {
      console.error('❌ CheckoutPage - Missing checkout data, redirecting to cart');
      toast.error('Thông tin giỏ hàng không hợp lệ. Vui lòng thử lại.');
      navigate('/customer/cart');
    }
  }, [checkoutData, amount, userId, items, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Xử lý thanh toán COD (Mua trước trả sau)
  const handleCodPayment = async () => {
    // Validate form
    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ');
      return;
    }
    
    try {
      setLoading(true);
      
      // ✅ TẠO ORDER TRỰC TIẾP với paymentMethod = 'cod'
      const orderData = {
        userId,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        receiverName: formData.fullName.trim(),
        receiverPhone: formData.phone.trim(),
        receiverAddress: formData.address.trim(),
        paymentMethod: 'cod', // ✅ COD payment
        note: formData.note.trim(),
        shippingFee: 0,
        discount,
        subtotal,
        totalPrice: amount
      };
      
      console.log('💾 Creating COD order with data:', orderData);
      
      // Dispatch action để tạo order
      dispatch(orderCreateRequest(orderData));
      
      // Chờ order được tạo (sẽ được xử lý trong useEffect)
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo đơn hàng';
      toast.error(errorMessage);
      console.error('❌ COD order error:', error);
      setLoading(false);
    }
  };

  // ✅ Xử lý thanh toán VNPay
  const handleVnpayPayment = async () => {
    // Validate form
    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ');
      return;
    }
    
    try {
      setLoading(true);
      
      // ✅ LƯU THÔNG TIN ĐẦY ĐỦ VÀO LOCALSTORAGE để tạo order sau khi thanh toán thành công
      const orderData = {
        userId,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        receiverName: formData.fullName.trim(),
        receiverPhone: formData.phone.trim(),
        receiverAddress: formData.address.trim(),
        paymentMethod: 'vnpay',
        note: formData.note.trim(),
        shippingFee: 0,
        discount,
        subtotal,
        totalPrice: amount
      };
      
      console.log('💾 Saving order data for post-payment creation:', orderData);
      localStorage.setItem('pendingOrderData', JSON.stringify(orderData));
      
      // ✅ TẠO PAYMENT URL (KHÔNG TẠO ORDER)
      // Sử dụng timestamp làm txnRef tạm thời
      const tempTxnRef = `TEMP_${Date.now()}`;
      
      const { data } = await apiClient.post('/payment/vnpay/create', {
        txnRef: tempTxnRef,  // ✅ Backend nhận txnRef thay vì orderId
        amount: amount,
        bankCode: undefined,
        orderData: orderData // ✅ Gửi kèm orderData (optional, để backend log)
      });
      
      if (data.status === 'OK' && data.data.paymentUrl) {
        console.log('✅ Payment URL created, redirecting to VNPay...');
        window.location.href = data.data.paymentUrl;
      } else {
        throw new Error(data.message || 'Không thể tạo URL thanh toán');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo thanh toán';
      toast.error(errorMessage);
      console.error('❌ Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Wrapper function để gọi đúng handler
  const handlePayment = () => {
    if (isCodPayment) {
      handleCodPayment();
    } else {
      handleVnpayPayment();
    }
  };

  // ✅ Xử lý khi order COD được tạo thành công
  useEffect(() => {
    if (currentOrder && !creating && isCodPayment) {
      console.log('✅ COD order created successfully:', currentOrder);
      
      // Xóa giỏ hàng sau khi tạo order thành công
      dispatch(cartClearRequest());
      
      // Xóa pending data
      localStorage.removeItem('pendingCheckout');
      
      // Navigate đến trang OrderHistory
      toast.success('Đơn hàng đã được tạo thành công!');
      navigate('/customer/orders', {
        state: { order: currentOrder, fromCod: true }
      });
    }
  }, [currentOrder, creating, isCodPayment, dispatch, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/customer/cart')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại giỏ hàng
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-2">Hoàn tất đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Thông tin giao hàng */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Thông tin giao hàng</h2>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ giao hàng"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </form>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Tóm tắt đơn hàng</h2>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Số lượng sản phẩm:</span>
                <span className="font-medium">{items.length} sản phẩm</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span className="font-medium">-{formatPrice(discount)}</span>
                </div>
              )}
              
              <div className="border-t pt-4 flex justify-between">
                <span className="text-lg font-bold text-gray-900">Tổng tiền:</span>
                <span className="text-2xl font-bold text-red-600">
                  {formatPrice(amount)}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <button
                onClick={handlePayment}
                disabled={loading || creating}
                className={`w-full py-4 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  isCodPayment 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {(loading || creating) ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {isCodPayment ? 'Đang tạo đơn hàng...' : 'Đang xử lý...'}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {isCodPayment ? 'Đặt hàng (Trả sau)' : 'Thanh toán VNPay'}
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                {isCodPayment 
                  ? 'Đơn hàng sẽ được tạo và bạn sẽ thanh toán khi nhận hàng'
                  : 'Bạn sẽ được chuyển hướng đến trang thanh toán VNPay'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
