import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Package,
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import {
  getHarvestBatchesRequest,
  getHarvestBatchByIdRequest,
  deleteHarvestBatchRequest,
} from "../../../../redux/actions/supplierActions";
import CreateHarvestBatch from "./CreateHarvestBatch";
import ReadHarvestBatch from "./ReadHarvestBatch";
import Loading from "../../../../components/Loading/Loading";

const HarvestBatchManagement = () => {
  const dispatch = useDispatch();
  const {
    harvestBatches,
    harvestBatchesLoading,
    harvestBatchesPagination,
    deleteHarvestBatchLoading,
  } = useSelector((state) => state.supplier);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Fetch harvest batches when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined,
      supplierId: filterSupplier !== "all" ? filterSupplier : undefined,
      status: filterStatus !== "all" ? filterStatus : undefined,
      sortBy,
      sortOrder,
    };
    dispatch(getHarvestBatchesRequest(params));
  }, [dispatch, currentPage, searchTerm, filterSupplier, filterStatus, sortBy, sortOrder]);

  const handleAddBatch = () => {
    setShowCreateModal(true);
  };

  const handleViewBatch = (batch) => {
    setSelectedBatch(batch);
    setShowReadModal(true);
    dispatch(getHarvestBatchByIdRequest(batch._id));
  };

  const handleDeleteBatch = (batch) => {
    if (window.confirm(`Bạn có chắc muốn xóa lô thu hoạch "${batch.batchNumber}"?`)) {
      dispatch(deleteHarvestBatchRequest(batch._id));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle size={12} className="mr-1" />
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Rejected
          </span>
        );
      default:
        return <span className="text-gray-500">N/A</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
            <Package size={32} />
            <span>Harvest Batch Management</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage harvest batches from suppliers</p>
        </div>
        <button
          onClick={handleAddBatch}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={18} />
          <span>Add Harvest Batch</span>
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="text-gray-400" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by batch number or code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="createdAt">Created Date</option>
              <option value="harvestDate">Harvest Date</option>
              <option value="batchNumber">Batch Number</option>
              <option value="quantity">Quantity</option>
            </select>
            <button
              onClick={() => {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Harvest Batches Table */}
      <div className="bg-white rounded-lg border shadow-sm">
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
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch Number
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
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Received
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
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
                          <p className="text-sm font-medium text-gray-900">{batch.batchCode || "N/A"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{batch.batchNumber}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{batch.supplier?.name || "N/A"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{batch.product?.name || "N/A"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-900">{formatDate(batch.harvestDate)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{batch.quantity || 0} KG</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{batch.receivedQuantity || 0} KG</p>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(batch.status)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewBatch(batch)}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                              title="View Details"
                            >
                              <Eye size={16} />
                              <span>View</span>
                            </button>
                            {batch.receivedQuantity === 0 && (
                              <>
                                <button
                                  className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteBatch(batch)}
                                  disabled={deleteHarvestBatchLoading}
                                  className="text-red-600 hover:text-red-900 flex items-center space-x-1 disabled:opacity-50"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                  <span>Delete</span>
                                </button>
                              </>
                            )}
                          </div>
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
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(harvestBatchesPagination.totalPages)].map((_, index) => (
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
                        setCurrentPage((prev) => Math.min(harvestBatchesPagination.totalPages, prev + 1))
                      }
                      disabled={currentPage === harvestBatchesPagination.totalPages}
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

      {/* Modals */}
      {showCreateModal && (
        <CreateHarvestBatch
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            // Refresh list
            const params = {
              page: currentPage,
              limit: 10,
              search: searchTerm || undefined,
              supplierId: filterSupplier !== "all" ? filterSupplier : undefined,
              status: filterStatus !== "all" ? filterStatus : undefined,
              sortBy,
              sortOrder,
            };
            dispatch(getHarvestBatchesRequest(params));
          }}
        />
      )}

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
