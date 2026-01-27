import { Outlet } from "react-router-dom";
import FeedbackSidebar from "../components/Sidebar/FeedbackSidebar";
import Navbar from "../components/Navbar/Navbar";

const FeedbackStaffLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <FeedbackSidebar />
      <div className="lg:ml-64">
      <Navbar />
        <main className="pt-16 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FeedbackStaffLayout;
