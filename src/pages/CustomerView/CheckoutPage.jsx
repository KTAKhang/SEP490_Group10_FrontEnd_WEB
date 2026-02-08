import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { checkoutCancelRequest } from "../../redux/actions/checkoutActions";
import {
  fetchCartRequest,
  shippingCheckRequest,
} from "../../redux/actions/cartActions";
import {
  orderCreateRequest,
  clearOrderMessages,
} from "../../redux/actions/orderActions";
import {
  clearDiscountFeedback,
  clearSelectedDiscount,
  discountApplyRequest,
  discountGetValidRequest,
  discountValidateRequest,
  setSelectedDiscount,
} from "../../redux/actions/discountActions";
const API_BASE = "https://provinces.open-api.vn/api/v2";

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
    payment: "COD",
  });

  // State for address API
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [icity, setIcity] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const checkout = useSelector((state) => state.checkout || {});
  const cart = useSelector((state) => state.cart || {});
  const order = useSelector((state) => state.order || {});
  const discount = useSelector((state) => state.discount || {});

  // Prefer items from checkout (returned by checkout hold), otherwise fallback to cart items
  const cartItems =
    checkout.items && checkout.items.length > 0
      ? checkout.items
      : cart.items || [];

  const shippingCost = cart.shippingFee || 0;
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal + shippingCost;

  const {
    selectedDiscount,
    validDiscounts = [],
    validationResult,
    validationError,
    applyResult,
    loading: discountLoading,
  } = discount;

  const discountData = applyResult?.data || validationResult?.data || null;
  const discountAmount = discountData?.discountAmount || 0;
  const finalAmount = discountData?.finalAmount || total;

  // Load provinces on mount
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

  useEffect(() => {
    // existing ward-loading logic preserved above (omitted in snippet)

    // When city changes, call shipping check to compute fee
    const selected_product_ids = cartItems.map(
      (item) =>
        // support multiple item shapes
        (item.product_id && item.product_id._id) ||
        item.product_id ||
        item.productId ||
        item._id,
    );

    if (formData.city && selected_product_ids.length > 0) {
      dispatch(shippingCheckRequest(selected_product_ids, icity));
    }
  }, [formData.city, cartItems, dispatch]);

  useEffect(() => {
    if (order.order_id || order.payment_url) {
      localStorage.removeItem("checkout_session_id");
      dispatch(fetchCartRequest());
    }
  }, [order.order_id, order.payment_url, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "city") {
      const selectedProvince = provinces.find((p) => p.code === Number(value));
      setIcity(selectedProvince ? selectedProvince.name : "");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildReceiverInfo = () => ({
    receiver_name: formData.fullName,
    receiver_phone: formData.phone,
    receiver_address: `${formData.address}, ${formData.ward}, ${icity}`,
    note: formData.note,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!cartItems.length) {
      alert("Cart is empty");
      return;
    }

    const selected_product_ids = cartItems.map(
      (item) => item.product_id || item._id,
    );

    // VNPAY + có voucher đã validate: truyền discountInfo để saga áp discount trước khi redirect (giống flow COD)
    const discountInfo =
      formData.payment === "VNPAY" &&
      selectedDiscount?.discountId &&
      discountData?.finalAmount != null
        ? { discountId: selectedDiscount.discountId, orderValue: total }
        : null;

    dispatch(
      orderCreateRequest(
        selected_product_ids,
        buildReceiverInfo(),
        formData.payment,
        discountInfo,
        icity,
      ),
    );
  };
  useEffect(() => {
    const sessionId =
      checkout.checkout_session_id ||
      localStorage.getItem("checkout_session_id");

    if (!sessionId) {
      navigate("/customer/cart", { replace: true });
    }
  }, [checkout.checkout_session_id, navigate]);

  useEffect(() => {
    if (validationError && selectedDiscount) {
      alert(validationError);
      dispatch(clearSelectedDiscount());
      dispatch(clearDiscountFeedback());
    }
  }, [validationError, selectedDiscount, dispatch]);

  useEffect(() => {
    if (discount.applyError && selectedDiscount) {
      alert(discount.applyError);
      dispatch(clearSelectedDiscount());
      dispatch(clearDiscountFeedback());
    }
  }, [discount.applyError, selectedDiscount, dispatch]);

  // When holding period expired, show message and offer to go back to cart
  const holdingExpired =
    order.error &&
    String(order.error).toLowerCase().includes("holding period has expired");

  useEffect(() => {
    if (holdingExpired) {
      dispatch(fetchCartRequest());
    }
  }, [holdingExpired, dispatch]);

  const handleBackToCartAfterExpired = () => {
    dispatch(clearOrderMessages());
    navigate("/customer/cart");
  };

  useEffect(() => {
    dispatch(clearDiscountFeedback());
  }, [total, dispatch]);

  // Load mã giảm giá phù hợp đơn hàng (minOrderValue <= total, chưa dùng)
  useEffect(() => {
    if (total > 0) {
      dispatch(discountGetValidRequest(total));
    }
  }, [total, dispatch]);

  // COD: áp discount sau khi tạo order (flow hiện tại). VNPAY áp trong saga trước khi redirect.
  useEffect(() => {
    if (order.order_id && selectedDiscount?.discountId && !order.payment_url) {
      dispatch(
        discountApplyRequest(
          selectedDiscount.discountId,
          total,
          order.order_id,
        ),
      );
    }
  }, [order.order_id, order.payment_url, selectedDiscount, total, dispatch]);

  const handleCancel = () => {
    const sessionId =
      checkout.checkout_session_id ||
      localStorage.getItem("checkout_session_id");

    if (!sessionId) {
      alert("No checkout session to cancel.");
      return;
    }

    if (
      !window.confirm("Are you sure you want to cancel this checkout session?")
    )
      return;

    dispatch(checkoutCancelRequest(sessionId));

    // clear session local luôn cho chắc
    localStorage.removeItem("checkout_session_id");

    // navigate rồi reload

    setTimeout(() => {
      navigate("/customer/cart");
    }, 1000); // delay nhẹ để router kịp chuyển trang
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleSelectVoucher = (voucher) => {
    if (!voucher) {
      dispatch(clearSelectedDiscount());
      dispatch(clearDiscountFeedback());
      return;
    }
    dispatch(
      setSelectedDiscount({
        discountId: voucher._id,
        code: voucher.code,
        discountPercent: voucher.discountPercent,
        minOrderValue: voucher.minOrderValue,
        maxDiscountAmount: voucher.maxDiscountAmount,
        endDate: voucher.endDate,
        description: voucher.description,
      }),
    );
    dispatch(clearDiscountFeedback());
    dispatch(discountValidateRequest(voucher.code, total));
  };

  const handleRemoveVoucher = () => {
    dispatch(clearSelectedDiscount());
    dispatch(clearDiscountFeedback());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-600 mt-20">Payments</h1>
          <p className="text-gray-600">Please fill on all order information</p>
        </div>
        {order.loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4">
              <div className="w-14 h-14 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-green-600 font-semibold text-lg">
                Processing Order Created...
              </p>
            </div>
          </div>
        )}

        {holdingExpired && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-amber-800 font-medium">
              The holding period has expired. Your cart items are still saved.
              Please return to your cart and complete checkout again.
            </p>
            <button
              type="button"
              onClick={handleBackToCartAfterExpired}
              className="shrink-0 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
            >
              Back to cart
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>📍</span> Delivery information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter full name"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone number <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
                      type="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email"
                      type="email"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Street address"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province/City <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Province/City</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ward <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.city}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Ward</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.name}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order notes
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Add notes about the order, for example, more detailed delivery times or delivery location instructions."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>💳</span> Payment methods
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      value: "COD",
                      label: "Cash on delivery (COD)",
                      desc: "Payment in cash upon delivery.",
                    },
                    {
                      value: "VNPAY",
                      label: "VNPAY e-wallet",
                      desc: "Payment via VNPAY",
                    },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={formData.payment === method.value}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 mt-0.5"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900 mb-1">
                          {method.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {method.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Your order
                </h2>
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {cartItems?.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          src={item.image}
                        />
                        <span className="absolute top-1 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        {item.isNearExpiry && (
                          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800 mb-1">
                            Near expiry - Special price
                          </span>
                        )}
                        <div className="flex flex-wrap gap-1 mb-1">
                          {item.specs?.map((spec, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                        <div className="font-bold text-red-600 text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Cửa sổ mã giảm giá */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
                  <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                      </span>
                      <span className="font-semibold text-gray-800">
                        Voucher
                      </span>
                    </div>
                    {selectedDiscount && (
                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="text-sm text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="p-4">
                    {discountLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                      </div>
                    ) : !validDiscounts?.length ? (
                      <div className="text-center py-8 px-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-600">
                          {total < 1
                            ? "Add products to see discount codes"
                            : "No matching discount for this order"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {validDiscounts.map((v) => {
                          const isSelected =
                            selectedDiscount?.discountId === v._id;
                          return (
                            <button
                              key={v._id}
                              type="button"
                              onClick={() =>
                                handleSelectVoucher(isSelected ? null : v)
                              }
                              className={`w-full text-left rounded-lg border-2 p-3 transition-all duration-200 ${
                                isSelected
                                  ? "border-emerald-500 bg-emerald-50 shadow-sm"
                                  : "border-gray-100 bg-gray-50/50 hover:border-emerald-200 hover:bg-emerald-50/50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-emerald-700 tracking-wide">
                                      {v.code}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                      {v.discountPercent}% off
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Tối đa {formatPrice(v.maxDiscountAmount)} ·
                                    Đơn tối thiểu {formatPrice(v.minOrderValue)}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  {isSelected ? (
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white">
                                      <svg
                                        className="w-5 h-5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </span>
                                  ) : (
                                    <span className="text-sm font-medium text-emerald-600">
                                      Apply
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {selectedDiscount && discountData && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Original price</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-emerald-700">
                          <span>Discount ({selectedDiscount.code})</span>
                          <span>- {formatPrice(discountAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold text-gray-900 pt-1">
                          <span>Estimated price after discount</span>
                          <span>{formatPrice(finalAmount)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimated:</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping fee:</span>
                    <span className="font-medium">
                      {formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        Total:
                      </span>
                      <span className="text-2xl font-bold text-red-600">
                        {formatPrice(finalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors font-bold"
                >
                  Complete checkout
                </button>
                {(checkout.checkout_session_id ||
                  (typeof window !== "undefined" &&
                    localStorage.getItem("checkout_session_id"))) && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full mt-3 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    Cancel payment
                  </button>
                )}
                <div className="mt-4 text-center text-xs text-gray-500">
                  By placing an order, you agree to{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms of Use
                  </a>{" "}
                  our
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
