import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, History, Package, Search, Eye } from "lucide-react";
import { getProductBatchHistoryRequest } from "../../../redux/actions/productBatchActions";
import Loading from "../../../components/Loading/Loading";
import BatchHistoryDetail from "./BatchHistoryDetail";

const ProductBatchHistory = ({ isOpen, onClose, product }) => {
  const dispatch = useDispatch();
  const { batchHistory, batchHistoryPagination, batchHistoryLoading } = useSelector(
    (state) => state.productBatch
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [completionReason, setCompletionReason] = useState("");
  const [sortBy, setSortBy] = useState("batchNumber");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && product?._id) {
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(completionReason && { completionReason }),
        sortBy,
        sortOrder,
      };
      dispatch(getProductBatchHistoryRequest(product._id, params));
    }
  }, [dispatch, isOpen, product?._id, currentPage, searchTerm, completionReason, sortBy, sortOrder]);

  if (!isOpen || !product) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <History size={24} />
            <span>Batch History - {product.name}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-transparent text-sm"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-transparent text-sm"
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
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-transparent text-sm"
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
                            <span className="text-green-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setSortBy("plannedQuantity");
                          setSortOrder(sortBy === "plannedQuantity" && sortOrder === "asc" ? "desc" : "asc");
                          setCurrentPage(1);
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Planned</span>
                          {sortBy === "plannedQuantity" && (
                            <span className="text-green-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setSortBy("receivedQuantity");
                          setSortOrder(sortBy === "receivedQuantity" && sortOrder === "asc" ? "desc" : "asc");
                          setCurrentPage(1);
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Received</span>
                          {sortBy === "receivedQuantity" && (
                            <span className="text-green-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
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
                            <span className="text-green-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setSortBy("discardedQuantity");
                          setSortOrder(sortBy === "discardedQuantity" && sortOrder === "asc" ? "desc" : "asc");
                          setCurrentPage(1);
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Discarded</span>
                          {sortBy === "discardedQuantity" && (
                            <span className="text-green-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entry Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry Date
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
                            <span className="text-green-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit cost
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit sell
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gross profit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inventory loss
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bán đúng giá (SL)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bán xả kho (SL)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                              : new Date(batch.warehouseEntryDate).toLocaleDateString("en-US")}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {batch.expiryDateStr
                              ? batch.expiryDateStr.split("-").reverse().join("/")
                              : batch.expiryDate
                              ? new Date(batch.expiryDate).toLocaleDateString("en-US")
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {batch.completedDateStr
                              ? batch.completedDateStr.split("-").reverse().join("/")
                              : new Date(batch.completedDate).toLocaleDateString("en-US")}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reasonInfo.color}`}
                            >
                              {reasonInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {formatVND(batch.unitCostPrice)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {formatVND(batch.unitSellPrice)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700 font-medium">
                            {formatVND(fin.revenue)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {formatVND(fin.grossProfit)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-medium">
                            {formatVND(fin.inventoryLoss)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {fin.fullPriceQuantity ?? batch.fullPriceQuantity ?? 0}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-amber-700">
                            {fin.clearanceQuantity ?? batch.clearanceQuantity ?? 0}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBatch(batch);
                                setIsDetailModalOpen(true);
                              }}
                              className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                              title="Details"
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
                    Showing {batchHistoryPagination.page * batchHistoryPagination.limit - batchHistoryPagination.limit + 1} -{" "}
                    {Math.min(batchHistoryPagination.page * batchHistoryPagination.limit, batchHistoryPagination.total)} of{" "}
                    {batchHistoryPagination.total} batches
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
                      onClick={() => setCurrentPage((prev) => Math.min(batchHistoryPagination.totalPages, prev + 1))}
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

        <div className="flex items-center justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>

      <BatchHistoryDetail
        isOpen={isDetailModalOpen}
        batch={selectedBatch}
        product={product}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBatch(null);
        }}
      />
    </div>
  );
};

export default ProductBatchHistory;
