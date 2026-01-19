import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutRequest } from "../../redux/actions/authActions";
import { LogOut, Settings, User, Clock, Package, Menu, X } from "lucide-react";
import PropTypes from "prop-types";
// import { fetchCartRequest } from "../../";
const Header = ({ searchTerm, setSearchTerm }) => {
  void searchTerm;
  void setSearchTerm;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  // useEffect(() => {
  //   dispatch(fetchCartRequest());
  // }, [dispatch]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { cart } = useSelector((state) => state.cart || {});
  console.log("cart", cart)
  const cartItems = cart?.items?.length || 0;

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const displayName = storedUser?.user_name || "Người dùng";
  const displayEmail = storedUser?.email || "user@email.com";
  const displayAvatar = storedUser?.avatar?.startsWith("http")
    ? storedUser.avatar
    : "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=60&h=60&fit=crop&crop=face";

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      dispatch(logoutRequest());
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="https://public.readdy.ai/ai/img_res/5bde7704-1cb0-4365-9e92-f123696b11d9.png"
              alt="Nông Sản Sạch"
              className="h-10 md:h-12"
            />
            <span className="text-xl font-bold text-green-700">
              Smart fruit shop
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { label: "Home", path: "/" },
              { label: "Product", path: "/products" },
              { label: "Categories", path: "/categories" },
              { label: "About Us", path: "/about" },
              { label: "Contact", path: "/customer/contact" },
              { label: "News", path: "/news" },
              { label: "FAQ", path: "/faq" },
       ...(storedUser ? [{ label: "Wishlist", path: "/wishlist" }] : []),
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-medium text-gray-700 hover:text-green-600 whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center space-x-3">
            {/* USER */}
            {storedUser ? (
              <>
                {/* CART */}
                <Link
                  to="/customer/cart"
                  className="relative p-2 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <span className="text-xl">🛒</span>
                  {cartItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {cartItems}
                    </span>
                  )}
                </Link>
                {/* AVATAR */}
                <div className="relative">
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <img
                      src={displayAvatar}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full border object-cover"
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl overflow-hidden">
                      <div className="p-4 bg-green-600 text-white">
                        <p className="font-semibold">{displayName}</p>
                        <p className="text-sm opacity-80">{displayEmail}</p>
                      </div>
                      <div className="py-2">
                        <DropdownItem
                          icon={<User size={18} />}
                          label="Profile"
                          onClick={() => navigate("/customer/profile")}
                        />
                        <DropdownItem
                          icon={<Settings size={18} />}
                          label="Change Password"
                          onClick={() => navigate("/customer/change-password")}
                        />
                        <DropdownItem
                          icon={<Package size={18} />}
                          label="Order History"
                          onClick={() => navigate("/customer/orders")}
                        />
                        <DropdownItem
                          icon={<Clock size={18} />}
                          label="Contact History"
                          onClick={() => navigate("/customer/contact-history")}
                        />

                        <div className="border-t mt-2 pt-2">
                          <DropdownItem
                            icon={<LogOut size={18} />}
                            label="Logout"
                            danger
                            onClick={handleLogout}
                          />
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
className="text-sm text-gray-700 hover:text-green-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-gray-700 hover:text-green-600"
                >
                  Register
                </Link>
              </>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {[
              { label: "Home", path: "/" },
              { label: "Product", path: "/products" },
              { label: "Categories", path: "/categories" },
              { label: "About Us", path: "/about" },
              { label: "Contact", path: "/customer/contact" },
              { label: "FAQ", path: "/faq" },
             ...(storedUser ? [{ label: "Wishlist", path: "/wishlist" }] : []),
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

const DropdownItem = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm ${danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
      }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

DropdownItem.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  danger: PropTypes.bool,
};

Header.propTypes = {
  searchTerm: PropTypes.string,
  setSearchTerm: PropTypes.func,
};

export default Header;