import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { History, Package, Search, Filter, Eye } from "lucide-react";
import { getProductsRequest } from "../../../redux/actions/productActions";
import { getProductBatchHistoryRequest } from "../../../redux/actions/productBatchActions";
import Loading from "../../../components/Loading/Loading";
import BatchHistoryDetail from "./BatchHistoryDetail";


const BatchHistoryPage = () => {
  const dispatch = useDispatch();
  const { products, productsLoading } = useSelector((state) => state.product);
  const { batchHistory, batchHistoryPagination, batchHistoryLoading } = useSelector(
    (state) => state.productBatch
  );


  const [selectedProductId, setSelectedProductId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [completionReason, setCompletionReason] = useState("");
  const [sortBy, setSortBy] = useState("batchNumber");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);


  // Fetch all products on mount
  useEffect(() => {
    dispatch(getProductsRequest({ page: 1, limit: 1000, sortBy: "name", sortOrder: "asc" }));
  }, [dispatch]);


  // Fetch batch history when product is selected or filters change
  useEffect(() => {
    if (selectedProductId) {
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(completionReason && { completionReason }),
        sortBy,
        sortOrder,
      };
      dispatch(getProductBatchHistoryRequest(selectedProductId, params));
    }
  }, [dispatch, selectedProductId, currentPage, searchTerm, completionReason, sortBy, sortOrder]);


  // Filter products by search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  const selectedProduct = products.find((p) => p._id === selectedProductId);


  const formatVND = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value ?? 0);


  const getCompletionReasonLabel = (reason, apiLabel) => {
    if (apiLabel) return { label: apiLabel, color: reason === "EXPIRED" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800" };
    switch (reason) {
      case "SOLD_OUT":
        return { label: "Sold out", color: "bg-green-100 text-green-800" };
      case "EXPIRED":
        return { label: "Expired", color: "bg-red-100 text-red-800" };
      default:
        return { label: "N/A", color: "bg-gray-100 text-gray-800" };
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <History size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Batch History</h1>
          <p className="text-sm text-gray-500 mt-0.5">View batch history for products</p>
        </div>
      </div>


      {/* Product Selection Card */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="text-gray-400" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Select Product</h2>
          </div>


          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products by name or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>


          {/* Product Dropdown/List */}
          {productsLoading ? (
            <Loading message="Loading products..." />
          ) : (
            <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-200">
              {filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No products found</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => {
                        setSelectedProductId(product._id);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        selectedProductId === product._id ? "bg-emerald-50 border-l-4 border-emerald-600" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            {product.brand} • Batch #{product.batchNumber || 1}
                          </p>
                        </div>
                        {selectedProductId === product._id && (
                          <div className="ml-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Batch History Table */}
      {selectedProductId && (
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Batch History - {selectedProduct?.name || "Loading..."}
                </h2>
                {selectedProduct && (
                  <p className="text-sm text-gray-500 mt-1">
                    Brand: {selectedProduct.brand} • Current Batch: #{selectedProduct.batchNumber || 1}
                  </p>
                )}
              </div>
            </div>


            {/* Filters for Batch History */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by batch number..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>


              {/* Completion Reason Filter */}
              <div>
                <select
                  value={completionReason}
                  onChange={(e) => {
                    setCompletionReason(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">All reasons</option>
                  <option value="SOLD_OUT">Sold out</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>


              {/* Sort */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="batchNumber">Batch #</option>
                  <option value="completedDate">Completed Date</option>
                  <option value="createdAt">Created Date</option>
                  <option value="plannedQuantity">Planned</option>
                  <option value="receivedQuantity">Received</option>
                  <option value="soldQuantity">Sold</option>
                  <option value="discardedQuantity">Discarded</option>
                </select>
                <button
                  onClick={() => {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm"
                  title={sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>


          <div className="p-6">
            {batchHistoryLoading ? (
              <Loading message="Loading batch history..." />
            ) : batchHistory.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No batch history found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Batch history will appear here after products are sold out or expired
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSortBy("batchNumber");
                            setSortOrder(sortBy === "batchNumber" && sortOrder === "asc" ? "desc" : "asc");
                            setCurrentPage(1);
                          }}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Batch #</span>
                            {sortBy === "batchNumber" && (
                              <span className="text-emerald-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSortBy("completedDate");
                            setSortOrder(sortBy === "completedDate" && sortOrder === "asc" ? "desc" : "asc");
                            setCurrentPage(1);
                          }}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Completed Date</span>
                            {sortBy === "completedDate" && (
                              <span className="text-emerald-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSortBy("soldQuantity");
                            setSortOrder(sortBy === "soldQuantity" && sortOrder === "asc" ? "desc" : "asc");
                            setCurrentPage(1);
                          }}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Sold</span>
                            {sortBy === "soldQuantity" && (
                              <span className="text-emerald-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {batchHistory.map((batch) => {
                        const reasonInfo = getCompletionReasonLabel(batch.completionReason, batch.completionReasonLabel);
                        const fin = batch.financial || {};
                        return (
                          <tr key={batch._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{batch.batchNumber}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {selectedProduct?.name || "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {batch.completedDateStr
                                ? batch.completedDateStr.split("-").reverse().join("/")
                                : batch.completedDate
                                  ? new Date(batch.completedDate).toLocaleDateString("en-US")
                                  : "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reasonInfo.color}`}
                              >
                                {reasonInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-emerald-600">
                              {batch.soldQuantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-emerald-700">
                              {formatVND(fin.revenue)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  setSelectedBatch(batch);
                                  setIsDetailModalOpen(true);
                                }}
                                className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                                title="View details"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>


                {/* Pagination */}
                {batchHistoryPagination && batchHistoryPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-700">
                      Showing{" "}
                      {batchHistoryPagination.page * batchHistoryPagination.limit -
                        batchHistoryPagination.limit +
                        1}{" "}
                      -{" "}
                      {Math.min(
                        batchHistoryPagination.page * batchHistoryPagination.limit,
                        batchHistoryPagination.total
                      )}{" "}
                      of {batchHistoryPagination.total} batches
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      {[...Array(batchHistoryPagination.totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`min-w-[2.25rem] rounded-xl px-3 py-2 text-sm font-medium transition ${currentPage === index + 1 ? "bg-emerald-600 text-white shadow-sm" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(batchHistoryPagination.totalPages, prev + 1))
                        }
                        disabled={currentPage === batchHistoryPagination.totalPages}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}


      {!selectedProductId && (
        <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
          <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Please select a product to view batch history</p>
        </div>
      )}


      <BatchHistoryDetail
        isOpen={isDetailModalOpen}
        batch={selectedBatch}
        product={selectedProduct}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBatch(null);
        }}
      />
    </div>
  );
};
export default BatchHistoryPage;
