import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import { useSidebar } from "../contexts/SidebarContext";

const AdminLayout = () => {
  const { isOpen } = useSidebar();

  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar isAdmin={true} isOpen={isOpen} />
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
