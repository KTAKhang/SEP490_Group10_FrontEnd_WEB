import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  clearDiscountFeedback,
  discountGetValidRequest,
  setSelectedDiscount,
} from "../../redux/actions/discountActions";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

const VoucherCard = ({ voucher, onApply }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col gap-4 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Discount Code</p>
          <p className="text-2xl font-black text-green-600 tracking-wide">
            {voucher.code}
          </p>
        </div>
        <span className="px-4 py-1.5 text-sm font-bold bg-green-50 text-green-700 rounded-full border-2 border-green-600">
          -{voucher.discountPercent}%
        </span>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">
        {voucher.description || "No description available"}
      </p>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Minimum Order</p>
          <p className="font-bold text-gray-900">
            {formatCurrency(voucher.minOrderValue)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Maximum Discount</p>
          <p className="font-bold text-gray-900">
            {formatCurrency(voucher.maxDiscountAmount)}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-600 mb-1">Expiration Date</p>
        <p className="font-bold text-gray-900">
          {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
        </p>
      </div>

      {/* Thanh progress số lượt đã sử dụng */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="font-medium text-gray-600">Used Count</span>
          <span className="font-semibold text-gray-900">
            {voucher.usedCount ?? 0}
            {voucher.usageLimit != null ? ` / ${voucher.usageLimit}` : " (unlimited)"}
          </span>
        </div>
        {voucher.usageLimit != null ? (
          <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, ((voucher.usedCount ?? 0) / voucher.usageLimit) * 100)}%`,
              }}
            />
          </div>
        ) : (
          <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full opacity-60"
              style={{ width: "100%" }}
            />
          </div>
        )}
      </div>

      <button
        onClick={() => onApply(voucher)}
        className="mt-2 w-full bg-gray-900 text-white rounded-full px-6 py-3 font-bold hover:bg-gray-800 transition-colors duration-200"
      >
        Apply Voucher
      </button>
    </div>
  );
};

export default function VoucherPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { validDiscounts, loading } = useSelector((state) => state.discount);

  useEffect(() => {
    dispatch(discountGetValidRequest());
    dispatch(clearDiscountFeedback());
  }, [dispatch]);

  const handleApplyVoucher = (voucher) => {
    dispatch(
      setSelectedDiscount({
        discountId: voucher._id,
        code: voucher.code,
        discountPercent: voucher.discountPercent,
        minOrderValue: voucher.minOrderValue,
        maxDiscountAmount: voucher.maxDiscountAmount,
        endDate: voucher.endDate,
        description: voucher.description,
      })
    );
    navigate("/customer/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              Choose Discount Voucher
            </h1>
            <p className="text-gray-600 text-lg">
              Apply discount codes to get the best deals for your order
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-900 hover:text-green-600 font-bold transition-colors duration-200"
          >
            <i className="ri-arrow-left-line text-xl"></i>
            Go Back
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading vouchers...</p>
            </div>
          </div>
        ) : validDiscounts?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {validDiscounts.map((voucher) => (
              <VoucherCard
                key={voucher._id}
                voucher={voucher}
                onApply={handleApplyVoucher}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <i className="ri-coupon-3-line text-4xl text-gray-400"></i>
            </div>
            <p className="text-gray-600 text-lg font-medium">
              No valid discount codes available
            </p>
            <p className="text-gray-500 mt-2">
              Please check back later for exciting offers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}