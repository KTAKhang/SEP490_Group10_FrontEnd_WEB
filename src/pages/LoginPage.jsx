import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { loginRequest, loginGoogleRequest } from "../redux/actions/authActions";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import Header from "../components/Header/Header";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, role } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (role === "admin") navigate("/admin", { replace: true });
      if (role === "customer") navigate("/", { replace: true });
      if (role === "repair-staff" || role === "repair_staff") navigate("/staff", { replace: true });
      if (role === "sales-staff" || role === "sales_staff") navigate("/sale-staff", { replace: true });
      if (role === "warehouse-staff" || role === "warehouse_staff") navigate("/warehouse-staff", { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    dispatch(
      loginRequest({
        email: formData.email,
        password: formData.password,
      })
    );
  };

  return (
    <>
      {/* <Header /> */}
      <div className="min-h-screen flex items-center justify-center bg-[#F9FEFB] px-5 mt-5">
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Fruits */}
          <img
            src="/a1.png"
            className="absolute w-24 opacity-20 animate-float hidden md:block"
            style={{ top: "12%", left: "6%", animationDuration: "8s" }}
          />

          <img
            src="/a2.png"
            className="absolute w-28 opacity-15 animate-float hidden md:block"
            style={{ bottom: "18%", right: "8%", animationDuration: "10s" }}
          />

          <img
            src="/a1.png"
            className="absolute w-32 opacity-10 animate-float hidden lg:block"
            style={{ top: "55%", right: "30%", animationDuration: "12s" }}
          />
        </div>

        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <User className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Login</h1>
            <p className="text-gray-500 mt-1">Welcome back!</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <User className="w-5 h-5 text-gray-400" />
                </span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="example@email.com"
                  disabled={loading}
                  required
                  className="
                  w-full pl-10 pr-4 py-3
                  border border-gray-200 rounded-lg
                  text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-green-500
                  focus:border-green-500
                "
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="w-5 h-5 text-gray-400" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  disabled={loading}
                  required
                  className="
                  w-full pl-10 pr-10 py-3
                  border border-gray-200 rounded-lg
                  text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-green-500
                  focus:border-green-500
                "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
              w-full bg-green-500 hover:bg-green-600
              text-white font-semibold
              py-3 rounded-lg
              transition
              disabled:opacity-50
            "
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-3 text-sm text-gray-400">
             Log in with
            </span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(res) => {
                if (res.credential) {
                  const idToken = res.credential;
                  jwtDecode(idToken);
                  dispatch(loginGoogleRequest({ idToken }));
                }
              }}
              onError={() => console.log("Google Login Failed")}
            />
          </div>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Sign up now
            </Link>
          </p>
        </div>
        <style>{`
@keyframes float {
  0% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(60px, -80px);
  }
  50% {
    transform: translate(-50px, -40px);
  }
  75% {
    transform: translate(40px, -90px);
  }
  100% {
    transform: translate(0, 0);
  }
}

.animate-float {
  animation-name: float;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
`}</style>
      </div>
    </>
  );
};

export default LoginPage;
