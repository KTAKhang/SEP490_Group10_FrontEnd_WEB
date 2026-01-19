import { Outlet } from "react-router-dom";
import QcStaffSidebar from "../components/QcStaffSidebar/QcStaffSidebar";
import Navbar from "../components/Navbar/Navbar";

const QcStaffLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <QcStaffSidebar />
      <div className="lg:ml-64">
        <Navbar />
        <main className="pt-16 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default QcStaffLayout;
