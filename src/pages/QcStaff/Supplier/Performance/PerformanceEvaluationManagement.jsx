import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart3,
  Search,
  Plus,
  Eye,
  Filter,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  getPerformancesRequest,
  getPerformanceByIdRequest,
} from "../../../../redux/actions/supplierActions";
import EvaluatePerformance from "./EvaluatePerformance";
import ReadPerformance from "./ReadPerformance";
import Loading from "../../../../components/Loading/Loading";

const PerformanceEvaluationManagement = () => {
  const dispatch = useDispatch();
  const {
    performances,
    performancesLoading,
    performancesPagination,
  } = useSelector((state) => state.supplier);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("period");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState(null);

  // Fetch performances when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      supplierId: filterSupplier !== "all" ? filterSupplier : undefined,
      rating: filterRating !== "all" ? filterRating : undefined,
      sortBy,
      sortOrder,
    };
    dispatch(getPerformancesRequest(params));
  }, [dispatch, currentPage, filterSupplier, filterRating, sortBy, sortOrder]);

  const handleAddPerformance = () => {
    setShowCreateModal(true);
  };

  const handleViewPerformance = (performance) => {
    setSelectedPerformance(performance);
    setShowReadModal(true);
    dispatch(getPerformanceByIdRequest(performance._id));
  };

  const getRatingBadge = (rating) => {
    switch (rating) {
      case "EXCELLENT":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Excellent
          </span>
        );
      case "GOOD":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Good
          </span>
        );
      case "FAIR":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Fair
          </span>
        );
      case "POOR":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Poor
          </span>
        );
      default:
        return <span className="text-gray-500">N/A</span>;
    }
  };

  const formatPeriod = (period) => {
    if (!period) return "N/A";
    const [year, month] = period.split("-");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
            <BarChart3 size={32} />
            <span>Performance Evaluation Management</span>
          </h1>
          <p className="text-gray-600 mt-1">Evaluate supplier performance</p>
        </div>
        <button
          onClick={handleAddPerformance}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={18} />
          <span>Evaluate Performance</span>
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="text-gray-400" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rating Filter */}
          <div>
            <select
              value={filterRating}
              onChange={(e) => {
                setFilterRating(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
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
              <option value="period">Period</option>
              <option value="overallScore">Overall Score</option>
              <option value="rating">Rating</option>
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

      {/* Performances Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Performance Evaluations</h2>
          {performancesPagination && (
            <p className="text-sm text-gray-500 mt-1">
              Total: {performancesPagination.total} evaluations
            </p>
          )}
        </div>

        <div className="p-6">
          {performancesLoading ? (
            <Loading message="Loading performance evaluations..." />
          ) : performances.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No performance evaluations found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overall Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quality Rate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery Rate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Batches
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {performances.map((performance) => (
                      <tr key={performance._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatPeriod(performance.period)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{performance.supplier?.name || "N/A"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <TrendingUp size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {performance.overallScore || 0}/100
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getRatingBadge(performance.rating)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">
                            {performance.metrics?.qualityRate || 0}%
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">
                            {performance.metrics?.onTimeDeliveryRate || 0}%
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">
                            {performance.metrics?.totalBatches || 0}
                          </p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewPerformance(performance)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                            title="View Details"
                          >
                            <Eye size={16} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {performancesPagination && performancesPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    {performancesPagination.page * performancesPagination.limit -
                      performancesPagination.limit +
                      1}{" "}
                    -{" "}
                    {Math.min(
                      performancesPagination.page * performancesPagination.limit,
                      performancesPagination.total
                    )}{" "}
                    of {performancesPagination.total} evaluations
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(performancesPagination.totalPages)].map((_, index) => (
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
                        setCurrentPage((prev) => Math.min(performancesPagination.totalPages, prev + 1))
                      }
                      disabled={currentPage === performancesPagination.totalPages}
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
        <EvaluatePerformance
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            // Refresh list
            const params = {
              page: currentPage,
              limit: 10,
              supplierId: filterSupplier !== "all" ? filterSupplier : undefined,
              rating: filterRating !== "all" ? filterRating : undefined,
              sortBy,
              sortOrder,
            };
            dispatch(getPerformancesRequest(params));
          }}
        />
      )}

      {showReadModal && selectedPerformance && (
        <ReadPerformance
          isOpen={showReadModal}
          onClose={() => {
            setShowReadModal(false);
            setSelectedPerformance(null);
          }}
          performanceId={selectedPerformance._id}
        />
      )}
    </div>
  );
};

export default PerformanceEvaluationManagement;
