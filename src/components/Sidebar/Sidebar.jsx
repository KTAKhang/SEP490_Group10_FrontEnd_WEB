import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";
import {
  LayoutDashboard,
  X,
  MessageSquare,
  FileText,
  Store,
  FolderTree,
  Building2,
  Truck,
  Package,
  Ticket,
  History,
  ScrollText,
  ClipboardList,
  Users,
  Image,
  Gift,
  ShoppingCart,
  Apple,
  BarChart3,
  Star,
} from "lucide-react";


const Sidebar = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const location = useLocation();


  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin",
      exact: true,
    },
    {
      icon: FolderTree,
      label: "Categories",
      path: "/admin/category",
    },
    {
      icon: Store,
      label: "Product",
      path: "/admin/warehouse",
    },
    {
      icon: Truck,
      label: "Supplier",
      path: "/admin/suppliers",
    },
    {
      icon: Package,
      label: "Harvest Batch",
      path: "/admin/harvest-batches",
    },
    {
      icon: Gift,
      label: "Fruit Baskets",
      path: "/admin/fruit-baskets",
    },
    {
      icon: ShoppingCart,
      label: "Orders",
      path: "/admin/orders",
    },
    {
      icon: ScrollText,
      label: "Order Log History",
      path: "/admin/order-log-history",
    },
    {
      icon: Apple,
      label: "Pre-order management",
      path: "/admin/preorder",
    },
    {
      icon: Star,
      label: "Reviews",
      path: "/admin/reviews",
    },
    {
      icon: MessageSquare,
      label: "Contact",
      path: "/admin/contacts",
    },
    {
      icon: FileText,
      label: "News",
      path: "/admin/news",
    },
    {
      icon: Building2,
      label: "Shop Information",
      path: "/admin/shop",
    },
    {
      icon: Image,
      label: "Homepage Assets",
      path: "/admin/homepage-assets",
    },
    {
      icon: Users,
      label: "Staff Management",
      path: "/admin/staff",
    },
      {
      icon: Users,
      label: "Customer Management",
      path: "/admin/customers",
    },
    {
      icon: Ticket,
      label: "Discount Management",
      path: "/admin/discounts",
    },
    {
      icon: History,
      label: "Batch History",
      path: "/admin/batch-history",
    },
    {
      icon: ClipboardList,
      label: "Receipt History",
      path: "/admin/receipt-history",
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
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-all duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="text-white" size={20} />
              </div>
              {isOpen && (
                <span className="text-lg font-bold text-gray-800">
                  Admin Panel
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
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active
                          ? "bg-green-100 text-green-700 font-medium"
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


export default Sidebar;