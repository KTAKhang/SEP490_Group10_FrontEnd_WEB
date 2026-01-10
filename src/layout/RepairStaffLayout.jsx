import { Outlet } from "react-router-dom";
import RepairStaffNavbar from "../components/RepairStaffNavbar/RepairStaffNavbar";
import RepairStaffSidebar from "../components/RepairStaffSidebar/RepairStaffSidebar";
import { useSidebar } from "../contexts/SidebarContext";

const RepairStaffLayout = () => {
  const { isOpen } = useSidebar();

  return (
    <div>
      <RepairStaffNavbar />
      <div className="flex">
        <RepairStaffSidebar isOpen={isOpen} />
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default RepairStaffLayout;
