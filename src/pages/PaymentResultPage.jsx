import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { cartClearRequest } from '../redux/actions/cartActions';
import apiClient from '../utils/axiosConfig';

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);

  const handlePaymentResult = useCallback(async () => {
    try {
      setLoading(true);
      
      // Lấy thông tin từ URL params
      const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
      const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');
      const vnp_Amount = searchParams.get('vnp_Amount');
      const vnp_TxnRef = searchParams.get('vnp_TxnRef');
      
      console.log('🔍 VNPay callback params:', { 
        vnp_ResponseCode, 
        vnp_TransactionStatus, 
        vnp_Amount,
        vnp_TxnRef 
      });
      
      let result = {
        success: false,
        message: '',
        orderId: null,
        orderNumber: null,
        amount: vnp_Amount ? parseInt(vnp_Amount) / 100 : 0
      };
      
      if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
        // ✅ THANH TOÁN THÀNH CÔNG - TẠO ORDER
        console.log('✅ Payment successful, creating order...');
        
        // Lấy thông tin đơn hàng từ localStorage
        const pendingOrderData = JSON.parse(localStorage.getItem('pendingOrderData') || '{}');
        
        if (!pendingOrderData || !pendingOrderData.userId || !pendingOrderData.items) {
          throw new Error('Không tìm thấy thông tin đơn hàng. Vui lòng thử lại.');
        }
        
        console.log('📦 Creating order with data:', pendingOrderData);
        
        try {
          // ✅ Gọi API createOrderFromPayment với đầy đủ thông tin VNPay
          const orderPayload = {
            ...pendingOrderData,
            txnRef: vnp_TxnRef,
            vnpayData: {
              vnp_ResponseCode,
              vnp_TransactionStatus,
              vnp_Amount: parseInt(vnp_Amount) / 100
            }
          };
          
          console.log('📦 Creating order with payload:', orderPayload);
          
          const { data: orderResponse } = await apiClient.post('/payment/create-order', orderPayload);
          
          if (orderResponse.status === 'OK' && orderResponse.data) {
            console.log('✅ Order created successfully:', orderResponse.data);
            
            result.success = true;
            result.message = 'Thanh toán thành công! Đơn hàng đã được tạo.';
            result.orderId = orderResponse.data._id;
            result.orderNumber = orderResponse.data.orderNumber;
            result.amount = orderResponse.data.totalPrice;
            
            // Xóa giỏ hàng sau khi tạo order thành công
            dispatch(cartClearRequest());
            
            // Xóa thông tin pending
            localStorage.removeItem('pendingOrderData');
            localStorage.removeItem('pendingCheckout');
            
            toast.success('Thanh toán và tạo đơn hàng thành công!');
          } else {
            throw new Error(orderResponse.message || 'Không thể tạo đơn hàng');
          }
        } catch (orderError) {
          console.error('❌ Error creating order:', orderError);
          const errorMsg = orderError.response?.data?.message || orderError.message || 'Không thể tạo đơn hàng';
          
          result.success = false;
          result.message = `Thanh toán thành công nhưng không thể tạo đơn hàng: ${errorMsg}`;
          
          toast.error(result.message);
        }
      } else if (vnp_ResponseCode === '24') {
        // Người dùng hủy thanh toán
        result.success = false;
        result.message = 'Bạn đã hủy thanh toán. Vui lòng thử lại nếu muốn đặt hàng.';
        
        toast.warning('Bạn đã hủy thanh toán.');
      } else {
        // Thanh toán thất bại
        result.success = false;
        result.message = `Thanh toán thất bại (Mã lỗi: ${vnp_ResponseCode}). Vui lòng thử lại.`;
        
        toast.error('Thanh toán thất bại. Vui lòng thử lại.');
      }

      setPaymentResult(result);
    } catch (error) {
      console.error('❌ Error handling payment result:', error);
      const errorMsg = error.message || 'Có lỗi xảy ra khi xử lý kết quả thanh toán.';
      
      setPaymentResult({
        success: false,
        message: errorMsg,
        orderId: null,
        orderNumber: null,
        amount: 0
      });
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    handlePaymentResult();
  }, [handlePaymentResult]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className={`p-8 text-center ${paymentResult?.success ? 'bg-green-50' : 'bg-red-50'}`}>
            {paymentResult?.success ? (
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            )}
            
            <h1 className={`text-2xl font-bold mb-2 ${paymentResult?.success ? 'text-green-800' : 'text-red-800'}`}>
              {paymentResult?.success ? 'Thanh toán thành công!' : 'Thanh toán không thành công'}
            </h1>
            
            <p className={`text-lg ${paymentResult?.success ? 'text-green-700' : 'text-red-700'}`}>
              {paymentResult?.message}
            </p>
          </div>

          {/* Order Info */}
          {paymentResult?.orderId && (
            <div className="p-8 border-t border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin đơn hàng</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-medium">{paymentResult.orderNumber}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-medium text-red-600">
                    {formatPrice(paymentResult.amount)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`font-medium ${paymentResult.success ? 'text-green-600' : 'text-orange-600'}`}>
                    {paymentResult.success ? 'Đã thanh toán' : 'Chờ thanh toán'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-8 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              {paymentResult?.success && (
                <button
                  onClick={() => navigate('/customer/orders')}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Xem đơn hàng
                </button>
              )}
              
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                 Quay về trang chủ
              </button>
              
              {!paymentResult?.success && (
                <button
                  onClick={() => navigate('/customer/cart')}
                  className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Quay lại giỏ hàng
                </button>
              )}
            </div>
          </div>

          {/* Help Text */}
          <div className="p-6 bg-blue-50 border-t border-blue-100">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Lưu ý quan trọng</h3>
                <p className="text-sm text-blue-700">
                  {paymentResult?.success 
                    ? 'Đơn hàng của bạn đã được xác nhận và sẽ được xử lý trong thời gian sớm nhất.'
                    : 'Nếu bạn đã thanh toán nhưng vẫn thấy thông báo lỗi, vui lòng liên hệ với chúng tôi để được hỗ trợ.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;