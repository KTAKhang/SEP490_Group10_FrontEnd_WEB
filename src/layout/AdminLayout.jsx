import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      {/* Content area: always offset by sidebar width on lg+ so sidebar never overlaps */}
      <div className="flex-1 w-full min-w-0 ml-0 lg:ml-64 transition-[margin] duration-200 flex flex-col relative z-10">
        <Navbar />
        <main className="flex-1 pt-16 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
