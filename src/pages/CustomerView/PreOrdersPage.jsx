import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import Loading from "../../components/Loading/Loading";
const formatCurrency = (n) => (n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " VND";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x400?text=Pre-order";

/**
 * Visibility is decided by backend (harvest lock + allocation-closed).
 * API /preorder/fruit-types returns only fruit types visible for pre-order; frontend renders that list as-is.
 */
/*method for pagination product*/
export default function PreOrdersPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchText, setSearchText] = useState("");

  const load = (page = 1, limit) => {
    setLoading(true);
    const params = { page, limit: limit ?? pagination.limit ?? 10 };
    if (searchText.trim()) params.keyword = searchText.trim();
    api
      .get("/preorder/fruit-types", { params })
      .then((res) => {
        if (res.data && res.data.data) setList(res.data.data);
        if (res.data && res.data.pagination) setPagination(res.data.pagination);
      })
      .catch(() => setErr("Could not load list."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, []);

  useEffect(() => {
    if (searchText.trim() === "") return;
    const t = setTimeout(() => load(1), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const handleCardClick = (id) => {
    navigate(`/customer/pre-orders/${id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Pre-order fruits
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Pre-order fresh fruit types at fixed estimated price. Pay via VNPay to confirm.
            </p>
          </div>
        </div>
      </section>

      {/* Grid section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by fruit name..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
              />
            </div>
          </div>
          {err && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{err}</div>
          )}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loading message="Loading..." />
            </div>
          ) : (() => {
            return list.length === 0 ? (
              <div className="text-center py-12">
                <i className="ri-archive-line text-6xl text-gray-400 mx-auto mb-4 block" />
                <p className="text-gray-600 text-lg">There is currently no fruit available for pre-order.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {list.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleCardClick(item._id)}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    <img
                      src={item.image || PLACEHOLDER_IMAGE}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-full text-xs font-bold shadow-lg">
                        Pre-order
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description || "Fresh fruit, pre-order."}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-gray-900">
                          {formatCurrency(item.estimatedPrice)}/kg
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.minOrderKg}–{item.maxOrderKg} kg
                        </p>
                      </div>
                      <span className="text-green-600 font-semibold text-sm">View detail</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            );
          })()}
          {list.length > 0 && (
            <div className="mt-10 flex items-center justify-between text-sm text-gray-600">
              <div>
                Displaying {((pagination.page - 1) * (pagination.limit || 10)) + 1}-{Math.min(pagination.page * (pagination.limit || 10), pagination.total || 0)} of {pagination.total || 0} fruit types
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={pagination.limit || 10}
                  onChange={(e) => load(1, Number(e.target.value))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => load(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="ri-arrow-left-s-line" />
                  </button>
                  {[...Array(Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 10))))].map((_, i) => {
                    const pageNum = i + 1;
                    const totalPages = Math.ceil((pagination.total || 0) / (pagination.limit || 10)) || 1;
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)) {
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => load(pageNum)}
                          className={`px-3 py-1.5 rounded-lg transition-colors ${pagination.page === pageNum ? "bg-green-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                      return <span key={pageNum} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  <button
                    type="button"
                    onClick={() => load(pagination.page + 1)}
                    disabled={pagination.page >= Math.ceil((pagination.total || 0) / (pagination.limit || 10))}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="ri-arrow-right-s-line" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
