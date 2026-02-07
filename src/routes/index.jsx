import { Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ForgotPassword from "../pages/ForgotPassword";
import NotFoundPage from "../pages/NotFoundPage";
import Register from "../pages/Register";
import HomePage from "../pages/CustomerView/HomePage";
import ContactPage from "../pages/ContactPage";
import ContactHistoryPage from "../pages/CustomerView/ContactHistoryPage";
import AuthenticatedRoute from "../components/AuthenticatedRoute";
import ProdcutPage from "../pages/CustomerView/ProductPage";
import ProductDetailPage from "../pages/CustomerView/ProductDetailPage";
import Categories from "../pages/CustomerView/CategoryPage";
import WishlistPage from "../pages/CustomerView/WishlistPage";
import FruitBasketPage from "../pages/CustomerView/FruitBasketPage";
import FruitBasketDetail from "../pages/CustomerView/FruitBasketDetail";
import CustomerLayout from "../layout/CustomerLayout";
import FeedbackStaffLayout from "../layout/FeedbackStaffLayout";
import AdminLayout from "../layout/AdminLayout";
import AdminPage from "../pages/Admin/AdminPage/AdminPage";
import WareHouse from "../pages/Admin/Warehouse/WareHouse";
import CategoryManagement from "../pages/Admin/Category/CategoryManagement";
import BatchHistoryPage from "../pages/Admin/BatchHistory/BatchHistoryPage";
import ReceiptHistoryPage from "../pages/Admin/ReceiptHistory/ReceiptHistoryPage";
import OrderLogHistoryPage from "../pages/Admin/OrderLogHistory/OrderLogHistoryPage";
import WarehouseStaffLayout from "../layout/WarehouseStaffLayout";
import WarehouseStaffPage from "../pages/WarehouseStaff/WarehouseStaffPage";
import WarehouseStaffWareHouse from "../pages/WarehouseStaff/Warehouse/WareHouse";
import PreOrderStockPage from "../pages/WarehouseStaff/PreOrderStock/PreOrderStockPage";
import ProfileManagement from "../pages/ProfileManagement/ProfileManagerment";
import UpdatePassword from "../pages/ProfileManagement/UpdatePassword";
import PrivateRoute from "../components/PrivateRouter/index";
import ContactListPage from "../pages/ContactManagement/ContactListPage";
import ContactDetailPage from "../pages/ContactManagement/ContactDetailPage";
import ContactEditPage from "../pages/ContactManagement/ContactEditPage";
import ChatForStaffPage from "../pages/FeedbackStaff/ChatForStaffPage";
// Admin Supplier Management
import AdminSupplierManagement from "../pages/Admin/Supplier/SupplierManagement";
// Admin Harvest Batch Management
import AdminHarvestBatchManagement from "../pages/Admin/HarvestBatch/HarvestBatchManagement";
import AdminFruitBasketPage from "../pages/Admin/FruitBasket/FruitBasketPage";

import CartPage from "../pages/CustomerView/CartPage";
import CheckoutPage from "../pages/CustomerView/CheckoutPage";
import StaffManagement from "../pages/StaffManagement/StaffManagement";
import CustomerManagement from "../pages/customerManagement/customerManagementPage";
import AdminDiscountManagement from "../pages/discountManagement/AdminManagementPage";
import StaffDiscountManagement from "../pages/discountManagement/StaffManagementPage";
import SalesStaffPage from "../pages/SalesStaff/SalesStaffPage";
import SalesStaffOrderManagement from "../pages/SalesStaff/OrderManagement/OrderManagement";
import FinanceLayout from "../layout/FinanceLayout";
import NewsPage from "../pages/NewsPage";
import NewsDetailPage from "../pages/NewsDetailPage";
import NewsListPage from "../pages/Admin/News/NewsListPage";
import NewsFormPage from "../pages/Admin/News/NewsFormPage";
import AdminNewsDetailPage from "../pages/Admin/News/NewsDetailPage";
import ShopManagement from "../pages/Admin/Shop/ShopManagement";
import HomepageAssetsManagement from "../pages/Admin/HomepageAssets/HomepageAssetsManagement";
import AboutUsPage from "../pages/AboutUsPage";
import OrderSuccessPage from "../pages/CustomerView/OrderSuccessPage";
import PaymentSuccessPage from "../pages/CustomerView/PaymentSuccessPage";
import PaymentSuccessNoStockPage from "../pages/CustomerView/PaymentSuccessNoStockPage";
import PaymentFailPage from "../pages/CustomerView/PaymentFailPage";
import VoucherPage from "../pages/CustomerView/VoucherPage";
import OrderHistory from "../pages/CustomerView/OrderHistory";
import OrderHistoryDetail from "../pages/CustomerView/OrderHistoryDetail";
import OrderManagement from "../pages/Admin/OrderManagement/OrderManagement";
import FruitTypeManagement from "../pages/Admin/PreOrder/FruitTypeManagement";
import PreOrderDemandPage from "../pages/Admin/PreOrder/PreOrderDemandPage";
import PreOrderListPage from "../pages/Admin/PreOrder/PreOrderListPage";
import PreOrderImportPage from "../pages/Admin/PreOrder/PreOrderImportPage";
import AdminPreOrderLayout from "../layout/AdminPreOrderLayout";
import PreOrdersPage from "../pages/CustomerView/PreOrdersPage";
import PreOrderDetailPage from "../pages/CustomerView/PreOrderDetailPage";
import PreOrderCheckoutPage from "../pages/CustomerView/PreOrderCheckoutPage";
import MyPreOrdersPage from "../pages/CustomerView/MyPreOrdersPage";
import PreOrderPaymentResultPage from "../pages/CustomerView/PreOrderPaymentResultPage";
import ReviewManagement from "../pages/Admin/Review/ReviewManagement";
import CreateReview from "../pages/CustomerView/ReviewProduct/CreateReview";
import EditReview from "../pages/CustomerView/ReviewProduct/EditReview";


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
    path: "/fruit-baskets",
    element: <FruitBasketPage />,
  },
  {
    path: "/fruit-baskets/:id",
    element: <FruitBasketDetail />,
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
      { path: "reviews/create", element: <CreateReview /> },
      { path: "reviews/:reviewId/edit", element: <EditReview /> },
      { path: "contact", element: <ContactPage /> },
      { path: "contact-history", element: <ContactHistoryPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "vouchers", element: <VoucherPage /> },
      { path: "orders", element: <OrderHistory /> },
      { path: "payment-success-nostock", element: <PaymentSuccessNoStockPage /> },
      { path: "pre-orders", element: <PreOrdersPage /> },
      { path: "pre-orders/:id", element: <PreOrderDetailPage /> },
      { path: "preorder-checkout", element: <PreOrderCheckoutPage /> },
      { path: "my-pre-orders", element: <MyPreOrdersPage /> },
      { path: "preorder-payment-result", element: <PreOrderPaymentResultPage /> },
      { path: "orders/:orderId", element: <OrderHistoryDetail /> },
      { path: "order-success", element: <OrderSuccessPage /> },
      { path: "payment-result", element: <PaymentSuccessPage /> },
      { path: "payment-fail", element: <PaymentFailPage /> },
    ],
  },

  {
    path: "/feedbacked-staff",
    element: (
      <PrivateRoute requiredRole="feedbacked-staff">
        <FeedbackStaffLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <ChatForStaffPage /> },
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
      { path: "profile", element: <ProfileManagement /> },
      { path: "change-password", element: <UpdatePassword /> },
      { path: "warehouse", element: <WareHouse /> },
      { path: "category", element: <CategoryManagement /> },
      { path: "suppliers", element: <AdminSupplierManagement /> },
      { path: "harvest-batches", element: <AdminHarvestBatchManagement /> },
      { path: "fruit-baskets", element: <AdminFruitBasketPage /> },
      { path: "batch-history", element: <BatchHistoryPage /> },
      { path: "receipt-history", element: <ReceiptHistoryPage /> },
      { path: "order-log-history", element: <OrderLogHistoryPage /> },
      { path: "contacts", element: <ContactListPage /> },
      { path: "contacts/:id", element: <ContactDetailPage /> },
      { path: "contacts/:id/edit", element: <ContactEditPage /> },
      { path: "staff", element: <StaffManagement /> },
      { path: "customers", element: <CustomerManagement /> },
      { path: "discounts", element: <AdminDiscountManagement /> },
      { path: "orders", element: <OrderManagement /> },
      {
        path: "preorder",
        element: <AdminPreOrderLayout />,
        children: [
          { index: true, element: <Navigate to="fruits" replace /> },
          { path: "fruits", element: <FruitTypeManagement /> },
          { path: "demand", element: <PreOrderDemandPage /> },
          { path: "import", element: <PreOrderImportPage /> },
          { path: "orders", element: <PreOrderListPage /> },
        ],
      },
      { path: "reviews", element: <ReviewManagement /> },
      { path: "news", element: <NewsListPage /> },
      { path: "news/create", element: <NewsFormPage /> },
      { path: "news/edit/:id", element: <NewsFormPage /> },
      { path: "news/:id", element: <AdminNewsDetailPage /> },
      { path: "shop", element: <ShopManagement /> },
      { path: "homepage-assets", element: <HomepageAssetsManagement /> },
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
      { path: "profile", element: <ProfileManagement /> },
      { path: "change-password", element: <UpdatePassword /> },
      { path: "warehouse", element: <WarehouseStaffWareHouse /> },
      { path: "preorder-stock", element: <PreOrderStockPage /> },
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
      { path: "orders", element: <SalesStaffOrderManagement /> },
      { path: "discounts", element: <StaffDiscountManagement /> },
    ],
  },

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
