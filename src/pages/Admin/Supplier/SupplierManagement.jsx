import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Search,
  Plus,
  Edit,
  Eye,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  getSuppliersRequest,
  getSupplierByIdRequest,
} from "../../../redux/actions/supplierActions";
import CreateSupplier from "./CreateSupplier";
import UpdateSupplier from "./UpdateSupplier";
import ReadSupplier from "./ReadSupplier";
import UpdateCooperationStatus from "./UpdateCooperationStatus";
import Loading from "../../../components/Loading/Loading";

const SupplierManagement = () => {
  const dispatch = useDispatch();
  const {
    suppliers,
    suppliersLoading,
    suppliersPagination,
    createSupplierLoading,
    updateSupplierLoading,
  } = useSelector((state) => state.supplier);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, FARM, COOPERATIVE
  const [filterCooperationStatus, setFilterCooperationStatus] = useState("all"); // all, ACTIVE, SUSPENDED, TERMINATED
  const [filterStatus, setFilterStatus] = useState("all"); // all, true, false
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [showCooperationStatusModal, setShowCooperationStatusModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [prevCreateLoading, setPrevCreateLoading] = useState(false);
  const [prevUpdateLoading, setPrevUpdateLoading] = useState(false);

  // Fetch suppliers when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined,
      type: filterType !== "all" ? filterType : undefined,
      cooperationStatus: filterCooperationStatus !== "all" ? filterCooperationStatus : undefined,
      status: filterStatus !== "all" ? filterStatus : undefined,
      sortBy,
      sortOrder,
    };
    dispatch(getSuppliersRequest(params));
  }, [dispatch, currentPage, searchTerm, filterType, filterCooperationStatus, filterStatus, sortBy, sortOrder]);

  // Auto refresh after successful create/update
  useEffect(() => {
    if (prevCreateLoading && !createSupplierLoading) {
      setShowCreateModal(false);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        type: filterType !== "all" ? filterType : undefined,
        cooperationStatus: filterCooperationStatus !== "all" ? filterCooperationStatus : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        sortBy,
        sortOrder,
      };
      dispatch(getSuppliersRequest(params));
    }
    setPrevCreateLoading(createSupplierLoading);
  }, [dispatch, createSupplierLoading, prevCreateLoading, currentPage, searchTerm, filterType, filterCooperationStatus, filterStatus, sortBy, sortOrder]);

  useEffect(() => {
    if (prevUpdateLoading && !updateSupplierLoading) {
      setShowUpdateModal(false);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        type: filterType !== "all" ? filterType : undefined,
        cooperationStatus: filterCooperationStatus !== "all" ? filterCooperationStatus : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        sortBy,
        sortOrder,
      };
      dispatch(getSuppliersRequest(params));
    }
    setPrevUpdateLoading(updateSupplierLoading);
  }, [dispatch, updateSupplierLoading, prevUpdateLoading, currentPage, searchTerm, filterType, filterCooperationStatus, filterStatus, sortBy, sortOrder]);

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setShowCreateModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowUpdateModal(true);
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    dispatch(getSupplierByIdRequest(supplier._id));
    setShowReadModal(true);
  };

  const handleUpdateCooperationStatus = (supplier) => {
    setSelectedSupplier(supplier);
    setShowCooperationStatusModal(true);
  };

  const getCooperationStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Active
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle size={12} className="mr-1" />
            Suspended
          </span>
        );
      case "TERMINATED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Terminated
          </span>
        );
      default:
        return <span className="text-gray-500">N/A</span>;
    }
  };

  const getTypeBadge = (type) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        type === "FARM" ? "bg-blue-100 text-blue-800" : type === "COOPERATIVE" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
      }`}>
        {type === "FARM" ? "🏭 Farm" : type === "COOPERATIVE" ? "🤝 Cooperative" : "💼 Business"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
            <Building2 size={32} />
            <span>Supplier Management</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage suppliers (Farm / Cooperative)</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddSupplier}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={18} />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="text-gray-400" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="FARM">Farm</option>
              <option value="COOPERATIVE">Cooperative</option>
              <option value="BUSINESS">Business</option>
            </select>
          </div>

          {/* Cooperation Status Filter */}
          <div>
            <select
              value={filterCooperationStatus}
              onChange={(e) => {
                setFilterCooperationStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="TERMINATED">Terminated</option>
            </select>
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
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="mt-4 flex items-center space-x-4">
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
              <option value="updatedAt">Updated Date</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="cooperationStatus">Cooperation Status</option>
              <option value="performanceScore">Performance Score</option>
              <option value="totalBatches">Total Batches</option>
              <option value="totalProductsSupplied">Total Products Supplied</option>
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

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Suppliers</h2>
          {suppliersPagination && (
            <p className="text-sm text-gray-500 mt-1">
              Total: {suppliersPagination.total} suppliers
            </p>
          )}
        </div>

        <div className="p-6">
          {suppliersLoading ? (
            <Loading message="Loading suppliers..." />
          ) : suppliers.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No suppliers found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cooperation Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
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
                    {suppliers.map((supplier) => (
                      <tr key={supplier._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{supplier.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          {getTypeBadge(supplier.type)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {supplier.contactPerson && (
                              <p>{supplier.contactPerson}</p>
                            )}
                            {supplier.phone && (
                              <p className="text-gray-500">{supplier.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getCooperationStatusBadge(supplier.cooperationStatus)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <TrendingUp size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {supplier.performanceScore || 0}/100
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {supplier.status ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <button
                              onClick={() => handleViewSupplier(supplier)}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                              title="View Details"
                            >
                              <Eye size={16} />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => handleEditSupplier(supplier)}
                              className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                              title="Edit"
                            >
                              <Edit size={16} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleUpdateCooperationStatus(supplier)}
                              className="text-orange-600 hover:text-orange-900 flex items-center space-x-1"
                              title="Update Cooperation Status"
                            >
                              <Users size={16} />
                              <span>Status</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {suppliersPagination && suppliersPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    {suppliersPagination.page * suppliersPagination.limit -
                      suppliersPagination.limit +
                      1}{" "}
                    -{" "}
                    {Math.min(
                      suppliersPagination.page * suppliersPagination.limit,
                      suppliersPagination.total
                    )}{" "}
                    of {suppliersPagination.total} suppliers
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(suppliersPagination.totalPages)].map((_, index) => (
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
                        setCurrentPage((prev) => Math.min(suppliersPagination.totalPages, prev + 1))
                      }
                      disabled={currentPage === suppliersPagination.totalPages}
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
        <CreateSupplier
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showUpdateModal && selectedSupplier && (
        <UpdateSupplier
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          supplier={selectedSupplier}
        />
      )}

      {showReadModal && selectedSupplier && (
        <ReadSupplier
          isOpen={showReadModal}
          onClose={() => setShowReadModal(false)}
          supplierId={selectedSupplier._id}
        />
      )}

      {showCooperationStatusModal && selectedSupplier && (
        <UpdateCooperationStatus
          isOpen={showCooperationStatusModal}
          onClose={() => {
            setShowCooperationStatusModal(false);
            setSelectedSupplier(null);
          }}
          supplierId={selectedSupplier._id}
          supplierName={selectedSupplier.name}
          currentStatus={selectedSupplier.cooperationStatus}
        />
      )}
    </div>
  );
};

export default SupplierManagement;
