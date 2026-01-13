import LoginPage from "../pages/LoginPage";
import ForgotPassword from "../pages/ForgotPassword";
import NotFoundPage from "../pages/NotFoundPage";
import Register from "../pages/Register";
import HomePage from "../pages/HomePage";
import ProdcutPage from "../pages/ProductPage";
import Categories from "../pages/CategoryPage";
// import ContactPage1 from "../pages/ContactPage";
import ContactPage from "../pages/ContactManagement/ContactPage";
import ContactHistoryPage from "../pages/ContactManagement/ContactHistoryPage";
import AuthenticatedRoute from "../components/AuthenticatedRoute";
import CustomerLayout from "../layout/CustomerLayout";
import AdminLayout from "../layout/AdminLayout";
import AdminPage from "../pages/Admin/AdminPage/AdminPage";
import WareHouse from "../pages/Admin/Warehouse/WareHouse";
import CategoryManagement from "../pages/Admin/Category/CategoryManagement";
import WarehouseStaffLayout from "../layout/WarehouseStaffLayout";
import WarehouseStaffPage from "../pages/WarehouseStaff/WarehouseStaffPage";
import WarehouseStaffWareHouse from "../pages/WarehouseStaff/Warehouse/WareHouse";
import ProfileManagement from "../pages/ProfileManagement/ProfileManagerment";
import UpdatePassword from "../pages/ProfileManagement/UpdatePassword"; 
import PrivateRoute from "../components/PrivateRouter/index"
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
  {
    path: "/products",
    element: <ProdcutPage />,
  },
  {
    path: "/categories",
    element: <Categories />,
  },
  // {
  //   path: "/contact",
  //   element: <ContactPage1 />,
  // },

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
    ],
  },

  // Khu vực Admin
  {
    path: "/admin",
    element: (
      <PrivateRoute requiredRole="admin">
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <AdminPage /> },
      { path: "warehouse", element: <WareHouse /> },
      { path: "category", element: <CategoryManagement /> },
    ],
  },

  // Khu vực Warehouse Staff
  {
    path: "/warehouse-staff",
    element: (
      <PrivateRoute requiredRole="warehouse_staff">
        <WarehouseStaffLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <WarehouseStaffPage /> },
      { path: "warehouse", element: <WarehouseStaffWareHouse /> },
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

  // Contact pages - require authentication
  {
    path: "/contact",
    element: (
     
         <ContactPage />
      
     ),   
  },
  {
    path: "/contact/history",
    element: (
      <AuthenticatedRoute>
         <ContactHistoryPage />
      </AuthenticatedRoute>
    ),
  },

  // Trang 404
  {
    path: "*",
    element: <NotFoundPage />,
  },
];