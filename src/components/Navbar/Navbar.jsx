import { useState, useMemo, useRef } from "react";
import { Menu, Settings, User, LogOut, ChevronDown } from "lucide-react";
import { useSidebar } from '../../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { logoutRequest } from "../../redux/actions/authActions";

const Navbar = () => {
  const { toggleSidebar } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const avatarBtnRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const debouncedToggleSidebar = useMemo(() => {
    return () => {
      setTimeout(toggleSidebar, 300);
    };
  }, [toggleSidebar]);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const displayName = storedUser?.user_name || "Người dùng";
  const displayEmail = storedUser?.email || "user@email.com";
  const displayAvatar = storedUser?.avatar?.startsWith("http")
    ? storedUser.avatar
    : "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop&crop=face";
  const roleName = storedUser?.role_name || "user";

  const getProfileRoute = () => {
    if (roleName === "admin") return "/admin/profile";
    if (roleName === "sales-staff") return "/sale-staff/profile";
    return "/user/profile";
  };

  const getChangePasswordRoute = () => {
    if (roleName === "admin") return "/admin/change-password";
    if (roleName === "sales-staff") return "/sale-staff/change-password";
    return "/user/change-password";
  };

  const toggleDropdown = () => setIsDropdownOpen((open) => !open);

  const handleHome = () => {
    if (roleName === "admin") navigate("/admin");
    if (roleName === "sales-staff") navigate("/sale-staff");
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
    if (confirmed) {
      dispatch(logoutRequest());
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  return (
    <div
      className="w-full relative overflow-visible sticky top-0 z-50"
      style={{ background: "linear-gradient(135deg, #0D364C 0%, #13C2C2 100%)" }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 animate-pulse"
          style={{ backgroundColor: "#13C2C2" }}
        ></div>
        <div
          className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-15 animate-pulse animation-delay-2000"
          style={{ backgroundColor: "#0D364C" }}
        ></div>
      </div>

      <div className="relative z-10 backdrop-blur-sm bg-white/5 border-b border-white/10">
        <div className="flex justify-between items-center p-4">

          {/* LEFT */}
          <div className="flex items-center space-x-4">
            <button
              onClick={debouncedToggleSidebar}
              className="text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-110 hover:rotate-180"
            >
              <Menu className="w-6 h-6" />
            </button>

            <button
              onClick={handleHome}

            >
              <div
                className="group relative overflow-hidden rounded-2xl p-2 transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    {roleName === "admin" && <span className="text-white text-lg">👑</span>}
                    {roleName === "sales-staff" && <span className="text-white text-lg">💼</span>}
                  </div>

                  <span className="text-white font-bold text-lg">
                    {roleName === "admin" && "Administrator"}
                    {roleName === "sales-staff" && "Sales Staff"}
                  </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </div>

            </button>
          </div>

          {/* RIGHT */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <span className="text-white font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                👋 Xin chào, {displayName}!
              </span>
            </div>

            <div className="relative">
              <button
                ref={avatarBtnRef}
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition-all duration-300 transform hover:scale-105 group"
              >
                <div className="relative">
                  <img
                    src={displayAvatar}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/30 group-hover:border-white/60 transition-all duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop&crop=face";
                    }}
                  />
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-white transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-96 z-[9999]">
                  <div
                    className="backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200"
                    style={{ background: "rgba(255, 255, 255, 0.95)" }}
                  >
                    <div
                      className="p-4 border-b border-gray-200/50"
                      style={{ background: "linear-gradient(135deg, #13C2C2, #0D364C)" }}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={displayAvatar}
                          alt="User Avatar"
                          className="w-12 h-12 rounded-full border-2 border-white/50 object-cover"
                        />
                        <div>
                          <p className="font-semibold text-white">{displayName}</p>
                          <p className="text-sm text-white/80">{displayEmail}</p>
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-white/20 text-white rounded-full">
                            {roleName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ✅ Dropdown có redirect theo role */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate(getProfileRoute());
                          toggleDropdown();
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                      >
                        <User className="w-5 h-5" style={{ color: "#13C2C2" }} />
                        <span>Trang cá nhân</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate(getChangePasswordRoute());
                          toggleDropdown();
                        }}
                        disabled={storedUser?.isGoogleAccount === true}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                      >
                        <Settings className="w-5 h-5" style={{ color: "#13C2C2" }} />
                        <span>Đổi mật khẩu</span>
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
          </div>
        </div>

        <div
          className="h-1 w-full"
          style={{
            background: "linear-gradient(90deg, #13C2C2, transparent, #13C2C2)",
          }}
        ></div>
      </div>

      <style>{`
        @keyframes slide-in-from-top-2 {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-in-from-top-2 { animation-name: slide-in-from-top-2; }
        .animate-in { animation-fill-mode: both; }
      `}</style>
    </div>
  );
};

export default Navbar;
