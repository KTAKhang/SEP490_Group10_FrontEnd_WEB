import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { History, Search, Filter, ChevronRight } from "lucide-react";
import { getProductsRequest } from "../../../redux/actions/productActions";
import Loading from "../../../components/Loading/Loading";

const BatchHistoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, productsLoading } = useSelector((state) => state.product);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getProductsRequest({ page: 1, limit: 1000, sortBy: "name", sortOrder: "asc" }));
  }, [dispatch]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectProduct = (product) => {
    navigate(`/admin/batch-history/${product._id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <History size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Batch History</h1>
          <p className="text-sm text-gray-500 mt-0.5">Select a product to view batch history</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="text-gray-400" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Select a product</h2>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by product name or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {productsLoading ? (
            <Loading message="Loading products..." />
          ) : (
            <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-gray-200">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No products found</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleSelectProduct(product)}
                      className="w-full text-left px-4 py-4 hover:bg-emerald-50/80 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {product.brand || "—"} • Current batch #{product.batchNumber ?? "—"}
                        </p>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-gray-400 group-hover:text-emerald-600 shrink-0 ml-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchHistoryPage;
