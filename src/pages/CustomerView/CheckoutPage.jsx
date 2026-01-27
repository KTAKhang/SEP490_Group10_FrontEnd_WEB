import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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

  const shippingCost = formData.shipping === "standard" ? 50000 : 100000;
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal;

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

    dispatch(
      orderCreateRequest(
        selected_product_ids,
        buildReceiverInfo(),
        formData.payment, // COD | VNPAY
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
      alert("Không có phiên thanh toán nào để hủy.");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn hủy phiên thanh toán này?")) return;

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
      alert("Vui lòng chọn voucher trước khi kiểm tra.");
      return;
    }

    dispatch(discountValidateRequest(selectedDiscount.code, total));
  };

  const handleRemoveVoucher = () => {
    dispatch(clearSelectedDiscount());
    dispatch(clearDiscountFeedback());
  };

  console.log("provinces", provinces);
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
                  <span>📍</span> Thông tin giao hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập họ và tên"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập số điện thoại"
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
                      placeholder="Nhập email"
                      type="email"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Số nhà, tên đường"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.city}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.name}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú đơn hàng
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>💳</span> Phương thức thanh toán
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      value: "COD",
                      label: "Thanh toán khi nhận hàng (COD)",
                      desc: "Thanh toán bằng tiền mặt khi nhận hàng",
                    },
                    {
                      value: "VNPAY",
                      label: "Ví điện tử VNPAY",
                      desc: "Thanh toán qua VNPAY",
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
                  Đơn hàng của bạn
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
                        {selectedDiscount?.code || "Chưa chọn"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedDiscount && (
                        <button
                          type="button"
                          onClick={handleRemoveVoucher}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Gỡ
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate("/customer/vouchers")}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Chọn voucher
                      </button>
                    </div>
                  </div>

                  {selectedDiscount && (
                    <div className="text-xs text-gray-600 space-y-1 mb-3">
                      <p>
                        Giảm {selectedDiscount.discountPercent}% tối đa{" "}
                        {formatPrice(selectedDiscount.maxDiscountAmount)}
                      </p>
                      <p>Đơn tối thiểu: {formatPrice(selectedDiscount.minOrderValue)}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleValidateDiscount}
                      disabled={discountLoading || !selectedDiscount}
                      className="flex-1 bg-green-50 text-green-700 border border-green-200 rounded-lg py-2 text-sm font-semibold hover:bg-green-100 disabled:opacity-60"
                    >
                      Kiểm tra mã
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
                        <span>Giá gốc</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      <div className="flex justify-between text-green-700">
                        <span>Giảm giá</span>
                        <span>- {formatPrice(discountAmount)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Tạm tính sau giảm</span>
                        <span>{formatPrice(finalAmount)}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        Tổng cộng:
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
                    Hủy thanh toán
                  </button>
                )}
                <div className="mt-4 text-center text-xs text-gray-500">
                  Bằng việc đặt hàng, bạn đồng ý với{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Điều khoản sử dụng
                  </a>{" "}
                  của chúng tôi
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
