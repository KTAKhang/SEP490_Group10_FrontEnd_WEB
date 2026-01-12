import LoginPage from "../pages/LoginPage";
import ForgotPassword from "../pages/ForgotPassword";
import NotFoundPage from "../pages/NotFoundPage";
import Register from "../pages/Register";
import HomePage from "../pages/HomePage";
import ContactPage from "../pages/CustomerView/ContactPage";
import ContactHistoryPage from "../pages/CustomerView/ContactHistoryPage";
// import AuthenticatedRoute from "../components/AuthenticatedRoute";
import CustomerLayout from "../layout/CustomerLayout";
import ProfileManagement from "../pages/ProfileManagement/ProfileManagerment";
import UpdatePassword from "../pages/ProfileManagement/UpdatePassword"; 
import PrivateRoute from "../components/PrivateRouter/index"
import AdminLayout from "../layout/AdminLayout";
// import AdminPage from "../pages/AdminPage";
import ContactListPage from "../pages/ContactManagement/ContactListPage";
import ContactDetailPage from "../pages/ContactManagement/ContactDetailPage";
import ContactEditPage from "../pages/ContactManagement/ContactEditPage";
export const routes = [
  // Trang chủ

  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },


  // Khu vực quản trị
  {
    path: "/customer",
    element: (
      <PrivateRoute requiredRole="customer">
        <CustomerLayout />
      </PrivateRoute>
    ),
    children: [
      { path: "profile", element: <ProfileManagement /> },
      { path: "change-password", element: <UpdatePassword /> },
      { path: "contact", element: <ContactPage /> },
      { path: "contact-history", element: <ContactHistoryPage /> },
    ],
  },

  // {
  //   path: "/sale-staff",
  //   element: (
  //     <PrivateRoute requiredRole="sales-staff">
  //       <FinanceLayout />
  //     </PrivateRoute>
  //   ),
  //   children: [
  //     { index: true, element: <StatisticsStaff /> },
  //     { path: "order", element: <StaffOrderManagement /> },


  //     { path: "product", element: <StaffProductManagement /> },


  //     { path: "change-password", element: <UpdatePassword /> },
  //     { path: "profile", element: <ProfileManagement /> },
  //     { path: "review", element: <StaffReviewManagement /> },


  //   ],
  // },

  // // Khu vực quản trị
  {
    path: "/admin",
    element: (
      <PrivateRoute requiredRole="admin">
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <ContactListPage /> },
      { path: "contacts", element: <ContactListPage /> },
      { path: "contacts/:id", element: <ContactDetailPage /> },
      { path: "contacts/:id/edit", element: <ContactEditPage /> },
    ],
  },

  // // Khu vực Repair Staff
  // {
  //   path: "/staff",
  //   element: (
  //     <PrivateRoute requiredRole="repair-staff">
  //       <RepairStaffLayout />
  //     </PrivateRoute>
  //   ),
  //   children: [
  //     { index: true, element: <RepairStaffDashboard /> },
  //     { path: "jobs", element: <RepairStaffJobs /> },
  //     { path: "jobs/:id", element: <RepairStaffJobDetail /> },
  //     { path: "services", element: <RepairStaffServices /> },
  //     { path: "change-password", element: <UpdatePassword /> },
  //     { path: "profile", element: <ProfileManagement /> },
  //   ],
  // },

  // Trang quên mật khẩu
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },

  {
    path: "/register",
    element: <Register />,
  },

  // Trang 404
  {
    path: "*",
    element: <NotFoundPage />,
  },
];