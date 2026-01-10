import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  ClipboardList,
  Wrench,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RepairStaffSidebar = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const staffMenuItems = [
    {
      title: "Dashboard",
      path: "/staff",
      icon: <Home className="w-5 h-5" />,
    },
    {
      title: "Danh sách công việc",
      path: "/staff/jobs",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      title: "Quản lý dịch vụ sửa chữa",
      path: "/staff/services",
      icon: <Wrench className="w-5 h-5" />,
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="w-72 bg-gray-800 text-white min-h-screen">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center mb-8 pb-4 border-b border-gray-700">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold">Repair Staff</h1>
            <p className="text-xs text-gray-400">Management System</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {staffMenuItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              {item.icon}
              <span className="font-medium">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepairStaffSidebar;
