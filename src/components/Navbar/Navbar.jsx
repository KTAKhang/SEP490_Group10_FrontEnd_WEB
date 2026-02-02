import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutRequest } from "../../redux/actions/authActions";
import { getProfileRequest } from "../../redux/actions/profileAction";
import { useSidebar } from "../../contexts/SidebarContext";
import { Menu, LogOut, User, Settings } from "lucide-react";
import NotificationBell from "../NotificationBell/NotificationBell";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { toggleSidebar } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Get user from Redux store
  const { user } = useSelector((state) => state.profile);
  
  // Fetch profile on mount if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      dispatch(getProfileRequest());
    }
  }, [dispatch, user]);

  // Fallback to localStorage if Redux user is not loaded yet
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUser = user || storedUser;
  
  const displayName = currentUser?.user_name || "Admin";
  const displayEmail = currentUser?.email || "admin@email.com";
  const displayAvatar = currentUser?.avatar?.startsWith("http")
    ? currentUser.avatar
    : "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=60&h=60&fit=crop&crop=face";

  // Determine base path based on current location
  const getBasePath = () => {
    const pathname = location.pathname;
    if (pathname.startsWith("/admin")) {
      return "/admin";
    } else if (pathname.startsWith("/warehouse-staff")) {
      return "/warehouse-staff";
    } else if (pathname.startsWith("/qc-staff")) {
      return "/qc-staff";
    } else if (pathname.startsWith("/sale-staff")) {
      return "/sale-staff";
    } else if (pathname.startsWith("/customer")) {
      return "/customer";
    }
    // Default to admin if cannot determine
    return "/admin";
  };

  const basePath = getBasePath();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
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
        {/* NOTIFICATIONS */}
        <NotificationBell />
        
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
                      navigate(`${basePath}/profile`);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate(`${basePath}/settings`);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>

                  <div className="border-t mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      <span>Log out</span>
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
