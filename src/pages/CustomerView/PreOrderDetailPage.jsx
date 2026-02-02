import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Loading from "../../components/Loading/Loading";
const formatCurrency = (n) => (n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " VND";
const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "");
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/600x600?text=Pre-order";

export default function PreOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get(`/preorder/fruit-types/${id}`)
      .then((res) => {
        if (res.data && res.data.data) {
          setItem(res.data.data);
          setQuantity(String(res.data.data.minOrderKg || ""));
        }
      })
      .catch((e) => setErr(e.response?.data?.message || "Could not load."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleProceed = () => {
    if (!item) return;
    const qty = parseFloat(quantity, 10);
    if (isNaN(qty) || qty < item.minOrderKg || qty > item.maxOrderKg) {
      setErr("Quantity (kg) must be between " + item.minOrderKg + " and " + item.maxOrderKg);
      return;
    }
    setErr("");
    navigate("/customer/preorder-checkout", {
      state: {
        fruitTypeId: item._id,
        quantityKg: qty,
        fruitTypeName: item.name,
        estimatedPrice: item.estimatedPrice,
        minOrderKg: item.minOrderKg,
        maxOrderKg: item.maxOrderKg,
        depositPercent: 50, // Đặt trước: luôn cọc 50%, 50% còn lại thanh toán sau phân bổ
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center py-32">
        <Loading message="Loading..." />
      </div>
    );
  }

  if (err && !item) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-32 px-4">
        <p className="text-gray-600 text-lg mb-4">{err}</p>
        <button
          onClick={() => navigate("/customer/pre-orders")}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Back to Pre-order
        </button>
      </div>
    );
  }

  if (!item) return null;

  const qtyNum = parseFloat(quantity, 10);
  const validQty = !isNaN(qtyNum) && qtyNum >= item.minOrderKg && qtyNum <= item.maxOrderKg;
  const estimatedTotal = validQty ? Math.round(item.estimatedPrice * qtyNum) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <section className="pt-32 pb-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/customer/pre-orders")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <i className="ri-arrow-left-line text-xl" />
            <span>Back to Pre-order</span>
          </button>
        </div>
      </section>

      {/* Detail - layout giống ProductDetail */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-square">
                <img
                  src={item.image || PLACEHOLDER_IMAGE}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-500 uppercase tracking-wider">Pre-order</span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 mt-2">
                {item.name}
              </h1>
              <p className="text-2xl font-bold text-gray-900 mb-6">
                {formatCurrency(item.estimatedPrice)}/kg
              </p>
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Pre-order open
                </span>
              </div>

              {item.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{item.description}</p>
                </div>
              )}

              <div className="mb-8 space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Order quantity range</span>
                  <span className="font-semibold">{item.minOrderKg} – {item.maxOrderKg} kg</span>
                </div>
                {item.estimatedHarvestDate && (
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Est. harvest date</span>
                    <span className="font-semibold">{formatDate(item.estimatedHarvestDate)}</span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (kg)</label>
                <input
                  type="number"
                  min={item.minOrderKg}
                  max={item.maxOrderKg}
                  step="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full max-w-[200px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                {validQty && (
                  <p className="mt-2 text-lg font-semibold text-green-600">
                    Est. total: {formatCurrency(estimatedTotal)}
                  </p>
                )}
              </div>

              {err && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{err}</div>}

              <button
                onClick={handleProceed}
                disabled={!validQty}
                className={`flex items-center justify-center space-x-2 px-8 py-4 rounded-lg font-semibold w-full max-w-xs ${
                  validQty
                    ? "bg-gray-900 text-white hover:bg-gray-800 cursor-pointer"
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
              >
                <i className="ri-shopping-cart-line text-xl" />
                <span>Proceed to pre-order</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
