import { useState } from "react";
import { Outlet } from "react-router-dom"; // Sidebar component
import Header from "../components/Header/Header";

const CustomerLayout = () => {
  // const [isOpen, setIsOpen] = useState(true); // State to manage sidebar open/close

  // const toggleSidebar = () => {
  //   setIsOpen((prev) => !prev);
  // };

  return (
    <div>
      <Header />
      <div className="flex">
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
