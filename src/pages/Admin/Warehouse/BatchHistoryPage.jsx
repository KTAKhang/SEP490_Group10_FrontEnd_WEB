import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  History,
  Package,
  Search,
  Filter,
} from "lucide-react";
import { getProductsRequest } from "../../../redux/actions/productActions";
import { getProductBatchHistoryRequest } from "../../../redux/actions/productBatchActions";
import Loading from "../../../components/Loading/Loading";

const BatchHistoryPage = () => {
  const dispatch = useDispatch();
  const { products, productsLoading } = useSelector((state) => state.product);
  const { batchHistory, batchHistoryPagination, batchHistoryLoading } = useSelector(
    (state) => state.productBatch
  );

  const [selectedProductId, setSelectedProductId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all products on mount
  useEffect(() => {
    dispatch(getProductsRequest({ page: 1, limit: 1000, sortBy: "name", sortOrder: "asc" }));
  }, [dispatch]);

  // Fetch batch history when product is selected
  useEffect(() => {
    if (selectedProductId) {
      dispatch(getProductBatchHistoryRequest(selectedProductId, { page: currentPage, limit: 20 }));
    }
  }, [dispatch, selectedProductId, currentPage]);

  // Filter products by search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  const getCompletionReasonLabel = (reason) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
            <History size={32} />
            <span>Batch History</span>
          </h1>
          <p className="text-gray-600 mt-1">View batch history for products</p>
        </div>
      </div>

      {/* Product Selection Card */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Product Dropdown/List */}
          {productsLoading ? (
            <Loading message="Loading products..." />
          ) : (
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
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
                        selectedProductId === product._id ? "bg-green-50 border-l-4 border-green-600" : ""
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
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
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
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Batch History - {selectedProduct?.name || "Loading..."}
            </h2>
            {selectedProduct && (
              <p className="text-sm text-gray-500 mt-1">
                Brand: {selectedProduct.brand} • Current Batch: #{selectedProduct.batchNumber || 1}
              </p>
            )}
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Planned
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Received
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sold
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Discarded
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Entry Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expiry Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completed Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {batchHistory.map((batch) => {
                        const reasonInfo = getCompletionReasonLabel(batch.completionReason);
                        return (
                          <tr key={batch._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{batch.batchNumber}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {batch.plannedQuantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {batch.receivedQuantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                              {batch.soldQuantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-medium">
                              {batch.discardedQuantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {batch.warehouseEntryDateStr
                                ? batch.warehouseEntryDateStr.split("-").reverse().join("/")
                                : new Date(batch.warehouseEntryDate).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {batch.expiryDateStr
                                ? batch.expiryDateStr.split("-").reverse().join("/")
                                : batch.expiryDate
                                ? new Date(batch.expiryDate).toLocaleDateString("vi-VN")
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {batch.completedDateStr
                                ? batch.completedDateStr.split("-").reverse().join("/")
                                : new Date(batch.completedDate).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reasonInfo.color}`}
                              >
                                {reasonInfo.label}
                              </span>
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
                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      {[...Array(batchHistoryPagination.totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`px-3 py-1 border rounded-lg ${
                            currentPage === index + 1
                              ? "bg-green-600 text-white border-green-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(batchHistoryPagination.totalPages, prev + 1))
                        }
                        disabled={currentPage === batchHistoryPagination.totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
    </div>
  );
};

export default BatchHistoryPage;
