import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Key, ArrowLeft, CheckCircle, Send, Eye, EyeOff } from 'lucide-react';
import { forgotPasswordRequest, resetPasswordRequest, clearAuthMessages } from '../redux/actions/authActions';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const {
        forgotPasswordLoading,
        forgotPasswordMessage,
        forgotPasswordError,
        resetPasswordLoading,
        resetPasswordMessage,
        resetPasswordError
    } = useSelector(state => state.auth);

    const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & new password
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    // Clear messages when component mounts
    useEffect(() => {
        dispatch(clearAuthMessages());
        return () => {
            dispatch(clearAuthMessages());
        };
    }, [dispatch]);

    // Handle forgot password success
    useEffect(() => {
        if (forgotPasswordMessage && step === 1) {
            setStep(2);
        }
    }, [forgotPasswordMessage, step]);

    // Handle reset password success
    useEffect(() => {
        if (resetPasswordMessage) {
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        }
    }, [resetPasswordMessage, navigate]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSendOTP = (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        dispatch(forgotPasswordRequest(formData.email));
    };

    const handleResetPassword = (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!formData.otp) {
            newErrors.otp = 'Vui lòng nhập mã OTP';
        } else if (formData.otp.length !== 6) {
            newErrors.otp = 'Mã OTP phải có 6 số';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (!validatePassword(formData.newPassword)) {
            newErrors.newPassword = 'Mật khẩu phải có 8 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        dispatch(resetPasswordRequest(formData.email, formData.otp, formData.newPassword));
    };

    const handleBackToStep1 = () => {
        setStep(1);
        setFormData(prev => ({ ...prev, otp: '', newPassword: '', confirmPassword: '' }));
        setErrors({});
        dispatch(clearAuthMessages());
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D364C 0%, #13C2C2 100%)' }}>
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

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-2xl p-8">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-500">

                    {/* Back to Login Link */}
                    <Link
                        to="/login"
                        className="inline-flex items-center text-white/80 hover:text-white transition-colors duration-200 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại đăng nhập
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500" style={{ background: 'linear-gradient(135deg, #13C2C2 0%, #0D364C 100%)' }}>
                            {step === 1 ? <Mail className="w-10 h-10 text-white" /> : <Key className="w-10 h-10 text-white" />}
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {step === 1 ? 'Quên Mật Khẩu' : 'Đặt Lại Mật Khẩu'}
                        </h1>
                        <p className="text-gray-300">
                            {step === 1
                                ? 'Nhập email để nhận mã OTP'
                                : 'Nhập mã OTP và mật khẩu mới'
                            }
                        </p>
                    </div>

                    {/* Success Message */}
                    {forgotPasswordMessage && step === 2 && (
                        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl">
                            <div className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-green-300 mr-2" />
                                <p className="text-green-300 text-sm">{forgotPasswordMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Error Messages */}
                    {(forgotPasswordError || resetPasswordError) && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl">
                            <p className="text-red-300 text-sm text-center">
                                {forgotPasswordError || resetPasswordError}
                            </p>
                        </div>
                    )}

                    {/* Step 1: Enter Email */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 transition-colors duration-200" />
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:bg-white/10 ${errors.email ? 'border-red-500/50' : 'border-white/20'
                                            }`}
                                        style={{ '--tw-ring-color': '#13C2C2', '--tw-ring-opacity': '0.5' }}
                                        placeholder="Nhập email của bạn"
                                        disabled={forgotPasswordLoading}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-300">{errors.email}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={forgotPasswordLoading || !formData.email}
                                className="w-full relative overflow-hidden text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                style={{
                                    background: `linear-gradient(135deg, #13C2C2 0%, #0D364C 100%)`,
                                    boxShadow: `0 0 20px rgba(19, 194, 194, 0.3)`,
                                    '--tw-ring-color': '#13C2C2',
                                    '--tw-ring-opacity': '0.5'
                                }}
                            >
                                {forgotPasswordLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Đang gửi...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <Send className="w-5 h-5 mr-2" />
                                        <span className="relative z-10">Gửi mã OTP</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100" style={{ background: `linear-gradient(135deg, #0D364C 0%, #13C2C2 100%)` }}></div>
                            </button>
                        </form>
                    )}

                    {/* Step 2: Enter OTP and New Password */}
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            {/* Email Display */}
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-sm text-gray-300">Mã OTP đã được gửi đến:</p>
                                <p className="text-white font-medium">{formData.email}</p>
                            </div>

                            {/* OTP Input */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Mã OTP (6 số)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Key className="h-5 w-5 text-gray-400 transition-colors duration-200" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.otp}
                                        onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:bg-white/10 text-center text-2xl tracking-widest ${errors.otp ? 'border-red-500/50' : 'border-white/20'
                                            }`}
                                        style={{ '--tw-ring-color': '#13C2C2', '--tw-ring-opacity': '0.5' }}
                                        placeholder="000000"
                                        maxLength="6"
                                        disabled={resetPasswordLoading}
                                    />
                                </div>
                                {errors.otp && (
                                    <p className="mt-2 text-sm text-red-300">{errors.otp}</p>
                                )}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 transition-colors duration-200" />
                                </div>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={formData.newPassword}
                                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                    className={`w-full pl-12 pr-12 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:bg-white/10 ${errors.newPassword ? 'border-red-500/50' : 'border-white/20'}`}
                                    style={{ '--tw-ring-color': '#13C2C2', '--tw-ring-opacity': '0.5' }}
                                    placeholder="Nhập mật khẩu mới"
                                    disabled={resetPasswordLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 transition-colors duration-200 hover:text-white"
                                    disabled={resetPasswordLoading}
                                >
                                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="mt-2 text-sm text-red-300">{errors.newPassword}</p>
                            )}


                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 transition-colors duration-200" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    className={`w-full pl-12 pr-12 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:bg-white/10 ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/20'}`}
                                    style={{ '--tw-ring-color': '#13C2C2', '--tw-ring-opacity': '0.5' }}
                                    placeholder="Xác nhận mật khẩu mới"
                                    disabled={resetPasswordLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 transition-colors duration-200 hover:text-white"
                                    disabled={resetPasswordLoading}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-300">{errors.confirmPassword}</p>
                            )}


                            {/* Action Buttons */}
                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    disabled={resetPasswordLoading || !formData.otp || !formData.newPassword || !formData.confirmPassword}
                                    className="w-full relative overflow-hidden text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    style={{
                                        background: `linear-gradient(135deg, #13C2C2 0%, #0D364C 100%)`,
                                        boxShadow: `0 0 20px rgba(19, 194, 194, 0.3)`,
                                        '--tw-ring-color': '#13C2C2',
                                        '--tw-ring-opacity': '0.5'
                                    }}
                                >
                                    {resetPasswordLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Đang đặt lại...
                                        </div>
                                    ) : (
                                        <span className="relative z-10">Đặt lại mật khẩu</span>
                                    )}
                                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100" style={{ background: `linear-gradient(135deg, #0D364C 0%, #13C2C2 100%)` }}></div>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleBackToStep1}
                                    disabled={resetPasswordLoading}
                                    className="w-full text-white/80 hover:text-white py-3 px-6 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 disabled:opacity-50"
                                >
                                    Gửi lại mã OTP
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

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
        </div>
    );
};

export default ForgotPassword; 