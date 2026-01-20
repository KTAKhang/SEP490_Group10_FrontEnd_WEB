import React, { useState, useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';

export default function OrderSuccessPage() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-blue-50 to-purple-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      
      <div className={`relative bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full transition-all duration-1000 ${animate ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10'}`}>
        {/* Success Icon with animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 bg-green-400 rounded-full opacity-20 animate-ping"></div>
          </div>
          <div className="relative inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg mx-auto">
            <Check className="w-16 h-16 text-white" strokeWidth={3} />
          </div>
          <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-yellow-400 animate-bounce" />
          <Sparkles className="absolute bottom-2 left-1/4 w-5 h-5 text-yellow-300 animate-bounce delay-300" />
        </div>
        
        {/* Success Messages */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            Đặt Hàng Thành Công!
          </h1>
          
          <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold px-6 py-2 rounded-full text-lg mb-4 shadow-md">
            ✓ Thanh Toán Thành Công
          </div>
          
          <p className="text-gray-600 text-lg mt-4">
            Cảm ơn bạn đã tin tưởng và mua hàng
          </p>
        </div>
        
        {/* Divider */}
        <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mx-auto mb-8"></div>
        
        {/* Button */}
        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          Xem chi tiết đơn hàng
        </button>
      </div>
    </div>
  );
}