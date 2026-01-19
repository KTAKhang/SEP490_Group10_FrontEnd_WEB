import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckSquare,
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  getQualityVerificationsRequest,
  getQualityVerificationByIdRequest,
  deleteQualityVerificationRequest,
} from "../../../../redux/actions/supplierActions";
import VerifyQuality from "./VerifyQuality";
import ReadQualityVerification from "./ReadQualityVerification";
import UpdateQualityVerification from "./UpdateQualityVerification";
import Loading from "../../../../components/Loading/Loading";

const QualityVerificationManagement = () => {
  const dispatch = useDispatch();
  const {
    qualityVerifications,
    qualityVerificationsLoading,
    qualityVerificationsPagination,
    deleteQualityVerificationLoading,
  } = useSelector((state) => state.supplier);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [filterResult, setFilterResult] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("verifiedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [prevDeleteLoading, setPrevDeleteLoading] = useState(false);

  // Fetch quality verifications when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      supplierId: filterSupplier !== "all" ? filterSupplier : undefined,
      verificationResult: filterResult !== "all" ? filterResult : undefined,
      sortBy,
      sortOrder,
    };
    dispatch(getQualityVerificationsRequest(params));
  }, [dispatch, currentPage, filterSupplier, filterResult, sortBy, sortOrder]);

  // Auto refresh after successful delete
  useEffect(() => {
    if (prevDeleteLoading && !deleteQualityVerificationLoading) {
      const params = {
        page: currentPage,
        limit: 10,
        supplierId: filterSupplier !== "all" ? filterSupplier : undefined,
        verificationResult: filterResult !== "all" ? filterResult : undefined,
        sortBy,
        sortOrder,
      };
      dispatch(getQualityVerificationsRequest(params));
    }
    setPrevDeleteLoading(deleteQualityVerificationLoading);
  }, [dispatch, deleteQualityVerificationLoading, prevDeleteLoading, currentPage, filterSupplier, filterResult, sortBy, sortOrder]);

  const handleAddVerification = () => {
    setShowCreateModal(true);
  };

  const handleViewVerification = (verification) => {
    setSelectedVerification(verification);
    setShowReadModal(true);
    dispatch(getQualityVerificationByIdRequest(verification._id));
  };

  const handleEditVerification = (verification) => {
    setSelectedVerification(verification);
    dispatch(getQualityVerificationByIdRequest(verification._id));
    setShowUpdateModal(true);
  };

  const handleDeleteVerification = (verification) => {
    if (window.confirm(`Bạn có chắc muốn xóa xác minh chất lượng này?`)) {
      dispatch(deleteQualityVerificationRequest(verification._id));
    }
  };

  const getResultBadge = (result) => {
    switch (result) {
      case "PASSED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Passed
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Failed
          </span>
        );
      case "CONDITIONAL":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle size={12} className="mr-1" />
            Conditional
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
            <CheckSquare size={32} />
            <span>Quality Verification Management</span>
          </h1>
          <p className="text-gray-600 mt-1">Verify product quality from suppliers</p>
        </div>
        <button
          onClick={handleAddVerification}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={18} />
          <span>Verify Quality</span>
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="text-gray-400" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Result Filter */}
          <div>
            <select
              value={filterResult}
              onChange={(e) => {
                setFilterResult(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Results</option>
              <option value="PASSED">Passed</option>
              <option value="FAILED">Failed</option>
              <option value="CONDITIONAL">Conditional</option>
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
              <option value="verifiedAt">Verified Date</option>
              <option value="overallScore">Overall Score</option>
              <option value="approvedQuantity">Approved Quantity</option>
              <option value="rejectedQuantity">Rejected Quantity</option>
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

      {/* Quality Verifications Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Quality Verifications</h2>
          {qualityVerificationsPagination && (
            <p className="text-sm text-gray-500 mt-1">
              Total: {qualityVerificationsPagination.total} verifications
            </p>
          )}
        </div>

        <div className="p-6">
          {qualityVerificationsLoading ? (
            <Loading message="Loading quality verifications..." />
          ) : qualityVerifications.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No quality verifications found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Harvest Batch
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overall Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approved
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rejected
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verified Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {qualityVerifications.map((verification) => (
                      <tr key={verification._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{verification.supplier?.name || "N/A"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{verification.product?.name || "N/A"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{verification.harvestBatch?.batchNumber || "N/A"}</p>
                        </td>
                        <td className="px-4 py-3">
                          {getResultBadge(verification.verificationResult)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">
                            {verification.overallScore || 0}/100
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{verification.approvedQuantity || 0}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{verification.rejectedQuantity || 0}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{formatDate(verification.verifiedAt)}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewVerification(verification)}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                              title="View Details"
                            >
                              <Eye size={16} />
                              <span>View</span>
                            </button>
                            {(!verification.harvestBatch || verification.harvestBatch?.receivedQuantity === 0) && (
                              <>
                                <button
                                  onClick={() => handleEditVerification(verification)}
                                  className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteVerification(verification)}
                                  disabled={deleteQualityVerificationLoading}
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
              {qualityVerificationsPagination && qualityVerificationsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    {qualityVerificationsPagination.page * qualityVerificationsPagination.limit -
                      qualityVerificationsPagination.limit +
                      1}{" "}
                    -{" "}
                    {Math.min(
                      qualityVerificationsPagination.page * qualityVerificationsPagination.limit,
                      qualityVerificationsPagination.total
                    )}{" "}
                    of {qualityVerificationsPagination.total} verifications
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(qualityVerificationsPagination.totalPages)].map((_, index) => (
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
                        setCurrentPage((prev) => Math.min(qualityVerificationsPagination.totalPages, prev + 1))
                      }
                      disabled={currentPage === qualityVerificationsPagination.totalPages}
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
        <VerifyQuality
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            // Refresh list
            const params = {
              page: currentPage,
              limit: 10,
              supplierId: filterSupplier !== "all" ? filterSupplier : undefined,
              verificationResult: filterResult !== "all" ? filterResult : undefined,
              sortBy,
              sortOrder,
            };
            dispatch(getQualityVerificationsRequest(params));
          }}
        />
      )}

      {showReadModal && selectedVerification && (
        <ReadQualityVerification
          isOpen={showReadModal}
          onClose={() => {
            setShowReadModal(false);
            setSelectedVerification(null);
          }}
          verificationId={selectedVerification._id}
        />
      )}

      {showUpdateModal && selectedVerification && (
        <UpdateQualityVerification
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedVerification(null);
            // Refresh list
            const params = {
              page: currentPage,
              limit: 10,
              supplierId: filterSupplier !== "all" ? filterSupplier : undefined,
              verificationResult: filterResult !== "all" ? filterResult : undefined,
              sortBy,
              sortOrder,
            };
            dispatch(getQualityVerificationsRequest(params));
          }}
          verification={selectedVerification}
        />
      )}
    </div>
  );
};

export default QualityVerificationManagement;
