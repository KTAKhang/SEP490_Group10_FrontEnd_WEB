import React, { useState, useEffect } from 'react';
import { X, AlertCircle, RotateCcw } from 'lucide-react';

export default function PaymentFailPage() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-pink-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative circles */}
   
      
      <div className={`relative bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full transition-all duration-1000 mt-20 ${animate ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10'}`}>
        {/* Fail Icon with animation */}
        
        
        {/* Fail Messages */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            Payment Failed
          </h1>
          
          <div className="inline-block bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-6 py-2 rounded-full text-lg mb-4 shadow-md">
            ✗ Transaction Unsuccessful
          </div>
          
          <p className="text-gray-600 text-lg mt-4">
            Sorry, your payment could not be completed
          </p>
          
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-gray-700 text-sm font-medium mb-2">Possible reasons:</p>
            <ul className="text-gray-600 text-sm space-y-1 text-left">
              <li>• Insufficient account balance</li>
              <li>• Incorrect card information</li>
              <li>• Network connection issues</li>
              <li>• Card blocked or expired</li>
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div className="w-16 h-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-full mx-auto mb-8"></div>
        
        {/* Buttons */}
        <div className="space-y-3">
          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
           View Orders History
          </button>
        
          <button className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-all duration-200">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}