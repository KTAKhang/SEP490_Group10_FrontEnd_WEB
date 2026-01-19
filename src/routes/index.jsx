import LoginPage from "../pages/LoginPage";
import ForgotPassword from "../pages/ForgotPassword";
import NotFoundPage from "../pages/NotFoundPage";
import Register from "../pages/Register";
import HomePage from "../pages/HomePage";
import ContactPage from "../pages/ContactPage";
import ContactHistoryPage from "../pages/CustomerView/ContactHistoryPage";
// import AuthenticatedRoute from "../components/AuthenticatedRoute";
import ProdcutPage from "../pages/ProductPage";
import Categories from "../pages/CategoryPage";
// import ContactPage1 from "../pages/ContactPage";
import CustomerLayout from "../layout/CustomerLayout";
import AdminPage from "../pages/Admin/AdminPage/AdminPage";
import WareHouse from "../pages/Admin/Warehouse/WareHouse";
import CategoryManagement from "../pages/Admin/Category/CategoryManagement";
import WarehouseStaffLayout from "../layout/WarehouseStaffLayout";
import WarehouseStaffPage from "../pages/WarehouseStaff/WarehouseStaffPage";
import WarehouseStaffWareHouse from "../pages/WarehouseStaff/Warehouse/WareHouse";
import ProfileManagement from "../pages/ProfileManagement/ProfileManagerment";
import UpdatePassword from "../pages/ProfileManagement/UpdatePassword"; 
import PrivateRoute from "../components/PrivateRouter/index"
import AdminLayout from "../layout/AdminLayout";
// import AdminPage from "../pages/AdminPage";
import ContactListPage from "../pages/ContactManagement/ContactListPage";
import ContactDetailPage from "../pages/ContactManagement/ContactDetailPage";
import ContactEditPage from "../pages/ContactManagement/ContactEditPage";
import NewsPage from "../pages/NewsPage";
import NewsDetailPage from "../pages/NewsDetailPage";
import NewsListPage from "../pages/Admin/News/NewsListPage";
import NewsFormPage from "../pages/Admin/News/NewsFormPage";
import AdminNewsDetailPage from "../pages/Admin/News/NewsDetailPage";
import ShopManagement from "../pages/Admin/Shop/ShopManagement";
import AboutUsPage from "../pages/AboutUsPage";
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
  {
    path: "/news",
    element: <NewsPage />,
  },
  {
    path: "/news/:id",
    element: <NewsDetailPage />,
  },
  {
    path: "/about",
    element: <AboutUsPage />,
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
      { path: "contact", element: <ContactPage /> },
      { path: "contact-history", element: <ContactHistoryPage /> },
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
      { path: "shop", element: <ShopManagement /> },
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
      { path: "news", element: <NewsListPage /> },
      { path: "news/create", element: <NewsFormPage /> },
      { path: "news/edit/:id", element: <NewsFormPage /> },
      { path: "news/:id", element: <AdminNewsDetailPage /> },
      { path: "shop", element: <ShopManagement /> },
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