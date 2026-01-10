import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Home, Key, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import {
    registerSendOTPRequest,
    clearAuthMessages,
    registerConfirmOTPRequest
} from '../redux/actions/authActions';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        registerLoading,
        registerMessage,
        registerError,
        confirmOtpLoading,
        confirmOtpMessage,
        confirmRegisterSuccess,
        confirmOtpError
    } = useSelector(state => state.auth);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        user_name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        otp: ''
    });
    const [errors, setErrors] = useState({});

    // 👇 Thêm state hiển thị mật khẩu
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        dispatch(clearAuthMessages());
        return () => {
            dispatch(clearAuthMessages());
        };
    }, [dispatch]);

    useEffect(() => {
        if (confirmRegisterSuccess) {
            setTimeout(() => {
                navigate('/');
            }, 1000);
        }
    }, [confirmRegisterSuccess, navigate]);

    useEffect(() => {
        if (registerMessage && step === 1) {
            setStep(2);
        }
    }, [registerMessage, step]);

    useEffect(() => {
        if (confirmOtpMessage) {
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    }, [confirmOtpMessage, navigate]);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => password.length >= 6;

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSendOTP = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.user_name) newErrors.user_name = 'Vui lòng nhập tên';
        if (!formData.email) newErrors.email = 'Vui lòng nhập email';
        else if (!validateEmail(formData.email)) newErrors.email = 'Email không hợp lệ';
        if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
        else if (!validatePassword(formData.password)) newErrors.password = 'Mật khẩu ít nhất 8 ký tự';
        if (!formData.phone) newErrors.phone = 'Vui lòng nhập số điện thoại';
        if (!formData.address) newErrors.address = 'Vui lòng nhập địa chỉ';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        dispatch(registerSendOTPRequest(formData));
    };

    const handleConfirmOTP = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.otp) newErrors.otp = 'Vui lòng nhập mã OTP';
        else if (formData.otp.length !== 6) newErrors.otp = 'OTP phải có 6 số';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        dispatch(registerConfirmOTPRequest({ email: formData.email, otp: formData.otp }));
    };

    const handleBackToStep1 = () => {
        setStep(1);
        setFormData(prev => ({ ...prev, otp: '' }));
        setErrors({});
        dispatch(clearAuthMessages());
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center relative overflow-hidden px-4"
            style={{ background: 'linear-gradient(135deg, #0D364C 0%, #13C2C2 100%)' }}
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ backgroundColor: '#13C2C2' }}></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000" style={{ backgroundColor: '#0D364C' }}></div>
                <div className="absolute top-40 left-40 w-60 h-60 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse animation-delay-4000" style={{ backgroundColor: '#13C2C2' }}></div>
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 10}s`,
                            animationDuration: `${10 + Math.random() * 20}s`
                        }}
                    ></div>
                ))}
            </div>
            <div className="relative z-10 w-full max-w-2xl p-6 sm:p-8">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">

                    <Link
                        to="/login"
                        className="inline-flex items-center text-white/80 hover:text-white mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại đăng nhập
                    </Link>

                    <div className="text-center mb-8">
                        <div
                            className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #13C2C2 0%, #0D364C 100%)' }}
                        >
                            {step === 1 ? (
                                <User className="w-10 h-10 text-white" />
                            ) : (
                                <Key className="w-10 h-10 text-white" />
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {step === 1 ? 'Đăng Ký' : 'Xác Nhận OTP'}
                        </h1>
                        <p className="text-gray-300">
                            {step === 1
                                ? 'Nhập thông tin để tạo tài khoản'
                                : 'Nhập mã OTP đã được gửi đến email'}
                        </p>
                    </div>

                    {registerError && <p className="text-red-300 text-center mb-4">{registerError}</p>}
                    {confirmOtpError && <p className="text-red-300 text-center mb-4">{confirmOtpError}</p>}

                    {/* Step 1 */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <InputField
                                icon={<User />}
                                placeholder="Tên người dùng"
                                value={formData.user_name}
                                onChange={(e) => handleInputChange('user_name', e.target.value)}
                                error={errors.user_name}
                            />
                            <InputField
                                icon={<Mail />}
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                error={errors.email}
                            />
                            {/* Password with Eye toggle */}
                            <InputField
                                icon={<Lock />}
                                type={showPassword ? "text" : "password"}
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                error={errors.password}
                                togglePassword={() => setShowPassword(!showPassword)}
                                showPassword={showPassword}
                            />
                            <InputField
                                icon={<Phone />}
                                placeholder="Số điện thoại"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                error={errors.phone}
                            />
                            <InputField
                                icon={<Home />}
                                placeholder="Địa chỉ"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                error={errors.address}
                            />

                            <SubmitButton
                                loading={registerLoading}
                                text="Gửi mã OTP"
                                loadingText="Đang gửi..."
                            />
                        </form>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <form onSubmit={handleConfirmOTP} className="space-y-6">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-sm text-gray-300">Mã OTP đã gửi đến:</p>
                                <p className="text-white font-medium">{formData.email}</p>
                            </div>

                            <InputField
                                icon={<Key />}
                                placeholder="Nhập OTP (6 số)"
                                value={formData.otp}
                                onChange={(e) =>
                                    handleInputChange(
                                        'otp',
                                        e.target.value.replace(/\D/g, '').slice(0, 6)
                                    )
                                }
                                error={errors.otp}
                            />

                            <SubmitButton
                                loading={confirmOtpLoading}
                                text="Xác nhận OTP"
                                loadingText="Đang xác nhận..."
                            />

                            <button
                                type="button"
                                onClick={handleBackToStep1}
                                className="w-full text-white/80 hover:text-white py-3 px-6 rounded-2xl border border-white/20 transition"
                            >
                                Gửi lại thông tin
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// InputField chỉnh để hỗ trợ Eye/EyeOff
const InputField = ({ icon, type = "text", placeholder, value, onChange, error, togglePassword, showPassword }) => (
    <div>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {icon}
            </div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`w-full pl-12 pr-12 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-400 
                focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:bg-white/10 
                ${error ? 'border-red-500/50' : 'border-white/20'}`}
            />
            {togglePassword && (
                <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            )}
        </div>
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
);

<style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    25% { transform: translateY(-20px) translateX(10px); }
                    50% { transform: translateY(-10px) translateX(-10px); }
                    75% { transform: translateY(-30px) translateX(5px); }
                }
                
                .animate-float {
                    animation: float linear infinite;
                }
                
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>

const SubmitButton = ({ loading, text, loadingText }) => (
    <button
        type="submit"
        disabled={loading}
        className="w-full relative overflow-hidden text-white font-bold py-4 px-6 rounded-2xl 
        transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 disabled:opacity-50"
        style={{
            background: `linear-gradient(135deg, #13C2C2 0%, #0D364C 100%)`,
            boxShadow: `0 0 20px rgba(19, 194, 194, 0.3)`
        }}
    >
        {loading ? (
            <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {loadingText}
            </div>
        ) : (
            text
        )}
    </button>
);

export default Register;
