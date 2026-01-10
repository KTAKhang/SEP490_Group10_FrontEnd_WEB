import LoginPage from "../pages/LoginPage";
import ForgotPassword from "../pages/ForgotPassword";
import NotFoundPage from "../pages/NotFoundPage";
import Register from "../pages/Register";
import HomePage from "../pages/HomePage";

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
  // {
  //   path: "/customer",
  //   element: (
  //     <PrivateRoute requiredRole="customer">
  //       <CustomerLayout />
  //     </PrivateRoute>
  //   ),
  //   children: [
  //     { path: "repair", element: <RepairPage /> },
  //     { path: "profile", element: <ProfileManagement /> },
  //     { path: "change-password", element: <UpdatePassword /> },
  //     {
  //       path: "cart",
  //       element: <CartPage />,
  //     },
  //     {
  //       path: "orders",
  //       element: <OrderHistory />,
  //     },
  //     {
  //       path: "checkout",
  //       element: <CheckoutPage />,
  //     },
  //     {
  //       path: "payment-result",
  //       element: <PaymentResultPage />,
  //     },
  //     {
  //       path: "contact/history",
  //       element: <ContactHistory />,
  //     },
  //     { path: "review/:id", element: <OrderReviewPage /> },
  //     { path: "contact", element: <ContactPage /> },
  //   ],
  // },

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
  // {
  //   path: "/admin",
  //   element: (
  //     <PrivateRoute requiredRole="admin">
  //       <AdminLayout />
  //     </PrivateRoute>
  //   ),
  //   children: [
  //     { index: true, element: <AdminPage /> },
  //     { path: "repair", element: <RepairAdminHub /> },
  //     { path: "repair/requests", element: <RepairAdminRequests /> },
  //     { path: "repair/requests/:id", element: <RepairAdminRequestDetail /> },
  //     { path: "repair/services", element: <RepairAdminServices /> },
  //     { path: "category", element: <CategoryManagement /> },
  //     { path: "product", element: <ProductManagement /> },
  //     { path: "customer", element: <CustomerManagement /> },
  //     { path: "customer/:id", element: <CustomerDetail /> },
  //     { path: "order", element: <OrderManagement /> },
  //     { path: "profile", element: <ProfileManagement /> },
  //     { path: "review", element: <ProductReviewManagement /> },
  //     { path: "review/:id", element: <AdminProductReviewDetailPage /> },
  //     { path: "change-password", element: <UpdatePassword /> },
  //     { path: "staff", element: <StaffManagement /> },
  //     { path: "news", element: <NewsManagement /> },
  //     { path: "contact", element: <ContactManagement /> },
  //     { path: "discounts", element: <AdminDiscountPage /> },
  //     { path: "about-us", element: <AboutUsManagement /> },
  //     { path: "about-us/create", element: <CreateAboutUs /> },
  //     { path: "about-us/update", element: <UpdateAboutUs /> },
  //     { path: "founders", element: <FoundersManagement /> },
  //   ],
  // },

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