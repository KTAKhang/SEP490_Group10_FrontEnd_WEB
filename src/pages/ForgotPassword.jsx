import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Key, Eye, EyeOff, ArrowLeft } from "lucide-react";
import {
  forgotPasswordRequest,
  resetPasswordRequest,
  clearAuthMessages,
} from "../redux/actions/authActions";
import Header from "../components/Header/Header";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    forgotPasswordLoading,
    forgotPasswordMessage,
    forgotPasswordError,
    resetPasswordLoading,
    resetPasswordMessage,
    resetPasswordError,
  } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(clearAuthMessages());
    return () => dispatch(clearAuthMessages());
  }, [dispatch]);

  useEffect(() => {
    if (forgotPasswordMessage && step === 1) {
      setStep(2);
    }
  }, [forgotPasswordMessage, step]);

  useEffect(() => {
    if (resetPasswordMessage) {
      setTimeout(() => navigate("/login"), 1000);
    }
  }, [resetPasswordMessage, navigate]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrors({ email: "Vui lòng nhập email" });
      return;
    }
    dispatch(forgotPasswordRequest(formData.email));
  };

  const handleResetPassword = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.otp || formData.otp.length !== 6)
      newErrors.otp = "OTP gồm 6 số";

    if (!formData.newPassword || formData.newPassword.length < 8)
      newErrors.newPassword = "Mật khẩu tối thiểu 8 ký tự";

    if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu không khớp";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    dispatch(
      resetPasswordRequest(formData.email, formData.otp, formData.newPassword)
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#F9FEFB] px-5">
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Particles */}
          {/* {[...Array(14)].map((_, i) => (
          <span
            key={`particle-${i}`}
            className="absolute rounded-full animate-float"
            style={{
              width: `${Math.random() * 6 + 4}px`,
              height: `${Math.random() * 6 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: "rgba(34, 197, 94, 0.12)",
              animationDuration: `${6 + Math.random() * 6}s`, // 👈 NGẮN HƠN
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))} */}

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
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
          {/* Back */}
          <Link
            to="/login"
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại đăng nhập
          </Link>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              {step === 1 ? (
                <Mail className="w-7 h-7 text-white" />
              ) : (
                <Key className="w-7 h-7 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
            </h1>
            <p className="text-gray-500 mt-1">
              {step === 1
                ? "Nhập email để nhận mã OTP"
                : "Nhập OTP và mật khẩu mới"}
            </p>
          </div>

          {/* Error */}
          {(forgotPasswordError || resetPasswordError) && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600 text-center">
                {forgotPasswordError || resetPasswordError}
              </p>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="example@email.com"
                    disabled={forgotPasswordLoading}
                    className="
                    w-full pl-10 pr-4 py-3
                    border border-gray-200 rounded-lg
                    focus:ring-2 focus:ring-green-500
                    focus:border-green-500
                  "
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={forgotPasswordLoading}
                className="
                w-full bg-green-500 hover:bg-green-600
                text-white font-semibold py-3 rounded-lg
                transition disabled:opacity-50
              "
              >
                {forgotPasswordLoading ? "Đang gửi..." : "Gửi mã OTP"}
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã OTP
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) =>
                    handleChange(
                      "otp",
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  placeholder="000000"
                  className="
                  w-full text-center tracking-widest py-3
                  border border-gray-200 rounded-lg
                  focus:ring-2 focus:ring-green-500
                "
                />
                {errors.otp && (
                  <p className="text-sm text-red-500 mt-1">{errors.otp}</p>
                )}
              </div>

              {/* New password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Mật khẩu mới"
                  value={formData.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  className="
                  w-full pl-10 pr-10 py-3
                  border border-gray-200 rounded-lg
                  focus:ring-2 focus:ring-green-500
                "
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showNewPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {/* Confirm password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className="
                  w-full pl-10 pr-10 py-3
                  border border-gray-200 rounded-lg
                  focus:ring-2 focus:ring-green-500
                "
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <button
                type="submit"
                disabled={resetPasswordLoading}
                className="
                w-full bg-green-500 hover:bg-green-600
                text-white font-semibold py-3 rounded-lg
                transition disabled:opacity-50
              "
              >
                {resetPasswordLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}
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

export default ForgotPassword;
