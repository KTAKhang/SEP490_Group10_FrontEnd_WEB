import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutRequest } from "../../redux/actions/authActions";
import { useSidebar } from "../../contexts/SidebarContext";
import { Menu, LogOut, User, Settings, Bell } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toggleSidebar } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const displayName = storedUser?.user_name || "Admin";
  const displayEmail = storedUser?.email || "admin@email.com";
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
    <nav className="bg-white shadow-md h-16 flex items-center justify-between px-4 lg:px-6 fixed top-0 right-0 left-0 lg:left-64 z-30">
      {/* Left: Menu toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1" /> {/* Spacer */}

      {/* Right: User menu */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 hover:bg-gray-100 rounded-lg relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg"
          >
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800">{displayName}</p>
              <p className="text-xs text-gray-500">{displayEmail}</p>
            </div>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20">
                <div className="p-4 border-b">
                  <p className="text-sm font-medium text-gray-800">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500">{displayEmail}</p>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate("/admin/profile");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User size={18} />
                    <span>Trang cá nhân</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate("/admin/settings");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings size={18} />
                    <span>Cài đặt</span>
                  </button>

                  <div className="border-t mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
