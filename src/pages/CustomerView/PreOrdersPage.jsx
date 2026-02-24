import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import api from "../../api";
import Loading from "../../components/Loading/Loading";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const formatCurrency = (n) => (n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " VND";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x400?text=Pre-order";

/**
 * Visibility is decided by backend (harvest lock + allocation-closed).
 * API /preorder/fruit-types returns only fruit types visible for pre-order; frontend renders that list as-is.
 */
export default function PreOrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page"), 10) || 1);
  const prevUrlParamsRef = useRef("");

  const load = (page = 1, limit) => {
    setLoading(true);
    const params = {
      page,
      limit: limit ?? pagination.limit ?? 12,
      sortBy: sortBy === "default" ? "createdAt" : sortBy,
      sortOrder,
    };
    if (searchTerm.trim()) params.keyword = searchTerm.trim();
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
    const newSearchParams = new URLSearchParams();
    if (searchTerm) newSearchParams.set("search", searchTerm);
    if (sortBy !== "createdAt" || sortOrder !== "desc") {
      if (sortBy !== "createdAt") newSearchParams.set("sortBy", sortBy);
      if (sortOrder !== "desc") newSearchParams.set("sortOrder", sortOrder);
    }
    if (currentPage > 1) newSearchParams.set("page", currentPage.toString());
    const newParamsString = newSearchParams.toString();
    if (prevUrlParamsRef.current !== newParamsString) {
      prevUrlParamsRef.current = newParamsString;
      setSearchParams(newSearchParams);
    }
  }, [currentPage, searchTerm, sortBy, sortOrder, setSearchParams]);

  useEffect(() => {
    load(currentPage);
  }, [currentPage, searchTerm, sortBy, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    if (value === "default") {
      setSortBy("createdAt");
      setSortOrder("desc");
    } else if (value === "price-low") {
      setSortBy("estimatedPrice");
      setSortOrder("asc");
    } else if (value === "price-high") {
      setSortBy("estimatedPrice");
      setSortOrder("desc");
    } else if (value === "name") {
      setSortBy("name");
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sortValue =
    sortBy === "createdAt" && sortOrder === "desc"
      ? "default"
      : sortBy === "estimatedPrice" && sortOrder === "asc"
        ? "price-low"
        : sortBy === "estimatedPrice" && sortOrder === "desc"
          ? "price-high"
          : sortBy === "name" && sortOrder === "asc"
            ? "name"
            : "default";

  const handleCardClick = (id) => {
    navigate(`/customer/pre-orders/${id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

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

      {/* Filters section - same layout as ProductPage */}
      <section className="py-8 border-b border-gray-200 sticky top-20 bg-white z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <form onSubmit={handleSearch} className="relative max-w-md">
              <input
                type="text"
                placeholder="Search by fruit name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </form>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex-1" />
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Sort:</span>
              <select
                value={sortValue}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Grid section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {err && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{err}</div>
          )}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loading message="Loading..." />
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-archive-line text-6xl text-gray-400 mx-auto mb-4 block" />
              <p className="text-gray-600 text-lg">There is currently no fruit available for pre-order.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-gray-600">
                  Showing{" "}
                  <span className="font-semibold">
                    {pagination
                      ? pagination.page * pagination.limit - pagination.limit + 1
                      : 0}{" "}
                    -{" "}
                    {pagination
                      ? Math.min(pagination.page * pagination.limit, pagination.total)
                      : 0}{" "}
                    of {pagination?.total || 0} fruit types
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {list.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleCardClick(item._id)}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                      <img
                        src={(item.images && item.images[0]) || item.image || PLACEHOLDER_IMAGE}
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

              {/* Pagination - same UI as ProductPage */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 border rounded-lg cursor-pointer ${
                            currentPage === page
                              ? "bg-gray-900 text-white border-gray-900"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
