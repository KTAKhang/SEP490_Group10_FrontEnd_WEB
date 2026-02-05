import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, Sparkles, X } from "lucide-react";

export default function PreOrderPaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const status = searchParams.get("status") || "failed";
  const isSuccess = status === "success";

  useEffect(() => {
    setAnimate(true);
  }, []);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-blue-50 to-purple-100 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />

        <div
          className={`relative bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full transition-all duration-1000 ${animate ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-10"}`}
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 bg-green-400 rounded-full opacity-20 animate-ping" />
            </div>
            <div className="relative inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg mx-auto">
              <Check className="w-16 h-16 text-white" strokeWidth={3} />
            </div>
            <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-yellow-400 animate-bounce" />
            <Sparkles className="absolute bottom-2 left-1/4 w-5 h-5 text-yellow-300 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
              Pre-order successful
            </h1>
            <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold px-6 py-2 rounded-full text-lg mb-4 shadow-md">
              ✓ Deposit paid
            </div>
            <p className="text-gray-600 text-lg mt-4">
              Your pre-order has been recorded. You can view and pay the remaining balance after we allocate stock.
            </p>
          </div>

          <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mx-auto mb-8" />

          <button
            type="button"
            onClick={() => navigate("/customer/my-pre-orders")}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            View my pre-orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-pink-100 flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className={`relative bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full transition-all duration-1000 mt-20 ${animate ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-10"}`}
      >
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-r from-red-400 to-red-500 rounded-full shadow-lg">
            <X className="w-16 h-16 text-white" strokeWidth={3} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            Payment unsuccessful
          </h1>
          <div className="inline-block bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-6 py-2 rounded-full text-lg mb-4 shadow-md">
            ✗ Transaction unsuccessful
          </div>
          <p className="text-gray-600 text-lg mt-4">
            Your pre-order deposit could not be completed. You can try again from the Pre-order page.
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

        <div className="w-16 h-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-full mx-auto mb-8" />

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate("/customer/pre-orders")}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Back to Pre-order
          </button>
          <button
            type="button"
            onClick={() => navigate("/customer")}
            className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-all duration-200"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
