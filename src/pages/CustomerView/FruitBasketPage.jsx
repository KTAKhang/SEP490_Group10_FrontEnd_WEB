import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Gift, ShoppingBasket } from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Loading from "../../components/Loading/Loading";
import { getPublicFruitBasketsRequest } from "../../redux/actions/publicFruitBasketActions";

const FruitBasketPage = () => {
  const dispatch = useDispatch();
  const {
    publicFruitBaskets,
    publicFruitBasketsPagination,
    publicFruitBasketsLoading,
  } = useSelector((state) => state.publicFruitBasket);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 9,
      search: searchTerm || undefined,
      sortBy,
      sortOrder,
    };
    dispatch(getPublicFruitBasketsRequest(params));
  }, [dispatch, currentPage, searchTerm, sortBy, sortOrder]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative pt-32 pb-20 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-full mb-4">
            <ShoppingBasket className="text-orange-600" size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Fruit Baskets
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore curated fruit baskets with premium selections and ready-to-gift bundles.
          </p>
        </div>
      </section>

      <section className="py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by basket name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                <option value="createdAt">Created date</option>
                <option value="updatedAt">Updated date</option>
                <option value="name">Name</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {publicFruitBasketsLoading ? (
            <div className="flex justify-center py-12">
              <Loading message="Loading fruit baskets..." />
            </div>
          ) : publicFruitBaskets.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No fruit baskets found</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">
                  {publicFruitBasketsPagination
                    ? publicFruitBasketsPagination.page * publicFruitBasketsPagination.limit -
                      publicFruitBasketsPagination.limit +
                      1
                    : 0}{" "}
                  -{" "}
                  {publicFruitBasketsPagination
                    ? Math.min(
                        publicFruitBasketsPagination.page * publicFruitBasketsPagination.limit,
                        publicFruitBasketsPagination.total
                      )
                    : 0}{" "}
                  of {publicFruitBasketsPagination?.total || 0} baskets
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publicFruitBaskets.map((basket) => (
                  <div
                    key={basket._id}
                    className="group bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={basket.featuredImage || "https://via.placeholder.com/400x300?text=Fruit+Basket"}
                        alt={basket.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            basket.stockStatus === "IN_STOCK"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {basket.stockStatus === "IN_STOCK" ? "In stock" : "Out of stock"}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {basket.name}
                        </h3>
                        {basket.short_desc && (
                          <p className="text-sm text-gray-600 line-clamp-2">{basket.short_desc}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-orange-600">
                          {formatCurrency(basket.totalPrice)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(basket.items || []).length} items
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {(basket.items || [])
                          .map((item) => item.product?.name)
                          .filter(Boolean)
                          .slice(0, 3)
                          .join(", ")}
                        {(basket.items || []).length > 3 ? "..." : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {publicFruitBasketsPagination && publicFruitBasketsPagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {[...Array(publicFruitBasketsPagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === publicFruitBasketsPagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 border rounded-lg ${
                            currentPage === page
                              ? "bg-gray-900 text-white border-gray-900"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === publicFruitBasketsPagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
};

export default FruitBasketPage;