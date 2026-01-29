import { useState } from "react";
import { Outlet } from "react-router-dom"; // Sidebar component
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import ChatForCustomer from "../pages/CustomerView/ChatForCustomer";
const CustomerLayout = () => {
  // const [isOpen, setIsOpen] = useState(true); // State to manage sidebar open/close

  // const toggleSidebar = () => {
  //   setIsOpen((prev) => !prev);
  // };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1">
        <div className="flex-1">
          <Outlet />
        
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
