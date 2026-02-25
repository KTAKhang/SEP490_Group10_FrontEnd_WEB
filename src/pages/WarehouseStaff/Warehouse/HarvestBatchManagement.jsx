import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Package,
  Search,
  Eye,
  Calendar,
} from "lucide-react";
import {
  getHarvestBatchesRequest,
  getHarvestBatchByIdRequest,
} from "../../../redux/actions/supplierActions";
import ReadHarvestBatch from "./ReadHarvestBatch";
import Loading from "../../../components/Loading/Loading";


const HarvestBatchManagement = () => {
  const dispatch = useDispatch();
  const {
    harvestBatches,
    harvestBatchesLoading,
    harvestBatchesPagination,
  } = useSelector((state) => state.supplier);


  const [searchTerm, setSearchTerm] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [filterReceiptEligible, setFilterReceiptEligible] = useState("all");
  const [filterVisibleInReceipt, setFilterVisibleInReceipt] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showReadModal, setShowReadModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);


  // Fetch harvest batches when filters change (only product batches; pre-order batches are hidden on this page)
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined,
      supplierId: filterSupplier !== "all" ? filterSupplier : undefined,
      receiptEligible: filterReceiptEligible !== "all" ? filterReceiptEligible === "true" : undefined,
      visibleInReceipt: filterVisibleInReceipt !== "all" ? filterVisibleInReceipt === "true" : undefined,
      sortBy,
      sortOrder,
      isPreOrderBatch: "false",
    };
    dispatch(getHarvestBatchesRequest(params));
  }, [dispatch, currentPage, searchTerm, filterSupplier, filterReceiptEligible, filterVisibleInReceipt, sortBy, sortOrder]);


  const handleViewBatch = (batch) => {
    setSelectedBatch(batch);
    setShowReadModal(true);
    dispatch(getHarvestBatchByIdRequest(batch._id));
  };


  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US");
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Harvest Batch</h1>
            <p className="text-sm text-gray-500 mt-0.5">View harvest batches from suppliers</p>
          </div>
        </div>
      </div>


      {/* Filters Card */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Search & filters</p>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative min-w-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              <input
                type="text"
                placeholder="Batch number or code..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>


          {/* Receipt Eligible */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Receipt eligible</label>
            <select
              value={filterReceiptEligible}
              onChange={(e) => {
                setFilterReceiptEligible(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>


          {/* Visible in receipt */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Visible in receipt</label>
            <select
              value={filterVisibleInReceipt}
              onChange={(e) => {
                setFilterVisibleInReceipt(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>


          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sort by</label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 min-w-0 h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="harvestDate">Harvest Date</option>
                <option value="batchNumber">Batch Number</option>
                <option value="batchCode">Batch Code</option>
                <option value="receivedQuantity">Received Quantity</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  setCurrentPage(1);
                }}
                className="h-11 w-11 shrink-0 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-600 transition hover:bg-gray-100 hover:border-gray-300 flex items-center justify-center text-sm font-medium"
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Harvest Batches Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Harvest Batches</h2>
          {harvestBatchesPagination && (
            <p className="text-sm text-gray-500 mt-1">
              Total: {harvestBatchesPagination.total} batches
            </p>
          )}
        </div>


        <div className="p-6">
          {harvestBatchesLoading ? (
            <Loading message="Loading harvest batches..." />
          ) : harvestBatches.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No harvest batches found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Harvest Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Received
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {harvestBatches.map((batch) => (
                      <tr key={batch._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{batch.batchCode || `#${batch.batchNumber}`}</p>
                          {batch.batchCode && batch.batchNumber != null && (
                            <p className="text-xs text-gray-500">#{batch.batchNumber}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{batch.supplier?.name || "N/A"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{batch.product?.name || "N/A"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-900">{formatDate(batch.harvestDate)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{batch.receivedQuantity ?? 0}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleViewBatch(batch)}
                            className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                            title="View details"
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
              {harvestBatchesPagination && harvestBatchesPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    {harvestBatchesPagination.page * harvestBatchesPagination.limit -
                      harvestBatchesPagination.limit +
                      1}{" "}
                    -{" "}
                    {Math.min(
                      harvestBatchesPagination.page * harvestBatchesPagination.limit,
                      harvestBatchesPagination.total
                    )}{" "}
                    of {harvestBatchesPagination.total} batches
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(harvestBatchesPagination.totalPages)].map((_, index) => (
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
                        setCurrentPage((prev) => Math.min(harvestBatchesPagination.totalPages, prev + 1))
                      }
                      disabled={currentPage === harvestBatchesPagination.totalPages}
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


      {/* Read Modal */}
      {showReadModal && selectedBatch && (
        <ReadHarvestBatch
          isOpen={showReadModal}
          onClose={() => {
            setShowReadModal(false);
            setSelectedBatch(null);
          }}
          harvestBatchId={selectedBatch._id}
        />
      )}
    </div>
  );
};


export default HarvestBatchManagement;
