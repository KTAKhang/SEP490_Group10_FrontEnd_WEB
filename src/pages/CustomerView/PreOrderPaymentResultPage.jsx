import { useSearchParams, useNavigate } from "react-router-dom";

export default function PreOrderPaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status") || "failed";
  const isSuccess = status === "success";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {isSuccess ? (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-check-line text-4xl text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Pre-order payment successful</h1>
            <p className="text-gray-600 mb-6">Your pre-order has been recorded.</p>
          </>
        ) : (
          <>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-close-line text-4xl text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Payment unsuccessful</h1>
            <p className="text-gray-600 mb-6">You can try pre-ordering again from the Pre-order page.</p>
          </>
        )}
        <button
          type="button"
          onClick={() => navigate(isSuccess ? "/customer/my-pre-orders" : "/customer/pre-orders")}
          className="w-full py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
        >
          {isSuccess ? "View my pre-orders" : "Back to Pre-order"}
        </button>
      </div>
    </div>
  );
}
