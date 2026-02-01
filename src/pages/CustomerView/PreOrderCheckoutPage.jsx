import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import api from "../../api";

const API_BASE = "https://provinces.open-api.vn/api/v2";
const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(price || 0);

export default function PreOrderCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const {
    fruitTypeId,
    quantityKg,
    fruitTypeName,
    estimatedPrice,
    depositPercent = 50,
  } = state;

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    ward: "",
    note: "",
  });
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinceName, setProvinceName] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!fruitTypeId || quantityKg == null) {
      navigate("/customer/pre-orders", { replace: true });
      return;
    }
  }, [fruitTypeId, quantityKg, navigate]);

  useEffect(() => {
    axios.get(`${API_BASE}/p/`).then((res) => setProvinces(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!formData.city) {
      setWards([]);
      setProvinceName("");
      setFormData((prev) => ({ ...prev, ward: "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, ward: "" }));
    const sel = provinces.find((p) => p.code === Number(formData.city));
    setProvinceName(sel ? sel.name : "");
    axios
      .get(`${API_BASE}/w/`)
      .then((res) => {
        setWards(res.data.filter((w) => w.province_code === Number(formData.city)));
      })
      .catch(console.error);
  }, [formData.city, provinces]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildReceiverAddress = () => {
    const parts = [formData.address, formData.ward, provinceName].filter(Boolean);
    return parts.join(", ");
  };

  const handleConfirmCheckout = () => {
    setErr("");
    if (!/^0\d{9}$/.test(formData.phone)) {
      setErr("Phone must start with 0 and have 10 digits.");
      return;
    }
    setShowConfirm(false);
    setSubmitting(true);
    const receiverInfo = {
      receiver_name: formData.fullName.trim(),
      receiver_phone: formData.phone.trim(),
      receiver_address: buildReceiverAddress(),
    };
    api
      .post("/preorder/create-payment-intent", {
        fruitTypeId,
        quantityKg,
        receiverInfo,
      })
      .then((res) => {
        if (res.data && res.data.payUrl) {
          window.location.href = res.data.payUrl;
        } else {
          setErr("Could not create payment link.");
          setSubmitting(false);
        }
      })
      .catch((e) => {
        setErr(e.response?.data?.message || "Error creating payment.");
        setSubmitting(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr("");
    if (!/^0\d{9}$/.test(formData.phone)) {
      setErr("Phone must start with 0 and have 10 digits.");
      return;
    }
    setShowConfirm(true);
  };

  if (!fruitTypeId || quantityKg == null) {
    return null;
  }

  // Đặt trước: luôn cọc 50%; 50% còn lại thanh toán sau khi phân bổ
  const pct = 50;
  const totalAmount = Math.round((estimatedPrice || 0) * quantityKg);
  const depositAmount = Math.round((pct / 100) * totalAmount);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mt-20">Pre-order checkout</h1>
          <p className="text-gray-600">Please fill in delivery information</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột trái - Form địa chỉ 2 cấp giống Checkout */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-gray-700">📍</span> Delivery information
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0xxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Street, number"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select province/city</option>
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select ward</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.name}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                      placeholder="Notes for pre-order"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-gray-700">💳</span> Payment method
                </h2>
                <div className="flex items-center p-4 border-2 border-green-500 rounded-lg bg-green-50">
                  <input
                    type="radio"
                    name="payment"
                    value="VNPAY"
                    checked
                    readOnly
                    className="w-5 h-5 text-green-600"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">VNPay e-wallet</div>
                    <div className="text-sm text-gray-500">Pre-order requires VNPay payment</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải - Tóm tắt đơn */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Pre-order</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-2xl">
                      🍊
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{fruitTypeName}</h3>
                      <p className="text-sm text-gray-500">{quantityKg} kg × {formatPrice(estimatedPrice)}/kg</p>
                      <p className="text-sm text-gray-600">Order total: {formatPrice(totalAmount)}</p>
                      {pct < 100 && (
                        <p className="font-bold text-green-600">Deposit ({pct}%): {formatPrice(depositAmount)}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  {pct < 100 && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Order total:</span>
                      <span>{formatPrice(totalAmount)}</span>
                    </div>
                  )}
                  {pct < 100 && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Deposit ({pct}%):</span>
                      <span>{formatPrice(depositAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-gray-900">
                      {pct < 100 ? "Pay now (deposit):" : "Total:"}
                    </span>
                    <span className="text-2xl font-bold text-red-600">{formatPrice(depositAmount)}</span>
                  </div>
                </div>
                {err && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{err}</div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-6 bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Redirecting to VNPay..." : "Pay with VNPay"}
                </button>

                {/* Confirm popup: đơn đặt trước không thể hủy */}
                {showConfirm && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                      <p className="text-gray-800 text-center mb-6">
                        This is a pre-order. After placing, the order <strong>cannot be cancelled</strong>. Please confirm before checkout.
                      </p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowConfirm(false)}
                          className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Go back
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmCheckout}
                          disabled={submitting}
                          className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          I understand, continue to pay
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full mt-3 py-2 text-gray-600 hover:text-gray-900"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
