import Navbar from "../components/Navbar/Navbar";
import React, { useState } from 'react'
import { Outlet } from 'react-router-dom';
import Sidebar from "../components/Sidebar/Sidebar";

function FinanceLayout() {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen((prev) => !prev);
    };
    return (
        <>
            <div>
                <Navbar toggleSidebar={toggleSidebar} />
                <div className="flex">
                    <Sidebar isSaleStaff={true} isAdmin={false} isOpen={isOpen} />
                    <div className="flex-1 p-4 bg-[#F8FAFD]  w-full">
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    )
}

export default FinanceLayout
