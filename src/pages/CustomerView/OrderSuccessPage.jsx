import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

export default function OrderSuccessPage() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className={`text-center transition-all duration-700 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 shadow-lg">
          <Check className="w-14 h-14 text-white" strokeWidth={3} />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Đặt Hàng Thành Công!</h1>
        
        <p className="text-gray-600 mb-8 text-lg">Cảm ơn bạn đã mua hàng</p>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md">
          Xem chi tiết đơn hàng
        </button>
      </div>
    </div>
  );
}