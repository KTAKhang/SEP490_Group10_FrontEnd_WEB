import { Outlet } from "react-router-dom";
import WarehouseStaffSidebar from "../components/WarehouseStaffSidebar/WarehouseStaffSidebar";
import Navbar from "../components/Navbar/Navbar";

const WarehouseStaffLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <WarehouseStaffSidebar />
      <div className="lg:ml-64">
        <Navbar />
        <main className="pt-16 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default WarehouseStaffLayout;
