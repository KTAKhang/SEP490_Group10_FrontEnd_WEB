import LoginPage from "../pages/LoginPage";
import ForgotPassword from "../pages/ForgotPassword";
import NotFoundPage from "../pages/NotFoundPage";
import Register from "../pages/Register";
import HomePage from "../pages/HomePage";
import ContactPage from "../pages/ContactPage";
import ContactHistoryPage from "../pages/CustomerView/ContactHistoryPage";
import AuthenticatedRoute from "../components/AuthenticatedRoute";
import ProdcutPage from "../pages/ProductPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import Categories from "../pages/CategoryPage";
import WishlistPage from "../pages/WishlistPage";
import CustomerLayout from "../layout/CustomerLayout";
import AdminLayout from "../layout/AdminLayout";
import AdminPage from "../pages/Admin/AdminPage/AdminPage";
import WareHouse from "../pages/Admin/Warehouse/WareHouse";
import CategoryManagement from "../pages/Admin/Category/CategoryManagement";
import BatchHistoryPage from "../pages/Admin/Warehouse/BatchHistoryPage";
import ReceiptHistoryPage from "../pages/Admin/Warehouse/ReceiptHistoryPage";
import WarehouseStaffLayout from "../layout/WarehouseStaffLayout";
import WarehouseStaffPage from "../pages/WarehouseStaff/WarehouseStaffPage";
import WarehouseStaffWareHouse from "../pages/WarehouseStaff/Warehouse/WareHouse";
import ProfileManagement from "../pages/ProfileManagement/ProfileManagerment";
import UpdatePassword from "../pages/ProfileManagement/UpdatePassword";
import PrivateRoute from "../components/PrivateRouter/index";
import ContactListPage from "../pages/ContactManagement/ContactListPage";
import ContactDetailPage from "../pages/ContactManagement/ContactDetailPage";
import ContactEditPage from "../pages/ContactManagement/ContactEditPage";
import CartPage from "../pages/CustomerView/CartPage";
import CheckoutPage from "../pages/CustomerView/CheckoutPage";
import StaffManagement from "../pages/StaffManagement/StaffManagement";
import CustomerManagement from "../pages/customerManagement/customerManagementPage";
import AdminDiscountManagement from "../pages/discountManagement/AdminManagementPage";
import StaffDiscountManagement from "../pages/discountManagement/StaffManagementPage";
import SalesStaffPage from "../pages/SalesStaff/SalesStaffPage";
import FinanceLayout from "../layout/FinanceLayout";
import NewsPage from "../pages/NewsPage";
import NewsDetailPage from "../pages/NewsDetailPage";
import NewsListPage from "../pages/Admin/News/NewsListPage";
import NewsFormPage from "../pages/Admin/News/NewsFormPage";
import AdminNewsDetailPage from "../pages/Admin/News/NewsDetailPage";
import ShopManagement from "../pages/Admin/Shop/ShopManagement";
import AboutUsPage from "../pages/AboutUsPage";
import OrderSuccessPage from "../pages/CustomerView/OrderSuccessPage";
import PaymentSuccessPage from "../pages/CustomerView/PaymentSuccessPage";

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
    path: "/products/:id",
    element: <ProductDetailPage />,
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
  {
    path: "/wishlist",
    element: (
      <PrivateRoute requiredRole="customer">
        <WishlistPage />
      </PrivateRoute>
    ),
  },
  // {
  //   path: "/contact",
  //   element: <ContactPage1 />,
  // },

 
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
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "order-success", element: <OrderSuccessPage /> },
      { path: "payment-result", element: <PaymentSuccessPage /> },
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
      { path: "batch-history", element: <BatchHistoryPage /> },
      { path: "receipt-history", element: <ReceiptHistoryPage /> },
      { path: "contacts", element: <ContactListPage /> },
      { path: "contacts/:id", element: <ContactDetailPage /> },
      { path: "contacts/:id/edit", element: <ContactEditPage /> },
      { path: "staff", element: <StaffManagement /> },
      { path: "customers", element: <CustomerManagement /> },
      { path: "discounts", element: <AdminDiscountManagement /> },
      { path: "news", element: <NewsListPage /> },
      { path: "news/create", element: <NewsFormPage /> },
      { path: "news/edit/:id", element: <NewsFormPage /> },
      { path: "news/:id", element: <AdminNewsDetailPage /> },
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

  //sale staff navigate to finance layout
  {
    path: "/sale-staff",
    element: (
      <PrivateRoute requiredRole="sales-staff">
        <FinanceLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <FinanceLayout /> },
      { path: "statistics", element: <SalesStaffPage /> },
      { path: "discounts", element: <StaffDiscountManagement /> },
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
