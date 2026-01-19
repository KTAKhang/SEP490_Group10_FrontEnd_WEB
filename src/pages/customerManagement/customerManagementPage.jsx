/**
 * author: KhoanDCE170420
 * customerManagementPage.jsx
 * Customer Management Page Component
 */
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { customerListRequest, updateCustomerStatusRequest, customerDetailRequest } from "../../redux/actions/customerActions";

const CustomerManagement = () => {
  const dispatch = useDispatch();
  const { list = [], loading, pagination: pageMeta = { page: 1, limit: 10, total: 0 } } = useSelector((state) => state.customer || {});

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isGoogleAccountFilter, setIsGoogleAccountFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Confirmation modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'ban' or 'unban'
  const [confirmCustomer, setConfirmCustomer] = useState(null);
  const [confirmationText, setConfirmationText] = useState("");

  // Load customers with current filters
  const loadCustomers = useCallback((query = {}) => {
    const payload = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sortBy: query.sortBy ?? sortBy,
      sortOrder: query.sortOrder ?? sortOrder,
    };
    if (query.status) payload.status = query.status;
    if (query.isGoogleAccount !== undefined) payload.isGoogleAccount = query.isGoogleAccount;
    if (query.keyword) payload.keyword = query.keyword;
    dispatch(customerListRequest(payload));
  }, [dispatch, sortBy, sortOrder]);

  useEffect(() => {
    // Initial load
    loadCustomers({ page: 1, limit: 10, sortBy: "createdAt", sortOrder: "desc" });
  }, []);

  // Auto-load when filters change with debounce for search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const query = {};
      let hasFilters = false;

      if (statusFilter !== "all") {
        query.status = statusFilter;
        hasFilters = true;
      }

      if (isGoogleAccountFilter !== "all") {
        query.isGoogleAccount = isGoogleAccountFilter === "true";
        hasFilters = true;
      }

      if (searchText.trim()) {
        query.keyword = searchText.trim();
        hasFilters = true;
      }

      loadCustomers({ ...query, page: 1 });
    }, searchText.trim() ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [searchText, statusFilter, isGoogleAccountFilter, loadCustomers]);

  const customers = useMemo(() => {
    return (list || []);
  }, [list]);

  const filteredCustomers = customers;

  // Check if any filters are active
  const hasActiveFilters = searchText.trim() || statusFilter !== "all" || isGoogleAccountFilter !== "all";

  // Create filter summary text
  const getFilterSummary = () => {
    const filters = [];
    if (statusFilter !== "all") {
      filters.push(`Status: ${statusFilter === "active" ? "Active" : "Inactive"}`);
    }
    if (isGoogleAccountFilter !== "all") {
      filters.push(`Account Type: ${isGoogleAccountFilter === "true" ? "Google Account" : "Regular Account"}`);
    }
    if (searchText.trim()) {
      filters.push(`Search: "${searchText.trim()}"`);
    }
    return filters.length > 0 ? filters.join(" • ") : "";
  };

  // Helpers to support both boolean and legacy string status values
  const isActive = (status) => status === true || status === "active";
  const toDisplayStatusText = (status) => (isActive(status) ? "Active" : "Inactive");

  // Calculate stats from current list (filtered/paginated)
  const displayStats = {
    total: pageMeta.total || 0,
    active: customers.filter(c => isActive(c.status)).length,
    inactive: customers.filter(c => !isActive(c.status)).length,
  };

  const handleRefresh = useCallback(() => {
    setLoadingRefresh(true);
    const query = { page: pageMeta.page, limit: pageMeta.limit, sortBy, sortOrder };
    if (statusFilter !== "all") query.status = statusFilter;
    if (isGoogleAccountFilter !== "all") query.isGoogleAccount = isGoogleAccountFilter === "true";
    if (searchText.trim()) query.keyword = searchText.trim();

    loadCustomers(query);
    setTimeout(() => setLoadingRefresh(false), 450);
  }, [loadCustomers, statusFilter, isGoogleAccountFilter, searchText, pageMeta.page, pageMeta.limit, sortBy, sortOrder]);

  const handleStatusToggle = (record) => {
    const active = isActive(record.status);
    setConfirmCustomer(record);
    setConfirmAction(active ? 'ban' : 'unban');
    setConfirmationText("");
    setIsConfirmModalOpen(true);
  };

  const handleConfirmStatusChange = () => {
    const requiredText = confirmAction === 'ban' ? 'BAN' : 'UNBAN';

    if (confirmationText.trim().toUpperCase() !== requiredText) {
      return;
    }

    const current = confirmCustomer.status;
    const newStatus = typeof current === "boolean" ? !current : (current === "active" ? "inactive" : "active");
    dispatch(updateCustomerStatusRequest(confirmCustomer._id || confirmCustomer.id, newStatus));

    setIsConfirmModalOpen(false);
    setConfirmCustomer(null);
    setConfirmAction(null);
    setConfirmationText("");
  };

  const handleViewDetail = (record) => {
    setSelectedCustomer(record);
    setIsDetailOpen(true);
  };

  const handleTableChange = (newPage) => {
    const query = { page: newPage, limit: pageMeta.limit, sortBy, sortOrder };
    if (statusFilter !== "all") query.status = statusFilter;
    if (isGoogleAccountFilter !== "all") query.isGoogleAccount = isGoogleAccountFilter === "true";
    if (searchText.trim()) query.keyword = searchText.trim();
    loadCustomers(query);
  };

  const handleLimitChange = (newLimit) => {
    const query = { page: 1, limit: newLimit, sortBy, sortOrder };
    if (statusFilter !== "all") query.status = statusFilter;
    if (isGoogleAccountFilter !== "all") query.isGoogleAccount = isGoogleAccountFilter === "true";
    if (searchText.trim()) query.keyword = searchText.trim();
    loadCustomers(query);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    const toast = document.createElement('div');
    toast.textContent = 'Copied to clipboard!';
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  // UI Components
  const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${color.replace('text', 'bg').replace('600', '100')} flex items-center justify-center`}>
          <i className={`${icon} text-2xl ${color}`}></i>
        </div>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const active = isActive(status);
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        <i className={`${active ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'} mr-1`}></i>
        {toDisplayStatusText(status)}
      </span>
    );
  };

  const AccountTypeBadge = ({ isGoogleAccount }) => {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isGoogleAccount ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
        <i className={`${isGoogleAccount ? 'ri-google-fill' : 'ri-mail-line'} mr-1`}></i>
        {isGoogleAccount ? "Google Account" : "Regular Account"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
          <p className="text-gray-600">Manage customer information and account status</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard icon="ri-user-line" title="Total Customers" value={displayStats.total} color="text-green-600" />
          <StatCard icon="ri-checkbox-circle-line" title="Active" value={displayStats.active} color="text-green-600" />
          <StatCard icon="ri-close-circle-line" title="Inactive" value={displayStats.inactive} color="text-red-600" />
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Filter Bar */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone number..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                  {searchText && (
                    <button
                      onClick={() => setSearchText("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  )}
                </div>
              </div>

              <select
                value={sortBy === "createdAt" ? "createdAt" : "name"}
                onChange={(e) => {
                  const val = e.target.value;
                  const nextSortBy = val;
                  const nextSortOrder = val === "createdAt" ? "desc" : "asc";
                  setSortBy(nextSortBy);
                  setSortOrder(nextSortOrder);
                  const query = { page: 1, limit: pageMeta.limit, sortBy: nextSortBy, sortOrder: nextSortOrder };
                  if (statusFilter !== "all") query.status = statusFilter;
                  if (isGoogleAccountFilter !== "all") query.isGoogleAccount = isGoogleAccountFilter === "true";
                  if (searchText.trim()) query.keyword = searchText.trim();
                  loadCustomers(query);
                }}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="createdAt">Sort by: Created Date (Newest)</option>
                <option value="name">Sort by: Alphabetical (A→Z)</option>
              </select>

              <select
                value={isGoogleAccountFilter}
                onChange={(e) => setIsGoogleAccountFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="all">All Account Types</option>
                <option value="true">Google Account</option>
                <option value="false">Regular Account</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                {hasActiveFilters && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Showing filtered results: {getFilterSummary()}</span>
                    <button
                      onClick={() => {
                        setSearchText("");
                        setStatusFilter("all");
                        setIsGoogleAccountFilter("all");
                      }}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={loadingRefresh}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <i className={`ri-refresh-line ${loadingRefresh ? 'animate-spin' : ''}`}></i>
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading || loadingRefresh ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <i className="ri-loader-4-line text-4xl text-green-600 animate-spin"></i>
                  <p className="text-gray-600">Loading customers...</p>
                </div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <i className="ri-user-line text-6xl text-gray-300 mb-3"></i>
                <p className="text-gray-600">No customers found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Account Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((record) => (
                    <tr key={record._id || record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                            {record.avatar ? (
                              <img src={record.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <i className="ri-user-line text-xl text-green-600"></i>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{record.user_name}</p>
                            <p className="text-sm text-gray-600">{record.email}</p>
                            <button
                              onClick={() => copyToClipboard(record._id || record.id)}
                              className="text-xs text-gray-400 hover:text-gray-600 mt-1 flex items-center gap-1"
                              title="Click to copy ID"
                            >
                              <i className="ri-file-copy-line"></i>
                              ID: {record._id || record.id}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {record.createdAt ? (
                          <span className="text-sm text-gray-700">
                            {new Date(record.createdAt).toLocaleDateString('en-US', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-700 flex items-center gap-1">
                            <i className="ri-phone-line"></i>
                            {record.phone || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <i className="ri-map-pin-line"></i>
                            {record.address || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <AccountTypeBadge isGoogleAccount={record.isGoogleAccount} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(record)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <i className="ri-eye-line text-lg"></i>
                          </button>
                          <button
                            onClick={() => handleStatusToggle(record)}
                            className={`p-2 rounded-lg transition-colors ${isActive(record.status)
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                              }`}
                            title={isActive(record.status) ? "Disable" : "Enable"}
                          >
                            <i className={`text-lg ${isActive(record.status) ? 'ri-close-circle-line' : 'ri-checkbox-circle-line'}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {filteredCustomers.length > 0 && (
            <div className="p-6 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Displaying {((pageMeta.page - 1) * pageMeta.limit) + 1}-{Math.min(pageMeta.page * pageMeta.limit, pageMeta.total)} of {pageMeta.total} customers
                {hasActiveFilters && <span className="text-green-600 ml-1">(filtered)</span>}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={pageMeta.limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleTableChange(pageMeta.page - 1)}
                    disabled={pageMeta.page === 1}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="ri-arrow-left-s-line"></i>
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-700">
                    Page {pageMeta.page} of {Math.ceil(pageMeta.total / pageMeta.limit) || 1}
                  </span>
                  <button
                    onClick={() => handleTableChange(pageMeta.page + 1)}
                    disabled={pageMeta.page >= Math.ceil(pageMeta.total / pageMeta.limit)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="ri-arrow-right-s-line"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Confirmation Modal for Ban/Unban */}
      {isConfirmModalOpen && confirmCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full ${confirmAction === 'ban' ? 'bg-red-100' : 'bg-green-100'} flex items-center justify-center flex-shrink-0`}>
                  <i className={`${confirmAction === 'ban' ? 'ri-alert-line text-red-600' : 'ri-checkbox-circle-line text-green-600'} text-2xl`}></i>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {confirmAction === 'ban' ? '⚠️ Confirm Account Deactivation' : '✓ Confirm Account Activation'}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {confirmAction === 'ban'
                      ? 'You are about to deactivate the account of customer:'
                      : 'You are about to activate the account of customer:'}
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 font-medium">•</span>
                        <div>
                          <span className="text-gray-600 font-medium">Name:</span>
                          <span className="text-gray-900 ml-2">{confirmCustomer.user_name}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 font-medium">•</span>
                        <div>
                          <span className="text-gray-600 font-medium">Email:</span>
                          <span className="text-gray-900 ml-2">{confirmCustomer.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      {confirmAction === 'ban' ? 'This action will:' : 'This action will:'}
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {confirmAction === 'ban' ? (
                        <>
                          <li className="flex items-start gap-2">
                            <span>-</span>
                            <span>Prevent the customer from logging in</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>-</span>
                            <span>Not delete order data</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>-</span>
                            <span>Can be undone later</span>
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-start gap-2">
                            <span>-</span>
                            <span>Allow the customer to log in</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>-</span>
                            <span>Restore full account access</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>-</span>
                            <span>Can be deactivated again later</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To confirm, type <span className="font-bold text-red-600">{confirmAction === 'ban' ? 'BAN' : 'UNBAN'}</span> below:
                    </label>
                    <input
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder={confirmAction === 'ban' ? 'Type BAN to confirm' : 'Type UNBAN to confirm'}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                      autoFocus
                    />
                  </div>

                  <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to proceed?
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsConfirmModalOpen(false);
                        setConfirmCustomer(null);
                        setConfirmAction(null);
                        setConfirmationText("");
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmStatusChange}
                      disabled={confirmationText.trim().toUpperCase() !== (confirmAction === 'ban' ? 'BAN' : 'UNBAN')}
                      className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${confirmAction === 'ban'
                          ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
                        }`}
                    >
                      {confirmAction === 'ban' ? 'Deactivate Account' : 'Activate Account'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {isDetailOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="ri-close-line text-xl text-gray-600"></i>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                  {selectedCustomer.avatar ? (
                    <img src={selectedCustomer.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <i className="ri-user-line text-3xl text-green-600"></i>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.user_name}</h3>
                  <p className="text-gray-600">{selectedCustomer.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <i className="ri-phone-line text-green-600"></i>
                    {selectedCustomer.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <i className="ri-map-pin-line text-green-600"></i>
                    {selectedCustomer.address || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Account Type</p>
                  <AccountTypeBadge isGoogleAccount={selectedCustomer.isGoogleAccount} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <StatusBadge status={selectedCustomer.status} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created Date</p>
                  <p className="text-gray-900">
                    {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleString('en-US') : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Customer ID</p>
                  <button
                    onClick={() => copyToClipboard(selectedCustomer._id || selectedCustomer.id)}
                    className="text-sm text-gray-700 hover:text-green-600 flex items-center gap-1"
                  >
                    <i className="ri-file-copy-line"></i>
                    {selectedCustomer._id || selectedCustomer.id}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;