import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { shippingCheckRequest } from "../../redux/actions/cartActions";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { checkoutCancelRequest } from "../../redux/actions/checkoutActions";
import { fetchCartRequest } from "../../redux/actions/cartActions";
import { orderCreateRequest } from "../../redux/actions/orderActions";
import {
  clearDiscountFeedback,
  clearSelectedDiscount,
  discountApplyRequest,
  discountValidateRequest,
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
  const [icity, setIcity] = useState([]);
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
    validationResult,
    validationError,
    applyResult,
    loading: discountLoading,
  } = discount;

  const discountData =
    applyResult?.data || validationResult?.data || null;
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
    const selected_product_ids = cartItems.map((item) =>
      // support multiple item shapes
      (item.product_id && item.product_id._id) || item.product_id || item.productId || item._id
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
    const selectedProvince = provinces.find(p => p.code === Number(value));
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
      alert("Giỏ hàng trống");
      return;
    }

    const selected_product_ids = cartItems.map(
      (item) => item.product_id || item._id,
    );
    console.log("orderCreateRequest",icity)

    dispatch(
      orderCreateRequest(
        selected_product_ids,
        buildReceiverInfo(),
        formData.payment, // COD | VNPAY
        icity
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

  useEffect(() => {
    dispatch(clearDiscountFeedback());
  }, [total, dispatch]);

  useEffect(() => {
    if (order.order_id && selectedDiscount?.discountId) {
      dispatch(
        discountApplyRequest(selectedDiscount.discountId, total, order.order_id),
      );
    }
  }, [order.order_id, selectedDiscount, total, dispatch]);

  const handleCancel = () => {
    const sessionId =
      checkout.checkout_session_id ||
      localStorage.getItem("checkout_session_id");
    if (!sessionId) {
      alert("There are no payments that can be canceled");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this payment session?")) return;

    dispatch(checkoutCancelRequest(sessionId));
    navigate("/customer/cart");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleValidateDiscount = () => {
    if (!selectedDiscount?.code) {
      alert("Please select your voucher before checking out.");
      return;
    }

    dispatch(discountValidateRequest(selectedDiscount.code, total));
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
                      placeholder="Enter your first and last name"
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
                      placeholder="House number, street name"
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
                      placeholder="Add notes about the order, for example, more detailed delivery times or delivery location instructions"
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
                       
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        <h3 className="font-medium text-green-900 text-sm mb-1 line-clamp-2">
                         {item.quantity} KG
                        </h3>
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
                <div className="border border-dashed border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Voucher</p>
                      <p className="font-semibold text-gray-900">
                        {selectedDiscount?.code || "Not selected"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedDiscount && (
                        <button
                          type="button"
                          onClick={handleRemoveVoucher}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate("/customer/vouchers")}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Select voucher
                      </button>
                    </div>
                  </div>

                  {selectedDiscount && (
                    <div className="text-xs text-gray-600 space-y-1 mb-3">
                      <p>
                        Reduce {selectedDiscount.discountPercent}% maximum{" "}
                        {formatPrice(selectedDiscount.maxDiscountAmount)}
                      </p>
                      <p>Minimum order: {formatPrice(selectedDiscount.minOrderValue)}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleValidateDiscount}
                      disabled={discountLoading || !selectedDiscount}
                      className="flex-1 bg-green-50 text-green-700 border border-green-200 rounded-lg py-2 text-sm font-semibold hover:bg-green-100 disabled:opacity-60"
                    >
                      Check the code
                    </button>
                    {discountAmount > 0 && (
                      <span className="text-sm text-green-700 font-semibold">
                        -{formatPrice(discountAmount)}
                      </span>
                    )}
                  </div>
                  {discountData && (
                    <div className="mt-3 text-sm text-gray-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Original price</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      <div className="flex justify-between text-green-700">
                        <span>Discount</span>
                        <span>- {formatPrice(discountAmount)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Estimated price after discount</span>
                        <span>{formatPrice(finalAmount)}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimated:</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping fee:</span>
                    <span className="font-medium">{formatPrice(shippingCost)}</span>
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
