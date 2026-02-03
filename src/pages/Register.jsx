import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  Home,
  Key,
  Eye,
  EyeOff,
  ArrowLeft,
  MapPinned,
  CalendarDays,
} from "lucide-react";
import {
  registerSendOTPRequest,
  registerConfirmOTPRequest,
  clearAuthMessages,
} from "../redux/actions/authActions";
import Header from "../components/Header/Header";
import axios from "axios";
const API_BASE = "https://provinces.open-api.vn/api/v2";
const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    registerLoading,
    registerMessage,
    registerError,
    confirmOtpLoading,
    confirmOtpMessage,
    confirmOtpError,
    confirmRegisterSuccess,
  } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    ward: "",
    otp: "",
    birthday: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});
  const [wards, setWards] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [icity, setIcity] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/p/`)
      .then((res) => setProvinces(res.data))
      .catch((err) => console.error("Error loading provinces:", err));
  }, []);

  // Load wards when province changes
  useEffect(() => {
    if (!formData.city) {
      setWards([]);
      setFormData((prev) => ({ ...prev, ward: "" }));
      return;
    }

    axios
      .get(`${API_BASE}/w/`)
      .then((res) => {
        const filtered = res.data.filter(
          (ward) => ward.province_code === Number(formData.city),
        );
        setWards(filtered);
      })
      .catch((err) => console.error(err));
  }, [formData.city]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "city") {
      const selectedProvince = provinces.find((p) => p.code === Number(value));
      setIcity(selectedProvince ? selectedProvince.name : "");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    dispatch(clearAuthMessages());
    return () => dispatch(clearAuthMessages());
  }, [dispatch]);

  useEffect(() => {
    if (registerMessage && step === 1) setStep(2);
  }, [registerMessage, step]);

  useEffect(() => {
    if (confirmRegisterSuccess || confirmOtpMessage) {
      setTimeout(() => navigate("/login"), 1200);
    }
  }, [confirmRegisterSuccess, confirmOtpMessage, navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    const err = {};

    if (!formData.user_name) err.user_name = "Please, enter user name!";
    if (!formData.email) err.email = "Please, enter email!";
    else if (!validateEmail(formData.email)) err.email = "Email invalid";
    if (!formData.password) err.password = "Please, enter password!";
    if (!formData.phone) err.phone = "Please, enter phone number!";
    if (!formData.address) err.address = "Please, enter address!";
    if (!formData.city) err.city = "Please, chose city or province!";
    if (!formData.ward) err.ward = "Please, chose ward!";

    if (!formData.birthday) err.birthday = "Please, chose your birthday!";
    else {
      const dob = new Date(formData.birthday);
      if (isNaN(dob.getTime())) err.birthday = "Birthday invalid!";
      else if (dob > new Date())
        err.birthday = "A birth date cannot be in the future!";
    }
    if (!formData.gender) err.gender = "Please, chose your gender!";

    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    const buildRegisterInfo = () => ({
      user_name: formData.user_name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: `${formData.address}, ${formData.ward}, ${icity}`,
      birthday: formData.birthday,
      gender: formData.gender,
    });

    dispatch(registerSendOTPRequest(buildRegisterInfo()));
  };

  const handleConfirmOTP = (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      setErrors({ otp: "OTP phải đủ 6 số" });
      return;
    }

    dispatch(
      registerConfirmOTPRequest({
        email: formData.email,
        otp: formData.otp,
      }),
    );
  };

  return (
    <>
      {/* <Header /> */}
      <div className="min-h-screen flex items-center justify-center bg-[#F9FEFB] px-5">
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
          {/* Back */}
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-5"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to login
          </Link>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              {step === 1 ? (
                <User className="w-7 h-7 text-white" />
              ) : (
                <Key className="w-7 h-7 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 1 ? "Sign Up" : "OTP Verification"}
            </h1>
            <p className="text-gray-500 mt-1">
              {step === 1
                ? "Create a new account"
                : "Enter the OTP sent to your email"}
            </p>
          </div>

          {(registerError || confirmOtpError) && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600 text-center">
                {registerError || confirmOtpError}
              </p>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <Input label="Username" icon={<User />} error={errors.user_name}>
                <input
                  value={formData.user_name}
                  onChange={(e) => handleChange("user_name", e.target.value)}
                  className={inputClass}
                />
              </Input>

              <Input label="Email" icon={<Mail />} error={errors.email}>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="example@email.com"
                  className={inputClass}
                />
              </Input>

              <Input label="Password" icon={<Lock />} error={errors.password}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </Input>

              <Input label="Phone Number" icon={<Phone />} error={errors.phone}>
                <input
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={inputClass}
                />
              </Input>

              <Input label="city" icon={<MapPinned />} error={errors.city}>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={inputClass}
                >
                  <option value="">Select city/province</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Input>

              <Input label="ward" icon={<MapPinned />} error={errors.ward}>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={handleInputChange}
                  disabled={!formData.city}
                  className={inputClass}
                >
                  <option value="">Select ward</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </Input>

              <Input label="Address" icon={<Home />} error={errors.address}>
                <input
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className={inputClass}
                />
              </Input>

              <Input
                label="Birthday"
                icon={<CalendarDays />}
                error={errors.birthday}
              >
                <input
                  type="date"
                  value={formData.birthday}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => handleChange("birthday", e.target.value)}
                  className={inputClass}
                />
              </Input>

              <Input label="Gender" icon={<User />} error={errors.gender}>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Input>

              <Submit
                loading={registerLoading}
                text="Send OTP"
                loadingText="Sending..."
              />
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleConfirmOTP} className="space-y-5">
              <Input label="OTP Code" icon={<Key />} error={errors.otp}>
                <input
                  value={formData.otp}
                  onChange={(e) =>
                    handleChange(
                      "otp",
                      e.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  className={inputClass}
                />
              </Input>

              <Submit
                loading={confirmOtpLoading}
                text="Confirm OTP"
                loadingText="Verifying..."
              />

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Go back and edit information
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

const Input = ({ label, icon, children, error }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <span className="absolute left-3 top-9 text-gray-400">{icon}</span>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const inputClass = `
w-full pl-10 pr-4 py-3
border border-gray-200 rounded-lg
text-gray-900 placeholder-gray-400
focus:outline-none focus:ring-2 focus:ring-green-500
`;

const Submit = ({ loading, text, loadingText }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
  >
    {loading ? loadingText : text}
  </button>
);

export default RegisterPage;
