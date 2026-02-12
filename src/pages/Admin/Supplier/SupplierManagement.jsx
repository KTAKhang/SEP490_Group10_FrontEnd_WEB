import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Truck,
  Building2,
  Search,
  Plus,
  Edit,
  Eye,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
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
  const [filterCooperationStatus, setFilterCooperationStatus] = useState("all"); // all, ACTIVE, TERMINATED
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Supplier Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage suppliers (Farm / Cooperative)</p>
          </div>
        </div>
        <button onClick={handleAddSupplier} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 hover:shadow w-full sm:w-auto">
          <Plus size={18} />
          Add Supplier
        </button>
      </div>


      {/* Filters Card */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Search & filters</p>


        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
              className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="cooperationStatus">Cooperation Status</option>
              <option value="totalBatches">Total Batches</option>
              <option value="totalProductsSupplied">Total Products Supplied</option>
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
      </div>


      {/* Suppliers Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-800">Suppliers</h2>
          {suppliersPagination && (
            <p className="text-sm text-gray-500 mt-1">
              Total: {suppliersPagination.total} suppliers
            </p>
          )}
        </div>


        <div className="p-5">
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
                          {supplier.status ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
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
                              className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEditSupplier(supplier)}
                              className="rounded-xl p-2 text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleUpdateCooperationStatus(supplier)}
                              className="rounded-xl p-2 text-amber-600 transition hover:bg-amber-50 hover:text-amber-700"
                              title="Cooperation status"
                            >
                              <Users size={18} />
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
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(suppliersPagination.totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`min-w-[2.25rem] rounded-xl px-3 py-2 text-sm font-medium transition ${
                          currentPage === index + 1 ? "bg-emerald-600 text-white shadow-sm" : "border border-gray-200 text-gray-700 hover:bg-gray-50"
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




