import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ShoppingCart } from "lucide-react";
import api from "../../api";
import Loading from "../../components/Loading/Loading";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/preorder/fruit-types/${id}`)
      .then((res) => {
        if (res.data && res.data.data) {
          setItem(res.data.data);
          const minK = Number(res.data.data.minOrderKg);
          setQuantity(String(Number.isFinite(minK) ? Math.round(minK) : ""));
          setSelectedImageIndex(0);
        }
      })
      .catch((e) => setErr(e.response?.data?.message || "Could not load."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleProceed = () => {
    if (!item) return;
    const qty = parseInt(quantity, 10);
    if (!Number.isInteger(qty) || qty < item.minOrderKg || qty > item.maxOrderKg) {
      setErr("Quantity (kg) must be an integer between " + item.minOrderKg + " and " + item.maxOrderKg);
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
        depositPercent: 50,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <div className="flex justify-center items-center py-32">
          <Loading message="Loading..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (err && !item) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 px-4">
          <p className="text-stone-600 text-lg mb-4">{err}</p>
          <button
            onClick={() => navigate("/customer/pre-orders")}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer font-medium"
          >
            Back to Pre-order
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!item) return null;

  const images =
    (item.images && Array.isArray(item.images) && item.images.length > 0)
      ? item.images
      : item.image ? [item.image] : [];
  const mainImage = images[selectedImageIndex] || PLACEHOLDER_IMAGE;

  const qtyNum = parseInt(quantity, 10);
  const validQty = Number.isInteger(qtyNum) && qtyNum >= item.minOrderKg && qtyNum <= item.maxOrderKg;
  const estimatedTotal = validQty ? Math.round(item.estimatedPrice * qtyNum) : 0;

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      {/* Breadcrumb - same as ProductDetailPage */}
      <section className="pt-28 pb-4 bg-white border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/customer/pre-orders")}
            className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-600 transition-colors cursor-pointer text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Pre-order
          </button>
        </div>
      </section>

      {/* Detail Hero - same grid/layout as ProductDetailPage */}
      <section className="py-8 lg:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Image Gallery */}
            <div className="lg:col-span-6">
              <div className="sticky top-28 space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg ring-1 ring-stone-200/60 aspect-square">
                  <img
                    src={mainImage}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow-md">
                      Pre-order
                    </span>
                  </div>
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedImageIndex === index
                            ? "border-emerald-500 ring-2 ring-emerald-200"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${item.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Info + CTA - same card style as ProductDetailPage */}
            <div className="lg:col-span-6">
              <div className="lg:sticky lg:top-28 space-y-6">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-stone-100 pb-4">
                    <span className="text-stone-500 text-sm font-medium min-w-[7rem]">Name:</span>
                    <span className="text-stone-900 font-semibold text-lg">{item.name}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-stone-100 pb-4">
                    <span className="text-stone-500 text-sm font-medium min-w-[7rem]">Price:</span>
                    <span className="text-emerald-600 font-bold text-xl">
                      {formatCurrency(item.estimatedPrice)}/kg
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-stone-100 pb-4">
                    <span className="text-stone-500 text-sm font-medium min-w-[7rem]">Order range:</span>
                    <span className="text-stone-900 font-medium">{item.minOrderKg} – {item.maxOrderKg} kg</span>
                  </div>

                  {item.estimatedHarvestDate && (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-stone-100 pb-4">
                      <span className="text-stone-500 text-sm font-medium min-w-[7rem]">Est. harvest:</span>
                      <span className="text-stone-900 font-medium">{formatDate(item.estimatedHarvestDate)}</span>
                    </div>
                  )}

                  {item.description && (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-stone-100 pb-4">
                      <span className="text-stone-500 text-sm font-medium min-w-[7rem]">Description:</span>
                      <span className="text-stone-700 leading-relaxed">{item.description}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 pt-1">
                    <span className="text-stone-500 text-sm font-medium min-w-[7rem]">Quantity (kg):</span>
                    <div className="space-y-2">
                      <input
                        type="number"
                        min={item.minOrderKg}
                        max={item.maxOrderKg}
                        step={1}
                        value={quantity}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "") {
                            setQuantity("");
                            return;
                          }
                          const n = parseInt(v, 10);
                          if (Number.isNaN(n)) return;
                          const clamped = Math.max(Number(item.minOrderKg) || 0, Math.min(Number(item.maxOrderKg) || 999, n));
                          setQuantity(String(clamped));
                        }}
                        className="w-full max-w-[180px] px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                      {validQty && (
                        <p className="text-emerald-600 font-semibold">
                          Est. total: {formatCurrency(estimatedTotal)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {err && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
                    {err}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleProceed}
                    disabled={!validQty}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all ${
                      validQty
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg cursor-pointer"
                        : "bg-stone-300 text-stone-500 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {validQty ? "Proceed to pre-order" : "Enter quantity"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
