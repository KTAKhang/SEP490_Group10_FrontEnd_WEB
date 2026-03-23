import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { checkoutCancelRequest } from "../../redux/actions/checkoutActions";
import { fetchCartRequest } from "../../redux/actions/cartActions";
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
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
    payment: "COD",
  });

  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [icity, setIcity] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [manualCode, setManualCode] = useState("");
  const [appliedByManualCode, setAppliedByManualCode] = useState(false);
  const lastManualCodeRef = useRef(null);

  const checkout = useSelector((state) => state.checkout || {});
  const cart = useSelector((state) => state.cart || {});
  const order = useSelector((state) => state.order || {});
  const {error} = useSelector((state) => state.order || {});
  const discount = useSelector((state) => state.discount || {});
  console.log("order",error)

  const cartItems =
    checkout.items && checkout.items.length > 0
      ? checkout.items
      : cart.items || [];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal;

  const {
    selectedDiscount,
    validDiscounts = [],
    validationResult,
    validationError,
    applyResult,
    loading: discountLoading,
  } = discount;

  const discountData =
    applyResult?.data ||
    validationResult?.data ||
    (selectedDiscount?.discountAmount != null && selectedDiscount?.finalAmount != null
      ? {
          discountAmount: selectedDiscount.discountAmount,
          finalAmount: selectedDiscount.finalAmount,
        }
      : null);
  const discountAmount = discountData?.discountAmount || 0;
  const finalAmount = discountData?.finalAmount ?? total;

  useEffect(() => {
    axios
      .get(`${API_BASE}/p/`)
      .then((res) => setProvinces(res.data))
      .catch((err) => console.error("Error loading provinces:", err));
  }, []);

  useEffect(() => {
    if(error == "The holding period has expired") {
      handleCancel();
      console.log("Holding period has expired. Your cart items are still saved. Please return to your cart and complete checkout again.");
      clearOrderMessages();
    }
  }, [error]);

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
      (item) =>
        (item.product_id && item.product_id._id) ||
        item.product_id ||
        item.productId ||
        item._id,
    );
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

  useEffect(() => {
    if (total > 0) {
      dispatch(discountGetValidRequest(total));
    }
  }, [total, dispatch]);

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
    if (!window.confirm("Are you sure you want to cancel this checkout session?")) return;
    dispatch(checkoutCancelRequest(sessionId));
    localStorage.removeItem("checkout_session_id");
    setTimeout(() => {
      navigate("/customer/cart");
    }, 1000);
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
      setAppliedByManualCode(false);
      return;
    }
    setAppliedByManualCode(false);
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
    setManualCode("");
    setAppliedByManualCode(false);
    lastManualCodeRef.current = null;
  };

  useEffect(() => {
    if (
      validationResult?.data?.discountId &&
      lastManualCodeRef.current !== null
    ) {
      dispatch(
        setSelectedDiscount({
          discountId: validationResult.data.discountId,
          code: lastManualCodeRef.current,
          discountAmount: validationResult.data.discountAmount,
          finalAmount: validationResult.data.finalAmount,
        }),
      );
      setManualCode("");
      setAppliedByManualCode(true);
      lastManualCodeRef.current = null;
    }
  }, [validationResult?.data?.discountId, validationResult?.data?.discountAmount, validationResult?.data?.finalAmount, dispatch]);

  const handleApplyManualCode = () => {
    const code = manualCode.trim();
    if (!code || total < 1) return;
    lastManualCodeRef.current = code;
    dispatch(clearDiscountFeedback());
    dispatch(discountValidateRequest(code, total));
  };

  const inputClass =
    "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-300";

  const selectClass =
    "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-300 appearance-none cursor-pointer";

  return (
    <div className="min-h-screen py-8" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #f9fafb 50%, #ecfdf5 100%)" }}>
      {/* Decorative top bar */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #16a34a, #22c55e, #16a34a)" }} />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-10 mt-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Checkout</h1>
              <p className="text-gray-500 text-sm">Please fill in all order information below</p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-5">
            {["Fill Delivery Info", "Chose Payment Method","Apply Discount", "Click Complete Checkout"].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${i === 0 ? "bg-green-600 text-white" : i === 1 ? "bg-green-600 text-white" : "bg-green-600 text-white"}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-white text-green-600" : i === 1 ? "bg-white text-green-600" : "bg-white text-green-600"}`}>{i + 1}</span>
                  {step}
                </div>
                {i < 3 && <div className={`w-8 h-px ${i < 1 ? "bg-green-400" : "bg-green-400"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Loading overlay */}
        {order.loading && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-5">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-green-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-green-600 rounded-full animate-spin" />
                <div className="absolute inset-2 bg-green-50 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-900 font-bold text-lg">Processing your order</p>
                <p className="text-gray-500 text-sm mt-1">Please wait a moment...</p>
              </div>
            </div>
          </div>
        )}

        {/* Holding expired banner */}
        {holdingExpired && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-amber-800 font-medium text-sm leading-relaxed">
                The holding period has expired. Your cart items are still saved. Please return to your cart and complete checkout again.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBackToCartAfterExpired}
              className="shrink-0 px-5 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-semibold text-sm transition-all shadow-sm hover:shadow-md"
            >
              Back to cart
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Delivery Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #f0fdf4, #ffffff)" }}>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    Delivery Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full name <span className="text-green-600">*</span>
                      </label>
                      <input
                        required
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter your full name"
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone number <span className="text-green-600">*</span>
                      </label>
                      <input
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter your phone number"
                        type="tel"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Street address <span className="text-green-600">*</span>
                      </label>
                      <input
                        required
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="House number, street name..."
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Province / City <span className="text-green-600">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className={selectClass}
                        >
                          <option value="">Select Province / City</option>
                          {provinces.map((p) => (
                            <option key={p.code} value={p.code}>{p.name}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-green-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ward <span className="text-green-600">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="ward"
                          value={formData.ward}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.city}
                          className={`${selectClass} disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400`}
                        >
                          <option value="">Select Ward</option>
                          {wards.map((w) => (
                            <option key={w.code} value={w.name}>{w.name}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-green-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Order notes <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleInputChange}
                        rows="3"
                        className={`${inputClass} resize-none`}
                        placeholder="Delivery instructions, special requests..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #f0fdf4, #ffffff)" }}>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </span>
                    Payment Method
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {[
                      {
                        value: "COD",
                        label: "Cash on Delivery (COD)",
                        desc: "Pay in cash when your order arrives.",
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        ),
                      },
                      {
                        value: "VNPAY",
                        label: "VNPAY E-Wallet",
                        desc: "Secure online payment via VNPAY.",
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        ),
                      },
                    ].map((method) => {
                      const isActive = formData.payment === method.value;
                      return (
                        <label
                          key={method.value}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            isActive
                              ? "border-green-500 bg-green-50 shadow-sm"
                              : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.value}
                            checked={isActive}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                            {method.icon}
                          </div>
                          <div className="flex-1">
                            <div className={`font-semibold text-sm ${isActive ? "text-green-800" : "text-gray-800"}`}>{method.label}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{method.desc}</div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isActive ? "border-green-600 bg-green-600" : "border-gray-300"}`}>
                            {isActive && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN – Order Summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #f0fdf4, #ffffff)" }}>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </span>
                    Your Order
                    <span className="ml-auto text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                    </span>
                  </h2>
                </div>

                {/* Cart Items */}
                <div className="p-5 space-y-3 max-h-64 overflow-y-auto">
                  {cartItems?.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-green-50/50 transition-colors">
                      <div className="relative flex-shrink-0">
                        <img
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-lg shadow-sm"
                          src={item.image}
                        />
                        <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 leading-snug">{item.name}</h3>
                        {item.isNearExpiry && (
                          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 mb-1">
                            Near expiry · Special price
                          </span>
                        )}
                        <div className="flex flex-wrap gap-1 mb-1">
                          {item.specs?.map((spec, idx) => (
                            <span key={idx} className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md">{spec}</span>
                          ))}
                        </div>
                        <div className="font-bold text-green-700 text-sm">{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Voucher Section */}
                <div className="mx-5 mb-4 rounded-xl border border-gray-200 overflow-hidden">
                  {/* Voucher header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-green-500">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="font-semibold text-white text-sm">Voucher</span>
                    </div>
                    {selectedDiscount && (
                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="text-xs text-white/80 hover:text-white font-medium px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Manual code input */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-white">
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Enter voucher code</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                        placeholder="e.g. BIRTHDAY20"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleApplyManualCode}
                        disabled={discountLoading || !manualCode.trim() || total < 1}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Apply
                      </button>
                    </div>
                    {validationError && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validationError}
                      </p>
                    )}
                  </div>

                  {/* Suggested vouchers */}
                  <div className="p-4 bg-white">
                    <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Suggested for your order</p>
                    {appliedByManualCode && (
                      <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-3">
                        Manual code applied. Click <strong>Remove</strong> to choose a suggested voucher instead.
                      </p>
                    )}
                    {discountLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-7 h-7 border-2 border-green-100 border-t-green-600 rounded-full animate-spin" />
                      </div>
                    ) : !validDiscounts?.length ? (
                      <div className="text-center py-5 px-3">
                        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-gray-100 text-gray-400 mb-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">
                          {total < 1 ? "Add products to see vouchers" : "No suggested vouchers available"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Try entering a code above</p>
                      </div>
                    ) : (
                      <div className={`space-y-2 max-h-48 overflow-y-auto pr-0.5 ${appliedByManualCode ? "pointer-events-none opacity-50" : ""}`}>
                        {validDiscounts.map((v) => {
                          const isSelected = selectedDiscount?.discountId === v._id;
                          return (
                            <button
                              key={v._id}
                              type="button"
                              disabled={appliedByManualCode}
                              onClick={() => appliedByManualCode ? undefined : handleSelectVoucher(isSelected ? null : v)}
                              className={`w-full text-left rounded-xl border-2 p-3 transition-all duration-200 ${
                                isSelected
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-100 bg-gray-50/60 hover:border-green-300 hover:bg-green-50/40"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-green-700 text-sm tracking-widest">{v.code}</span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                      {v.discountPercent}% off
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Max {formatPrice(v.maxDiscountAmount)} · Min order {formatPrice(v.minOrderValue)}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  {isSelected ? (
                                    <span className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </span>
                                  ) : (
                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-200">Apply</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Discount summary */}
                    {selectedDiscount && discountData && (
                      <div className="mt-4 pt-4 border-t border-dashed border-gray-200 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Original price</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-700 font-medium">
                          <span>Discount ({selectedDiscount.code})</span>
                          <span>− {formatPrice(discountAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
                          <span>After discount</span>
                          <span className="text-green-700">{formatPrice(finalAmount)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="px-5 pb-5">
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-green-600">{formatPrice(finalAmount)}</span>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold text-white text-base transition-all duration-200 shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5 active:translate-y-0"
                    style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)" }}
                  >
                    Complete Checkout
                  </button>

                  {/* Cancel button */}
                  {(checkout.checkout_session_id ||
                    (typeof window !== "undefined" && localStorage.getItem("checkout_session_id"))) && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-full mt-3 py-2.5 rounded-xl font-semibold text-sm text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 transition-all duration-200"
                    >
                      Cancel Payment
                    </button>
                  )}

                  <div className="mt-4 text-center text-xs text-gray-400">
                    By placing an order, you agree to our{" "}
                    <a href="#" className="text-green-600 hover:underline font-medium">Terms of Use</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}