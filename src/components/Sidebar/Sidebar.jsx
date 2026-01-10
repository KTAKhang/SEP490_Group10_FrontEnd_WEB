import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ProfileOutlined,
  DollarOutlined,
  ProjectOutlined,
  MessageOutlined,
  ReadOutlined,
  InfoCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '../../contexts/SidebarContext';
import PropTypes from 'prop-types';

const Sidebar = ({ isAdmin = false, isSaleStaff = false }) => {
  const location = useLocation();
  const sidebarContext = useSidebar();
  const isOpen = typeof sidebarContext.isOpen !== 'undefined'
    ? sidebarContext.isOpen
    : true;
  const [hoveredItem, setHoveredItem] = useState(null);

  const prevIsOpen = useRef(isOpen);
  useEffect(() => { prevIsOpen.current = isOpen; }, [isOpen]);

  const adminMenuItems = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: <HomeOutlined />,
      color: "#FF6B6B"
    },
    {
      title: "Quản Lý Category",
      path: "/admin/category",
      icon: <AppstoreOutlined />,
      color: "#FECA57"
    },
    {
      title: "Quản Lý Sản Phẩm",
      path: "/admin/product",
      icon: <DatabaseOutlined />,
      color: "#FF9FF3"
    },
    {
      title: "Quản Lý Nhân Viên",
      path: "/admin/staff",
      icon: <UserOutlined />,
      color: "#00B894"
    },
    {
      title: "Quản lý dịch vụ sửa chữa",
      path: "/admin/repair",
      icon: <ProjectOutlined />,
      color: "#13C2C2"
    },
    {
      title: "Quản Lý Khách Hàng",
      path: "/admin/customer",
      icon: <UserOutlined />,
      color: "#54A0FF"
    },
    {
      title: "Quản Lý Đánh Giá",
      path: "/admin/review",
      icon: <ProfileOutlined />,
      color: "#FF9F43"
    },
    {
      title: "Quản Lý Đơn Hàng",
      path: "/admin/order",
      icon: <ShoppingCartOutlined />,
      color: "#5F27CD"
    },
    {
      title: "Quản Lý News",
      path: "/admin/news",
      icon: <ReadOutlined />,
      color: "#FF9F43"
    },
    {
      title: "Quản Lý Liên Hệ",
      path: "/admin/contact",
      icon: <MessageOutlined />,
      color: "#FF6B6B"
    },
    {
      title: "Quản Lý Mã Giảm Giá",
      path: "/admin/discounts",
      icon: <DollarOutlined />,
      color: "#00D2D3"
    },
    {
      title: "Quản Lý About Us",
      path: "/admin/about-us",
      icon: <InfoCircleOutlined />,
      color: "#06D6A0"
    },
    {
      title: "Quản Lý Founders",
      path: "/admin/founders",
      icon: <TeamOutlined />,
      color: "#EE5A6F"
    }
  ];

  const saleStaffMenuItems = [
    {
      title: "Dashboard",
      path: "/sale-staff",
      icon: <HomeOutlined />,
      color: "#FF6B6B"
    },
    {
      title: "Quản Lý Sản Phẩm",
      path: "/sale-staff/product",
      icon: <DatabaseOutlined />,
      color: "#FF9FF3"
    },
    {
      title: "Quản Lý Đánh Giá",
      path: "/sale-staff/review",
      icon: <ProfileOutlined />,
      color: "#FF9F43"
    },
    {
      title: "Quản Lý Đơn Hàng",
      path: "/sale-staff/order",
      icon: <ShoppingCartOutlined />,
      color: "#5F27CD"
    }
  ];

  const generalMenuItems = [
    {
      title: "Home",
      path: "/",
      icon: <HomeOutlined />,
      color: "#FF6B6B"
    }
  ];

  const renderAdminMenuItems = () => (
    <div className="space-y-2">
      {adminMenuItems.map((item, idx) =>
        !item.children ? (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHoveredItem(idx)}
            onHoverEnd={() => setHoveredItem(null)}
          >
            <Link
              to={item.path}
              className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden ${location.pathname === item.path
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:text-white'
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative z-10 p-2 rounded-lg transition-colors duration-300"
                style={{ backgroundColor: hoveredItem === idx ? `${item.color}20` : 'transparent' }}>
                <span className="text-xl" style={{ color: location.pathname === item.path ? 'white' : item.color }}>{item.icon}</span>
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="relative z-10 font-medium"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>
        ) : null
      )}
    </div>
  );
  const renderSaleStaffMenuItems = () => (
    <div className="space-y-2">
      {saleStaffMenuItems.map((item, idx) =>
        !item.children ? (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHoveredItem(idx)}
            onHoverEnd={() => setHoveredItem(null)}
          >
            <Link
              to={item.path}
              className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden ${location.pathname === item.path
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:text-white'
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative z-10 p-2 rounded-lg transition-colors duration-300"
                style={{ backgroundColor: hoveredItem === idx ? `${item.color}20` : 'transparent' }}>
                <span className="text-xl" style={{ color: location.pathname === item.path ? 'white' : item.color }}>{item.icon}</span>
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="relative z-10 font-medium"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>
        ) : null
      )}
    </div>
  );
  const renderMenuItems = (items) => (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          onHoverStart={() => setHoveredItem(index)}
          onHoverEnd={() => setHoveredItem(null)}
        >
          <Link
            to={item.path}
            className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden ${location.pathname === item.path
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
              : 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:text-white'
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="relative z-10 p-2 rounded-lg transition-colors duration-300"
              style={{ backgroundColor: hoveredItem === index ? `${item.color}20` : 'transparent' }}>
              <span className="text-xl" style={{ color: location.pathname === item.path ? 'white' : item.color }}>{item.icon}</span>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="relative z-10 font-medium"
                >
                  {item.title}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </motion.div>
      ))}
    </div>
  );

  const getMenuItems = () => {
    if (isAdmin === true) return renderAdminMenuItems();
    if (isSaleStaff === true) return renderSaleStaffMenuItems();
    else return renderMenuItems(generalMenuItems);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={false}
      animate={{
        width: '280px',
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
      }}
      className="sticky top-0 z-40 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen text-gray-200 shadow-2xl border-r border-slate-700/50"
    >
      <div className="relative z-10 p-4 flex flex-col h-full">
        <div className="flex items-center mb-8 pb-4 border-b border-slate-700/50">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <AppstoreOutlined className="text-white text-lg" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Management System</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {getMenuItems()}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

Sidebar.propTypes = {
  isAdmin: PropTypes.bool,
};

export default Sidebar;
