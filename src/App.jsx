import { useEffect } from "react";
import AllRoutes from "./components/AllRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import FirebaseNotificationProvider from "./components/FirebaseNotificationProvider";

export default function App() {
  // Khi load/reload trang luôn scroll lên đầu
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <AuthProvider>
      <FirebaseNotificationProvider>
        <AllRoutes />
        <ToastContainer
          position="top-right"
          autoClose={500} // ⏰ THÊM DÒNG NÀY - 3000ms = 3 giây
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </FirebaseNotificationProvider>
    </AuthProvider>
  );
}