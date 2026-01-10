import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Minus, Plus, Trash2, ArrowLeft, Shield, Truck, Headphones } from 'lucide-react';
import {
    cartGetRequest,
    cartUpdateRequest,
    cartRemoveRequest,
    cartClearRequest,
    cartClearMessage
} from '../redux/actions/cartActions';
import {
    discountApplyRequest,
    discountClearApplied,
    discountClearMessages
} from '@/redux/actions/discountActions';

const CartPage = () => {
    const navigate = useNavigate(); // Khởi tạo hook useNavigate để điều hướng
    const dispatch = useDispatch(); // Khởi tạo hook useDispatch để dispatch action
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    // Lấy state từ Redux store (cart, loading, error)
    const { cart, loading, error } = useSelector((state) => state.cart || {});
    const { appliedDiscount, applying, error: discountError } = useSelector((state) => state.discount || {});
    const [couponCode, setCouponCode] = useState('');
    // Debug log trạng thái ban đầu - CHỈ CHẠY 1 LẦN KHI MOUNT
    useEffect(() => {
        console.log('CartPage mounted - fetching cart'); // Ghi log trạng thái Redux để debug
        const token = localStorage.getItem('token'); // Lấy token từ localStorage
        if (!token) {
            console.log('CartPage: No token found, redirecting to login'); // Ghi log nếu không có token
            toast.error('Vui lòng đăng nhập để xem giỏ hàng'); // Hiển thị thông báo lỗi
            navigate('/login'); // Chuyển hướng đến trang đăng nhập
            return;
        }
        console.log('CartPage: Dispatching cartGetRequest with token:', token); // Ghi log khi dispatch action
        dispatch(cartGetRequest()); // Dispatch action để lấy giỏ hàng
    }, [dispatch, navigate]); // CHỈ phụ thuộc vào dispatch và navigate (không thay đổi)
    
    // Debug log khi cart state thay đổi (separate useEffect để debug)
    useEffect(() => {
        console.log('CartPage state updated:', { cart, loading, error });
    }, [cart, loading, error]);

    // Xử lý lỗi giỏ hàng
    useEffect(() => {
        if (error) {
            console.log('CartPage error:', error); // Ghi log lỗi để debug
            dispatch(cartClearMessage()); // Dispatch action để xóa thông báo lỗi
        }
    }, [error, dispatch]); // Chạy lại khi error hoặc dispatch thay đổi

    useEffect(() => {
        if (discountError) {
            console.log('CartPage discount error:', discountError);
            dispatch(discountClearMessages());
        }
    }, [discountError, dispatch]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + '₫'; // Định dạng giá với dấu ₫
    };

    // Tính tổng tạm tính của giỏ hàng
    const calculateSubtotal = () => {
        return cart?.items?.reduce((total, item) => total + item.price * item.quantity, 0) || 0; // Tính tổng giá (giá * số lượng)
    };

    // Tính tổng tiền cuối cùng sau khi áp dụng giảm giá (nếu có)
    const calculateTotal = () => {
        if (appliedDiscount && typeof appliedDiscount.totalAfterDiscount === 'number') {
            return appliedDiscount.totalAfterDiscount;
        }
        return calculateSubtotal();
    };

    // Cập nhật số lượng sản phẩm
    const updateQuantity = (productId, change) => {
        // Kiểm tra nếu có mã giảm giá đã áp dụng
        if (appliedDiscount) {
            toast.warning('Vui lòng gỡ mã giảm giá để thay đổi số lượng giỏ hàng');
            return;
        }

        const item = cart?.items?.find((i) => i.productId === productId);
        if (!item) return;
        const newQuantity = Math.max(1, item.quantity + change);
        console.log('CartPage: Updating quantity', { productId, newQuantity });
        dispatch(cartUpdateRequest(productId, newQuantity));
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const removeItem = (productId) => {
        // Kiểm tra nếu có mã giảm giá đã áp dụng
        if (appliedDiscount) {
            toast.warning('Vui lòng gỡ mã giảm giá để thay đổi số lượng giỏ hàng');
            return;
        }

        console.log('CartPage: Removing item', { productId });
        dispatch(cartRemoveRequest(productId));
    };

    // Xóa toàn bộ giỏ hàng
    const clearCart = () => {
        // Kiểm tra nếu có mã giảm giá đã áp dụng
        if (appliedDiscount) {
            toast.warning('Vui lòng gỡ mã giảm giá để thay đổi số lượng giỏ hàng');
            return;
        }

        console.log('CartPage: Clearing cart');
        dispatch(cartClearRequest());
    };

    //xử lý áp dụng mã giảm giá
    const handleApplyDiscount = () => {
        if (!couponCode.trim()) {
            toast.error('Vui lòng nhập mã giảm giá');
            return;
        }

        const orderTotal = calculateSubtotal();
        if (orderTotal === 0) {
            toast.error('Giỏ hàng trống, không thể áp dụng mã giảm giá');
            return;
        }

        console.log('CartPage: Applying discount', { code: couponCode, orderTotal });
        dispatch(discountApplyRequest(couponCode.trim().toUpperCase(), orderTotal));
    };

    const handleRemoveDiscount = () => {
        dispatch(discountClearApplied());
        setCouponCode('');
    };

    const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    // Debug log trước khi render
    console.log('CartPage render:', { loading, cartItems: cart?.items, totalItems }); // Ghi log trạng thái trước render

    const handleCheckout = async () => {
        console.log('🔥 handleCheckout triggered');
        if (!cart?.items || cart.items.length === 0) {
            toast.error("Giỏ hàng trống");
            return;
        }
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?._id;
        if (!userId) {
            toast.error("Vui lòng đăng nhập để thanh toán");
            navigate("/login");
            return;
        }
        
        try {
            setCheckoutLoading(true);
            const subtotal = calculateSubtotal();
            const totalPrice = calculateTotal();
            const discountAmount = appliedDiscount ? appliedDiscount.discountAmount : 0;
            const totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
            
            // Pre-fill thông tin từ user profile
            const receiverName = storedUser?.user_name || storedUser?.fullName || storedUser?.name || "";
            const receiverPhone = storedUser?.phone || "";
            const receiverAddress = storedUser?.address || storedUser?.shippingAddress || "";
            
            // Map items để lưu vào localStorage
            const items = cart.items.map(item => ({
                productId: item.productId || item._id,
                productName: item.name,
                productImage: item.image,
                quantity: item.quantity || 1,
                price: item.price
            }));
            
            // ✅ LƯU THÔNG TIN GIỎ HÀNG VÀO LOCALSTORAGE - CHƯA TẠO ORDER
            const pendingCheckout = {
                userId,
                items,
                subtotal,
                totalPrice,
                discount: discountAmount,
                totalQuantity,
                customerInfo: {
                    fullName: receiverName || storedUser?.email || "Khách hàng",
                    phone: receiverPhone || "",
                    address: receiverAddress || ""
                }
            };
            
            console.log('💾 Saving checkout data to localStorage:', pendingCheckout);
            localStorage.setItem('pendingCheckout', JSON.stringify(pendingCheckout));
            
            // Chuyển đến trang checkout để nhập thông tin giao hàng
            navigate("/customer/checkout", {
                state: pendingCheckout
            });
        } catch (error) {
            const errorMessage = error.message || "Có lỗi xảy ra";
            toast.error(errorMessage);
        } finally {
            setCheckoutLoading(false);
        }
    };

    // Xử lý "Mua trước trả sau"
    const handleBuyNowPayLater = async () => {
        console.log('🔥 handleBuyNowPayLater triggered');
        if (!cart?.items || cart.items.length === 0) {
            toast.error("Giỏ hàng trống");
            return;
        }
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?._id;
        if (!userId) {
            toast.error("Vui lòng đăng nhập để đặt hàng");
            navigate("/login");
            return;
        }
        
        try {
            setCheckoutLoading(true);
            const subtotal = calculateSubtotal();
            const totalPrice = calculateTotal();
            const discountAmount = appliedDiscount ? appliedDiscount.discountAmount : 0;
            
            // Pre-fill thông tin từ user profile
            const receiverName = storedUser?.user_name || storedUser?.fullName || storedUser?.name || "";
            const receiverPhone = storedUser?.phone || "";
            const receiverAddress = storedUser?.address || storedUser?.shippingAddress || "";
            
            // Map items để lưu vào localStorage
            const items = cart.items.map(item => ({
                productId: item.productId || item._id,
                productName: item.name,
                productImage: item.image,
                quantity: item.quantity || 1,
                price: item.price
            }));
            
            // ✅ LƯU THÔNG TIN GIỎ HÀNG VÀO LOCALSTORAGE - CHƯA TẠO ORDER
            const pendingCheckout = {
                userId,
                items,
                subtotal,
                totalPrice,
                discount: discountAmount,
                totalQuantity: cart.items.reduce((sum, i) => sum + i.quantity, 0),
                customerInfo: {
                    fullName: receiverName || storedUser?.email || "Khách hàng",
                    phone: receiverPhone || "",
                    address: receiverAddress || ""
                },
                isCodPayment: true // ✅ Flag để CheckoutPage biết đây là thanh toán COD
            };
            
            console.log('💾 Saving COD checkout data to localStorage:', pendingCheckout);
            localStorage.setItem('pendingCheckout', JSON.stringify(pendingCheckout));
            
            // Chuyển đến trang checkout để nhập thông tin giao hàng (COD)
            navigate("/customer/checkout", {
                state: pendingCheckout
            });
        } catch (error) {
            const errorMessage = error.message || "Có lỗi xảy ra";
            toast.error(errorMessage);
        } finally {
            setCheckoutLoading(false);
        }
    };

    return (
        <>
            {/* <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm}/> */}
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn</h1>
                        <p className="text-gray-600">{totalItems} sản phẩm trong giỏ hàng</p>
                    </div>

                    {/* FIX: XÓA ALERT ĐỎ TRÊN UI ĐỂ TRÁNH DUPLICATE VISUAL VỚI TOAST TỪ SAGA */}
                    {/* {error && (
                        <div className="text-center py-12 text-red-600">
                            <h3 className="text-xl font-medium mb-2">Lỗi: {error || 'Không thể tải giỏ hàng'}</h3>
                            <button
                                onClick={() => dispatch(cartGetRequest())}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    )} */}
                    {loading && !error && (
                        <div className="text-center py-12">
                            {console.log('CartPage: Loading state', loading)}
                            <div className="text-6xl mb-4">⏳</div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">Đang tải giỏ hàng...</h3>
                        </div>
                    )}
                    {!loading && !error && (!cart || !cart.items || cart.items.length === 0) && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📦</div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">Giỏ hàng trống</h3>
                            <button
                                onClick={() => navigate('/products')}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    )}
                    {!loading && !error && cart?.items?.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-gray-100">
                                        <h2 className="text-xl font-bold text-gray-900">Sản phẩm</h2>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {cart.items.map((item) => (
                                            <div key={item.productId} className="p-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0">
                                                        <img
                                                            alt={item.name || 'Sản phẩm'}
                                                            className="w-20 h-20 object-cover rounded-lg"
                                                            src={item.image || '/placeholder-product.jpg'}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-900 mb-2">{item.name || 'Sản phẩm'}</h3>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center border border-gray-200 rounded-lg">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.productId, -1)}
                                                                        disabled={loading || item.quantity <= 1}
                                                                        className={`w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 ${appliedDiscount ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                    >
                                                                        <Minus className="w-4 h-4 text-gray-600" />
                                                                    </button>
                                                                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.productId, 1)}
                                                                        disabled={loading}
                                                                        className={`w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 ${appliedDiscount ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                    >
                                                                        <Plus className="w-4 h-4 text-gray-600" />
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeItem(item.productId)}
                                                                    disabled={loading}
                                                                    className={`w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 ${appliedDiscount ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-bold text-red-600 text-lg">
                                                                    {formatPrice(item.price * item.quantity)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-between">
                                    <button
                                        onClick={() => navigate('/products')}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Tiếp tục mua sắm
                                    </button>
                                    <button
                                        onClick={clearCart}
                                        disabled={loading}
                                        className={`flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 ${appliedDiscount ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Xóa tất cả
                                    </button>
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Tổng kết đơn hàng</h2>
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tạm tính:</span>
                                            <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                                        </div>

                                        {/* Hiển thị thông tin giảm giá nếu có */}
                                        {appliedDiscount && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-green-700 font-medium">Giảm giá ({appliedDiscount.code}):</span>
                                                    <span className="text-green-600 font-bold">-{formatPrice(appliedDiscount.discountAmount)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-green-700 font-medium">Tổng sau giảm:</span>
                                                    <span className="text-green-600 font-bold">{formatPrice(appliedDiscount.totalAfterDiscount)}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phí vận chuyển:</span>
                                            <span className="font-medium">Miễn phí</span>
                                        </div>
                                        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center">
                                            <Truck className="w-4 h-4 mr-2" />
                                            Miễn phí vận chuyển cho đơn hàng trên 50 triệu
                                        </div>
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                                                <span className="text-2xl font-bold text-red-600">
                                                    {formatPrice(appliedDiscount ? appliedDiscount.totalAfterDiscount : calculateSubtotal())}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleCheckout}
                                            className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={checkoutLoading || loading || !cart?.items?.length}
                                        >
                                            {checkoutLoading ? 'Đang tạo đơn hàng...' : 'Thanh toán ngay'}
                                        </button>
                                        <button
                                            onClick={handleBuyNowPayLater}
                                            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={checkoutLoading || loading || !cart?.items?.length}
                                        >
                                            {checkoutLoading ? 'Đang xử lý...' : 'Mua trước trả sau'}
                                        </button>
                                    </div>
                                    {/* Phần áp dụng mã giảm giá */}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h3 className="font-bold text-gray-900 mb-3">Ưu đãi & Khuyến mãi</h3>
                                        {appliedDiscount ? (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-green-700 font-medium">Mã đã áp dụng:</span>
                                                    <span className="text-green-600 font-bold">{appliedDiscount.code}</span>
                                                </div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-green-700 text-sm">Giảm {appliedDiscount.discountPercent}%</span>
                                                    <span className="text-green-600 font-bold">-{formatPrice(appliedDiscount.discountAmount)}</span>
                                                </div>
                                                <button
                                                    onClick={handleRemoveDiscount}
                                                    className="w-full bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                                >
                                                    Xóa mã giảm giá
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Nhập mã giảm giá"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                    disabled={applying}
                                                />
                                                <button
                                                    onClick={handleApplyDiscount}
                                                    disabled={applying || !couponCode.trim()}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50"
                                                >
                                                    {applying ? 'Đang áp dụng...' : 'Áp dụng'}

                                                </button>
                                                {/* Nút thanh toán đã có ở trên phần Tổng kết đơn hàng */}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <Shield className="w-4 h-4 text-green-500" />
                                            <span>Bảo hành chính hãng</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
                                            <Truck className="w-4 h-4 text-blue-500" />
                                            <span>Giao hàng toàn quốc</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
                                            <Headphones className="w-4 h-4 text-purple-500" />
                                            <span>Hỗ trợ 24/7</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartPage;