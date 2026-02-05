import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ClipboardList,
  Package,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Eye,
} from "lucide-react";
import { getReceiptHistoryRequest } from "../../../redux/actions/inventoryActions";
import { getProductsRequest } from "../../../redux/actions/productActions";
import Loading from "../../../components/Loading/Loading";
import ReceiptDetailModal from "./ReceiptDetailModal";

const ReceiptHistoryPage = () => {
  const dispatch = useDispatch();
  const { receiptHistory, receiptHistoryPagination, receiptHistoryLoading } = useSelector(
    (state) => state.inventory
  );
  const { products } = useSelector((state) => state.product);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);

  // Fetch products on mount for filter
  useEffect(() => {
    dispatch(getProductsRequest({ page: 1, limit: 1000, sortBy: "name", sortOrder: "asc" }));
  }, [dispatch]);

  // Fetch receipt history when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 20,
      ...(selectedProductId && { productId: selectedProductId }),
      ...(searchTerm && { search: searchTerm }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      sortBy,
      sortOrder,
    };
    dispatch(getReceiptHistoryRequest(params));
  }, [dispatch, currentPage, selectedProductId, searchTerm, startDate, endDate, sortBy, sortOrder]);

  const handleResetFilters = () => {
    setSelectedProductId("");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field with default desc order
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const handleViewDetail = (receiptId) => {
    setSelectedReceiptId(receiptId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReceiptId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <ClipboardList size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Receipt History</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track stock receipt history by warehouse staff</p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="text-gray-400" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Product Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">All products</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} {product.brand && `(${product.brand})`}
                </option>
              ))}
            </select>
          </div>

          {/* Search by Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search note
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search in notes..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                min={startDate || undefined}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="createdAt">Date</option>
              <option value="quantity">Quantity</option>
              <option value="updatedAt">Updated Date</option>
            </select>
            <button
              onClick={() => {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                setCurrentPage(1);
              }}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm transition hover:bg-gray-50"
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        {/* Reset Filters Button */}
        {(selectedProductId || searchTerm || startDate || endDate || sortBy !== "createdAt" || sortOrder !== "desc") && (
          <div className="mt-4">
            <button
              onClick={handleResetFilters}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Receipt History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Receipt History</h2>
          {receiptHistoryPagination && (
            <p className="text-sm text-gray-500 mt-1">
              Total: {receiptHistoryPagination.total} receipts
            </p>
          )}
        </div>

        <div className="p-6">
          {receiptHistoryLoading ? (
            <Loading message="Loading receipt history..." />
          ) : receiptHistory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No receipt history found</p>
              <p className="text-sm text-gray-500 mt-2">
                Receipt history will appear here after warehouse staff receive stock
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange("quantity")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Quantity</span>
                          {sortBy === "quantity" && (
                            <span className="text-emerald-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Harvest Batch
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Received By
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Note
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange("createdAt")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Date</span>
                          {sortBy === "createdAt" && (
                            <span className="text-emerald-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {receiptHistory.map((receipt) => (
                      <tr key={receipt._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            {receipt.product?.images && receipt.product.images.length > 0 && (
                              <img
                                src={receipt.product.images[0]}
                                alt={receipt.product.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {receipt.product?.name || "N/A"}
                              </p>
                              {receipt.product?.brand && (
                                <p className="text-xs text-gray-500">{receipt.product.brand}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {receipt.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {receipt.harvestBatch ? (
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center space-x-1">
                                <Package className="text-blue-400" size={14} />
                                <span className="text-sm font-medium text-gray-900">
                                  {receipt.harvestBatch.batchCode || receipt.harvestBatch.batchNumber || "N/A"}
                                </span>
                              </div>
                              {receipt.harvestBatch.harvestDateStr && (
                                <span className="text-xs text-gray-500">
                                  {receipt.harvestBatch.harvestDateStr}
                                </span>
                              )}
                              {receipt.harvestBatch.supplier && (
                                <span className="text-xs text-gray-500">
                                  {receipt.harvestBatch.supplier.name || receipt.harvestBatch.supplier.code || ""}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {receipt.createdBy ? (
                            <div className="flex items-center space-x-2">
                              <User className="text-gray-400" size={16} />
                              <div>
                                <p className="text-sm text-gray-900">
                                  {receipt.createdBy.user_name || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {receipt.createdBy.email || ""}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {receipt.note ? (
                            <div className="flex items-center space-x-1">
                              <FileText className="text-gray-400" size={14} />
                              <span className="text-sm text-gray-700">{receipt.note}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {receipt.createdAt
                            ? new Date(receipt.createdAt).toLocaleString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetail(receipt._id)}
                            className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                            title="View detail"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {receiptHistoryPagination && receiptHistoryPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    {receiptHistoryPagination.page * receiptHistoryPagination.limit -
                      receiptHistoryPagination.limit +
                      1}{" "}
                    -{" "}
                    {Math.min(
                      receiptHistoryPagination.page * receiptHistoryPagination.limit,
                      receiptHistoryPagination.total
                    )}{" "}
                    of {receiptHistoryPagination.total} receipts
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(receiptHistoryPagination.totalPages)].map((_, index) => (
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
                        setCurrentPage((prev) => Math.min(receiptHistoryPagination.totalPages, prev + 1))
                      }
                      disabled={currentPage === receiptHistoryPagination.totalPages}
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

      {/* Receipt Detail Modal */}
      <ReceiptDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        receiptId={selectedReceiptId}
      />
    </div>
  );
};

export default ReceiptHistoryPage;
