/**
 * author: KhoanDCE170420
 * SalesStaffSidebar.jsx
 * Sidebar component for Sales Staff
 */
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";
import {
  LayoutDashboard,
  Ticket,
  ShoppingCart,
  X,
  RotateCcw,
  FileText,
  Package,
} from "lucide-react";


const SalesStaffSidebar = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const location = useLocation();


  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/sale-staff/statistics",
      exact: true,
    },
    {
      icon: ShoppingCart,
      label: "Order Management",
      path: "/sale-staff/orders",
    },
    {
      icon: RotateCcw,
      label: "Refund Management",
      path: "/sale-staff/refund-orders",
    },
    {
      icon: Package,
      label: "Pre-order Management",
      path: "/sale-staff/preorder",
    },
    {
      icon: Ticket,
      label: "Discount Management",
      path: "/sale-staff/discounts",
    },
    {
      icon: FileText,
      label: "News Management",
      path: "/sale-staff/news",
    },
  ];


  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };


  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}


      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/sale-staff" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="text-white" size={20} />
              </div>
              {isOpen && (
                <span className="text-lg font-bold text-gray-800">
                  Sales Staff
                </span>
              )}
            </Link>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>


          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};


export default SalesStaffSidebar;
