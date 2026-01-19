/** 
 * author: KhoanDCE170420
 * FinanceLayout.jsx
 * Layout component for Finance (Sales Staff) pages
*/
import { Outlet } from "react-router-dom";
import SalesStaffSidebar from "../components/SalesStaffSidebar/SalesStaffSidebar";
import Navbar from "../components/Navbar/Navbar";

const FinanceLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SalesStaffSidebar />
      <div className="lg:ml-64">
        <Navbar />
        <main className="pt-16 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FinanceLayout;
