import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutRequest } from "../../redux/actions/authActions";
import { LogOut, Settings, User, Clock, Package } from "lucide-react";
import PropTypes from "prop-types";


const Header = ({ searchTerm, setSearchTerm }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Search bar removed - keep props to avoid breaking parent components
    void searchTerm;
    void setSearchTerm;

    // Lấy cart state từ Redux store
    const { cart } = useSelector((state) => state.cart || {});

    // DEBUG
    console.log('🛒 Header cart data:', cart);
    console.log('🛒 Cart items:', cart?.items);

    // SỬA: Hiển thị số sản phẩm KHÁC NHAU (số lượng items trong array)
    // Thay vì tổng quantity
    const cartItems = cart?.items?.length || 0;

    console.log('🛒 Number of distinct products:', cartItems);
    console.log('🛒 Backend sum:', cart?.sum); // Cái này cũng là số sản phẩm khác nhau

    // User từ localStorage
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    const displayName = storedUser?.user_name || "Người dùng";
    const displayAvatar = storedUser?.avatar?.startsWith("http")
        ? storedUser.avatar
        : "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=60&h=60&fit=crop&crop=face";
    const displayEmail = storedUser?.email || "user@email.com";

    // Thông tin shop cố định
    const shopName = "DarkCore Shop";

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            dispatch(logoutRequest());
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user");
            navigate("/");
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <header className="sticky top-0 bg-white shadow-sm border-b border-gray-100 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">💻</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">{shopName}</span>
                    </Link>

                    {/* Nav links */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-blue-600">
                            Trang chủ
                        </Link>
                        <Link to="/products" className="text-gray-700 hover:text-blue-600">
                            Sản phẩm
                        </Link>
                        <Link to="/repair" className="text-gray-700 hover:text-blue-600">
                            Sửa chữa
                        </Link>
                        <Link to="/news" className="text-gray-700 hover:text-blue-600">
                            Tin Tức
                        </Link>
                        <Link to="/discounts" className="text-gray-700 hover:text-blue-600">
                            Mã giảm giá
                        </Link>
                        <Link to="/about" className="text-gray-700 hover:text-blue-600">
                            Về chúng tôi
                        </Link>
                        <Link to="/contact" className="text-gray-700 hover:text-blue-600">
                            Liên hệ
                        </Link>
                       

                    </nav>


                    <div className="flex items-center space-x-4">
                        {storedUser ? (
                            <>
                                {/* Wishlist */}
                                <Link
                                    to="/wishlist"
                                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors"
                                    title="Danh sách yêu thích"
                                >
                                    <span className="text-lg">❤️</span>
                                </Link>

                                {/* Cart - GIỜ TỰ ĐỘNG LẤY TỪ REDUX */}
                                <Link
                                    to="/customer/cart"
                                    className="relative w-10 h-10 flex items-center justify-center text-gray-600 hover:text-blue-600"
                                    style={{ color: "#13C2C2" }}
                                >
                                    <span className="text-lg">🛒</span>
                                    {cartItems > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                            {cartItems}
                                        </span>
                                    )}
                                </Link>

                                {/* Avatar + Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={toggleDropdown}
                                        className="w-10 h-10 flex items-center justify-center"
                                    >
                                        <img
                                            src={displayAvatar}
                                            alt="User Avatar"
                                            className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=60&h=60&fit=crop&crop=face";
                                            }}
                                        />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 top-full mt-3 w-96 z-[9999]">
                                            <div
                                                className="backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200"
                                                style={{ background: 'rgba(255, 255, 255, 0.95)' }}
                                            >
                                                {/* User info header */}
                                                <div className="p-4 border-b border-gray-200/50" style={{ background: 'linear-gradient(135deg, #135cc2ff, #0D364C)' }}>
                                                    <div className="flex items-center space-x-3">
                                                        <img
                                                            src={displayAvatar}
                                                            alt="User Avatar"
                                                            className="w-12 h-12 rounded-full border-2 border-white/50 object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop&crop=face";
                                                            }}
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-white">{displayName}</p>
                                                            <p className="text-sm text-white/80">{displayEmail}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Menu items */}
                                                <div className="py-2">
                                                    <button
                                                        onClick={() => {
                                                            navigate("/customer/profile");
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                                                    >
                                                        <User className="w-5 h-5" style={{ color: '#135cc2ff' }} />
                                                        <span>Trang cá nhân</span>
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            navigate("/customer/change-password");
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        disabled={storedUser?.isGoogleAccount === true}
                                                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                                                    >
                                                        <Settings className="w-5 h-5" style={{ color: '#135cc2ff' }} />
                                                        <span>Đổi mật khẩu</span>
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            navigate("/customer/orders");
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                                                    >
                                                        <Package className="w-5 h-5" style={{ color: '#135cc2ff' }} />
                                                        <span>Lịch sử đơn hàng</span>
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            navigate('/repair/history');
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                                                    >
                                                        <Clock className="w-5 h-5" style={{ color: '#135cc2ff' }} />
                                                        <span>Lịch sử sửa chữa</span>
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            navigate('/customer/contact/history');
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                                                    >
                                                        <Clock className="w-5 h-5" style={{ color: '#135cc2ff' }} />
                                                        <span>Lịch sử liên hệ</span>
                                                    </button>

                                                    <div className="border-t border-gray-200/50 mt-2 pt-2">
                                                        <button
                                                            onClick={handleLogout}
                                                            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-200 hover:translate-x-1"
                                                        >
                                                            <LogOut className="w-5 h-5" />
                                                            <span>Đăng xuất</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-3 py-2 text-gray-600 hover:text-blue-600"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-3 py-2 text-gray-600 hover:text-blue-600"
                                >
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    searchTerm: PropTypes.string,
    setSearchTerm: PropTypes.func,
    // ĐÃ XÓA cartItems khỏi props
};

export default Header;